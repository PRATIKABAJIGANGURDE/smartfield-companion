import time
import requests
import logging
import sys
import os

# Setup Logging FIRST to capture import-time logs
logging.basicConfig(level=logging.INFO, format='%(asctime)s - [PI] - %(message)s', force=True)

# Ensure we can import from local directory
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from rover.motion import rover
from config import config

# Configuration
# Hardcoded IP for convenience (Laptop IP)
BACKEND_URL = "http://10.76.187.200:8000"
POLL_INTERVAL = 0.05  # 20Hz

def main():
    logging.info(f"Pi Agent Started. Backend: {BACKEND_URL}")
    
    # Use a Session for connection pooling (Keep-Alive) reduces CPU/Network load
    session = requests.Session()
    
    last_processed_ts = 0
    last_heartbeat = time.time()
    last_active_time = time.time() # Track when we last corrected/moved
    
    while True:
        try:
            # 1. Watchdog Check
            if rover.check_watchdog():
                pass

            # 2. Poll Backend
            try:
                # Use session instead of requests.get
                response = session.get(f"{BACKEND_URL}/api/drive", timeout=0.5)
                if response.status_code == 200:
                    data = response.json()
                    
                    ts = data.get("ts", 0)
                    
                    if ts > last_processed_ts:
                        x = data.get("x", 0)
                        y = data.get("y", 0)
                        speed = data.get("speed", 0)
                        
                        rover.process_command(x, y, speed)
                        last_processed_ts = ts
                        
                        # If moving, mark as active
                        if x != 0 or y != 0:
                            last_active_time = time.time()
                    else:
                        # Idle Heartbeat (every 5s)
                        if time.time() - last_heartbeat > 5.0:
                            logging.info("❤️  Heartbeat: Connected. Idle...")
                            last_heartbeat = time.time()
                        
            except requests.exceptions.RequestException as e:
                logging.warning(f"Backend Connection Failed: {e}")

            # 3. Adaptive Sleep (Smart Polling)
            # If valid movement in last 2 seconds -> Fast Poll (20Hz)
            # Else -> Slow Poll (2Hz) to save Wi-Fi/Battery
            if time.time() - last_active_time < 2.0:
                time.sleep(0.05) # 20Hz (Active)
            else:
                time.sleep(0.5)  # 2Hz (Power Save)

        except KeyboardInterrupt:
            logging.info("Stopping Pi Agent...")
            rover.motors.stop()
            break
        except Exception as e:
            logging.error(f"Unexpected Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
