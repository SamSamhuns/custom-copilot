"""
Peft LLM model for Chat
"""
import time
import torch
from flask_server.chat.utils import (
    get_tokenizer_and_model,
    send_prompt_to_llm)


if __name__ == "__main__":
    MODEL_NAME = "bigcode/starcoder2-3b"
    ADAPTER_MODEL_PATH = "flask_server/models/peft-lora-starcoder2-3b-chat-asst-T4-15GB-colab-epoch06/checkpoint-1212"
    USE_CUDA = True
    USE_CUDA = USE_CUDA and torch.cuda.is_available()
    TEXT_PROMPT = "Write a function to calculate the l2 distance between two numbers"
    tknr, llm_model = get_tokenizer_and_model(
        MODEL_NAME, ADAPTER_MODEL_PATH, use_cuda=USE_CUDA)
    
    t0 = time.time()
    print(send_prompt_to_llm(
        llm_model, tknr, TEXT_PROMPT, USE_CUDA, max_new_tokens=128))
    t1 = time.time()
    print(f"Time taken for prediction {t1 - t0:.3f}s")
