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
POLL_INTERVAL = 0.1  # 10Hz

def main():
    logging.info(f"Pi Agent Started. Backend: {BACKEND_URL}")
    
    last_processed_ts = 0
    last_heartbeat = time.time()
    
    while True:
        try:
            # 1. Watchdog Check
            if rover.check_watchdog():
                # Watchdog handles its own logging (Transition to STOP)
                pass

            # 2. Poll Backend
            try:
                response = requests.get(f"{BACKEND_URL}/api/drive", timeout=0.5)
                if response.status_code == 200:
                    data = response.json()
                    
                    # { "x": 0, "y": 0, "speed": 0, "ts": 12345.6 }
                    ts = data.get("ts", 0)
                    
                    if ts > last_processed_ts:
                        x = data.get("x", 0)
                        y = data.get("y", 0)
                        speed = data.get("speed", 0)
                        
                        rover.process_command(x, y, speed)
                        last_processed_ts = ts
                    else:
                        # Idle Heartbeat (every 5s)
                        if time.time() - last_heartbeat > 5.0:
                            logging.info("❤️  Heartbeat: Connected to Backend. Waiting for commands...")
                            last_heartbeat = time.time()
                        
            except requests.exceptions.RequestException as e:
                logging.warning(f"Backend Connection Failed: {e}")
                # Optional: Stop motors if backend lost?
                # Watchdog in motion.py checks time since last process_command
                # So if no new command comes, it will eventually stop. Good.

            # 3. Post Sensors (Future)
            # ...

            time.sleep(POLL_INTERVAL)

        except KeyboardInterrupt:
            logging.info("Stopping Pi Agent...")
            rover.motors.stop()
            break
        except Exception as e:
            logging.error(f"Unexpected Error: {e}")
            time.sleep(1)

if __name__ == "__main__":
    main()
