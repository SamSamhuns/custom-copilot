"""
Script to host a simple flask webserver
HTTP ENDPOINT will be available at http://localhost:8002/test_api

Ping with curl:
curl -X POST http://localhost:8002/autocomplete -H "Content-Type: application/json" -d '{"prompt": "test", "max_new_tokens": 50}'
"""

import os
import json
import random
import argparse
import asyncio

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from utils import english_words
from chat.openai_chat import send_prompt_to_openai
from flask_server.hf_api import query_hf_api


load_dotenv()

query_llm_api = query_hf_api
app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 32 * 1000 * 1000  # 32 megabytes
TEST_MODE = json.loads(os.getenv("FLASK_SERVER_TEST_MODE"))


@app.route("/autocomplete", methods=["POST"])
def autocomplete():
    """
    Autocomplete based on data
    The output format must match {"results": [{"text": "GENERATED TEXT"}, ...]}
    for the inlineCompletionProvider used in the vscode extension
    """
    data = request.get_json()
    print(f"Data received at server {data}")

    if TEST_MODE:
        # gen random word for test mode
        rand_word = random.choice(english_words)
        resp = {"results": [{"text": rand_word}]}
    else:
        # query data to llm api
        output = query_llm_api(
            payload={
                "inputs": data["prompt"],
                "parameters": {"max_new_tokens": data["max_new_tokens"]},
            },
            model=data["model"],
        )
        for out in output:
            out["text"] = out.pop("generated_text")
        resp = {"results": output}
    return jsonify(resp), 200


@app.route("/upload", methods=["POST"])
def upload_files():
    """Upload folder to server"""
    files = request.files.getlist("files")
    print(f"Received {len(files)} file(s)")

    for file in files:
        if file:
            filename = file.filename
            content = file.read().decode("utf-8")
            print(filename)
            print(content)
    return jsonify({"message": "Files uploaded successfully"}), 200


@app.route("/chat", methods=["POST"])
def chat_with_llm():
    """Chat with Language Model"""
    data = request.get_json()
    print(f"Data received at server: {data}")

    # Extract prompt and model from the incoming request
    prompt = data.get("prompt")
    model = data.get("model", "gpt-3.5-turbo-0125")
    max_tokens = data.get("max_tokens", 150)
    temperature = data.get("temperature", 0.7)

    if TEST_MODE:
        response, code = jsonify({"response": "sample response from llm"}), 200
    else:
        response, code = asyncio.run(
            send_prompt_to_openai(prompt, model, max_tokens, temperature)
        )
    return response, code


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Run flask webserver with api endpoints")
    parser.add_argument(
        "-p",
        "--port",
        dest="port",
        default=8002,
        type=int,
        help="Port to expose flask webserver",
    )
    args = parser.parse_args()
    app.run(debug=True, host="0.0.0.0", port=args.port)
