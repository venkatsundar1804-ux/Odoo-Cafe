#!/bin/bash

# Ensure ngrok is installed
if ! command -v ngrok &> /dev/null
then
    echo "ngrok could not be found. Please install ngrok first."
    exit
fi

echo "Starting ngrok tunnels based on ngrok.yml configuration..."
echo "This will expose both the Vite frontend (5173) and FastAPI backend (8000)."
echo ""
echo "NOTE: If you have a free Ngrok account, you may only be allowed to start one tunnel."
echo "If that happens, you can just start the frontend tunnel (ngrok http 5173), "
echo "because we have configured Vite to proxy API and WebSocket requests to port 8000 automatically!"

# Start ngrok using the config file
ngrok start --all --config=./ngrok.yml
