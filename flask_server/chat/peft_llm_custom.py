"""
Peft LLM model for autocomplete
"""
import time
import torch
from flask_server.chat.utils import (
    get_tokenizer_and_model,
    send_prompt_to_llm)


# load autocomplete model
USE_CUDA = True
USE_CUDA = USE_CUDA and torch.cuda.is_available()
MODEL_NAME = "bigcode/starcoder2-3b"
ADAPTER_MODEL_PATH = "flask_server/models/peft-lora-starcoder2-3b-chat-asst-colab-1212/checkpoint-1212"

autocomplete_tknr, autocomplete_llm = get_tokenizer_and_model(
    MODEL_NAME, ADAPTER_MODEL_PATH, use_cuda=USE_CUDA)


# load chat model
USE_CUDA = True
USE_CUDA = USE_CUDA and torch.cuda.is_available()
MODEL_NAME = "bigcode/starcoder2-3b"
ADAPTER_MODEL_PATH = "flask_server/models/peft-lora-starcoder2-3b-chat-asst-T4-15GB-colab-epoch06/checkpoint-1212"

chat_tknr, chat_llm_model = get_tokenizer_and_model(
    MODEL_NAME, ADAPTER_MODEL_PATH, use_cuda=USE_CUDA)


if __name__ == "__main__":
    TEXT_PROMPT = "Write a function to calculate the l2 distance between two numbers"
    t0 = time.perf_counter()
    print(send_prompt_to_llm(
        chat_llm_model, chat_tknr, TEXT_PROMPT, USE_CUDA, max_new_tokens=128))
    t1 = time.perf_counter()
    print(f"Time taken for chat prediction {t1 - t0:.3f}s")

    TEXT_PROMPT = "def l2_distance(x, y):"
    t0 = time.perf_counter()
    print(send_prompt_to_llm(
        autocomplete_llm, autocomplete_tknr, TEXT_PROMPT, USE_CUDA, max_new_tokens=128))
    t1 = time.perf_counter()
    print(f"Time taken for autocomplete prediction {t1 - t0:.3f}s")
