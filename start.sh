#!/bin/bash

echo "[Swap Optimizer] Starting the path-finder service..."

# Ensure .env exists
if [ ! -f .env ]; then
    echo "[ERROR] Missing .env file. Please run setup.sh first."
    exit 1
fi

PID=$(ps aux | grep -i "sh -c node dist/app.js" | grep -v grep | awk '{print $2}')

if [ -n "$PID" ];
 then
	 echo "Process already running"
	 exit 1
fi
# Run orchestrator logic
echo "[Swap Optimizer] Starting orchestrator..."
npm run build & npm start &

(
  sleep 300
  pkill -f "node src/app.js"
  echo "[SWAP OPTIMIZER] Simulated crash: app.js stopped after 5 minutes." >> logs/output.log
) &

wait
