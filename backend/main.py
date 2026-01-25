from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import sys
import os

# Add the parent directory to sys.path so we can import 'backend'
# This fixes "ModuleNotFoundError" when running from inside the backend/ directory
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.api import control, sensors, suggestions, status
from backend.rover.motion import rover

app = FastAPI(title="SmartFarm Rover Backend")

# ... (CORS config) ...
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(control.router, prefix="/api", tags=["Control"])
app.include_router(sensors.router, prefix="/api", tags=["Sensors"])
app.include_router(suggestions.router, prefix="/api", tags=["Suggestions"])
app.include_router(status.router, prefix="/api", tags=["Status"])

import logging
# Configure logging to show INFO level logs in console
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

@app.on_event("startup")
async def startup_event():
    import asyncio
    # Rover import handled above safely
    
    # Background Watchdog Task
    async def watchdog_task():
        print("[SYSTEM] Watchdog Task Started")
        while True:
            # The check_watchdog internal method handles stopping if needed
            # We just need to call it occasionally
            triggered = rover.check_watchdog()
            if triggered:
                 # Optional: wait longer if just triggered to avoid busy loop
                 await asyncio.sleep(1.0)
            else:
                 await asyncio.sleep(0.1) # Check every 100ms
                
    asyncio.create_task(watchdog_task())

@app.get("/")
async def root():
    return {"message": "SmartFarm Rover Backend Online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
