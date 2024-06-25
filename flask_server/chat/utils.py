"""
Utils for chatting with LLM

requirements:
pip install - -default-timeout = 100 transformers
pip install - -default-timeout = 100 peft
pip install setuptools
"""
from typing import Tuple, List

import torch
import tiktoken
import transformers
from peft import PeftModel
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    BitsAndBytesConfig
)


def num_tokens_from_messages(messages, model="gpt-3.5-turbo-0125"):
    """
    Return the number of tokens used by a list of messages.
    https://cookbook.openai.com/examples/how_to_format_inputs_to_chatgpt_models
    """
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        print("Warning: model not found. Using cl100k_base encoding.")
        encoding = tiktoken.get_encoding("cl100k_base")
    if model in {
        "gpt-3.5-turbo-0125",
        "gpt-3.5-turbo-16k-0125",
        "gpt-4-0314",
        "gpt-4-32k-0314",
        "gpt-4-0613",
        "gpt-4-32k-0613", 
    }:
        tokens_per_message = 3
        tokens_per_name = 1
    elif model == "gpt-3.5-turbo-0125":
        # every message follows <|start|>{role/name}\n{content}<|end|>\n
        tokens_per_message = 4
        tokens_per_name = -1  # if there's a name, the role is omitted
    elif "gpt-3.5-turbo" in model:
        print("Warning: gpt-3.5-turbo may update over time. Returning num tokens assuming gpt-3.5-turbo-0125.")
        return num_tokens_from_messages(messages, model="gpt-3.5-turbo-0125")
    elif "gpt-4" in model:
        print("Warning: gpt-4 may update over time. Returning num tokens assuming gpt-4-0613.")
        return num_tokens_from_messages(messages, model="gpt-4-0613")
    else:
        raise NotImplementedError(
            f"""num_tokens_from_messages() is not implemented for model {model}. 
            See https://github.com/openai/openai-python/blob/main/chatml.md 
            for information on how messages are converted to tokens."""
        )
    num_tokens = 0
    for message in messages:
        num_tokens += tokens_per_message
        for key, value in message.items():
            num_tokens += len(encoding.encode(value))
            if key == "name":
                num_tokens += tokens_per_name
    num_tokens += 3  # every reply is primed with <|start|>assistant<|message|>
    return num_tokens


def load_lora_adapter(
        model: torch.nn.Module,
        adapter_model_path: str,
        adapter_name: str = "chat") -> torch.nn.Module:
    """
    Load LORA adapter into huggingface LLM model
    model: torch.nn.Module
    adapter_model_path: str
    adapter_name: str
    """
    print("Using lora adapter")
    model = PeftModel.from_pretrained(
        model, model_id=adapter_model_path, adapter_name=adapter_name)
    model.add_weighted_adapter([adapter_name], [0.8], "best_"+adapter_name)
    model.set_adapter("best_"+adapter_name)
    model = model.merge_and_unload()
    return model


def get_tokenizer_and_model(
        model_name: str,
        adapter_model_path: str,
        adapter_name: str = "chat",
        use_cuda: bool = True) -> Tuple[transformers.PreTrainedTokenizer, torch.nn.Module]:
    """load base tokenizer and model"""
    tokenizer = AutoTokenizer.from_pretrained(
        model_name,
        trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        quantization_config=None,
        device_map=None,
        trust_remote_code=True,
        torch_dtype=torch.bfloat16,
    )
    model.generation_config.pad_token_id = tokenizer.pad_token_id

    if adapter_model_path:
        model = load_lora_adapter(model, adapter_model_path, adapter_name)

    if use_cuda and not hasattr(model, "hf_device_map"):
        model.cuda()
    model.eval()
    return tokenizer, model


def conv_msgs_to_chat_fmt(messages: List[dict], fmt_type: str = "smangrul/code-chat-assistant-v1") -> str:
    """
    messages should be in format [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": PROMPT},
        {"role": "assistant", "content": RESPONSE}, ...]
    """
    if fmt_type == "smangrul/code-chat-assistant-v1":
        tkn_conv = {"system": "<|system|>",
                    "user": "<|prompter|>",
                    "assistant": "<|assistant|> "}
        str_msgs = [tkn_conv[msg["role"]] + f' {msg["content"]} ' + "<|endoftext|> "
                    for msg in messages]
        prompt = "".join(str_msgs)
    else:
        raise NotADirectoryError(
            f"{fmt_type} type for chat format not implemented")
    return prompt


def send_prompt_to_llm(
        model: torch.nn.Module,
        tokenizer: transformers.PreTrainedTokenizer,
        prompt: str,
        use_cuda: bool = True,
        **kwargs) -> str:
    """
    Inference run with LLM (Model should be in eval mode)
    prompt: str = Text prompt for model
    kwargs: dict = Keyword args for inference, default vals present below
    """
    default_args = {
        "max_new_tokens": 128,
        "temperature": 0.2,
        "top_k": 50,
        "top_p": 0.95,
        "do_sample": True,
        "repetition_penalty": 1.0
    }
    kwargs = default_args | kwargs

    input_ids = tokenizer(prompt, return_tensors="pt").input_ids
    input_ids = input_ids.cuda() if use_cuda else input_ids
    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids,
            **kwargs
        )
    return tokenizer.batch_decode(outputs, skip_special_tokens=False)[0]


if __name__ == "__main__":
    # example 4bit quant run
    MODEL_NAME = "bigcode/starcoder2-3b"
    USE_CUDA = True
    USE_CUDA = USE_CUDA and torch.cuda.is_available()
    TEXT_PROMPT = "def print_hello_world():"

    # 4bit quantization with BitsAndBytesConfig
    quantization_config = BitsAndBytesConfig(load_in_4bit=True)
    device = "cuda" if USE_CUDA else "cpu"  # for GPU usage or "cpu" for CPU usage
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model_4bit = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME, quantization_config=quantization_config)

    inputs = tokenizer.encode(TEXT_PROMPT, return_tensors="pt").to(device)
    outputs = model_4bit.generate(inputs)
    print(tokenizer.decode(outputs[0]))
    print(f"Memory footprint: {model_4bit.get_memory_footprint() / 1e6:.2f} MB")
