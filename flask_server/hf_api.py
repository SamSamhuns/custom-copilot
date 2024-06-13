"""
Huggingface api calls
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

MODEL_API_URLS = {
    # has generation and fill in the middle
    "starcoderbase-1b": "https://api-inference.huggingface.co/models/bigcode/starcoderbase-1b",
    "starcoderbase-3b": "https://api-inference.huggingface.co/models/bigcode/starcoderbase-3b",
    # only has generation
    "starcoder2-3b": "https://api-inference.huggingface.co/models/bigcode/starcoder2-3b"
}


def query_hf_api(payload: dict, model: str = "starcoder2-3b", timeout: int = 300):
    """
    Send a query to the huggingface api
    """
    hf_api_token = os.getenv("HF_API_TOKEN")
    hf_api_url = MODEL_API_URLS[model]

    headers = {"Authorization": f"Bearer {hf_api_token}"}
    response = requests.post(hf_api_url, headers=headers,
                             json=payload, timeout=timeout)
    return response.json()


if __name__ == "__main__":
    MODEL_INPUT_QUERY = "<fim_prefix>def binary_search(arr, t):\n    <fim_suffix>\n    return idx<fim_middle>"
    # MODEL_INPUT_QUERY = "def binary_search(arr, target):"
    # detailed params for text generation at:
    # https://huggingface.co/docs/api-inference/en/detailed_parameters#text-generation-task
    output = query_hf_api(
        payload={
            "inputs": MODEL_INPUT_QUERY,
            "parameters": {"max_new_tokens": 50}
        },
        model="starcoderbase-1b"
        )
    # output format
    # output = [{'generated_text': 'def binary_search(x, t):\n gen text....'}]
    if isinstance(output, list):
        gen_txt = output[0]["generated_text"]
        print(gen_txt)
    else:
        print(output)
