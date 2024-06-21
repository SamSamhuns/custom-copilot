"""
Utils for chatting with LLM

requirements:
pip install - -default-timeout = 100 transformers
pip install - -default-timeout = 100 peft
pip install setuptools
"""
from typing import Tuple, List

import torch
import transformers
from peft import PeftModel
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer
)


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
