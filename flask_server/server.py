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

from dotenv import load_dotenv
from flask import Flask, request, jsonify
from utils import english_words
from flask_server.hf_api import query_hf_api

load_dotenv()

query_llm_api = query_hf_api
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 32 * 1000 * 1000  # 32 megabytes


@app.route('/autocomplete', methods=['POST'])
def autocomplete():
    """
    Autocomplete based on data
    The output format must match {"results": [{"text": "GENERATED TEXT"}, ...]}
    for the inlineCompletionProvider used in the vscode extension
    """
    data = request.get_json()
    print(f"Data received at server {data}")

    flask_server_test_mode = json.loads(os.getenv("FLASK_SERVER_TEST_MODE"))
    if flask_server_test_mode:
        # gen random word for test mode
        rand_word = random.choice(english_words)
        resp = {"results": [{"text": rand_word}]}
    else:
        # query data to llm api
        output = query_llm_api(
            payload={
                "inputs":  data["prompt"],
                "parameters": {"max_new_tokens": data["max_new_tokens"]}
            },
            model=data["model"]
        )
        for out in output:
            out["text"] = out.pop("generated_text")
        resp = {"results": output}
    return jsonify(resp), 200


@app.route('/upload', methods=['POST'])
def upload_files():
    """Upload folder to server"""
    files = request.files.getlist('files')
    print(f"Received {len(files)} file(s)")

    for file in files:
        if file:
            filename = file.filename
            content = file.read().decode('utf-8')
            print(filename)
            print(content)
    return jsonify({'message': 'Files uploaded successfully'}), 200


if __name__ == "__main__":
    parser = argparse.ArgumentParser("Run flask webserver with api endpoints")
    parser.add_argument("-p", "--port", dest="port", default=8002,
                        type=int, help="Port to expose flask webserver")
    args = parser.parse_args()
    app.run(debug=True, host='0.0.0.0', port=args.port)