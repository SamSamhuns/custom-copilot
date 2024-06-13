# Flask Webserver

For hosting custom LLM inference APIs or acting as middleware for calling 3rd party APIs

## Requirements

Install python libraries:

```shell
# inside virtual env
pip install -r requirements
```

Create a `.env` file inside `flask_server/` with the contents:

```conf
HF_API_TOKEN=YOUR_HUGGINFACE_TOKEN
# set the below to true to run on test mode & not call the huggingface API
FLASK_SERVER_TEST_MODE=false
```

## Run mock server

```shell
PYTHONPATH="./" python flask_server/server.py
```

## Ping the server with curl

```shell
curl -X POST http://localhost:8002/autocomplete -H "Content-Type: application/json" -d '{"prompt": "test", "max_new_tokens": 50}'
```