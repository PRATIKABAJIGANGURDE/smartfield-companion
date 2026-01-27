from datetime import datetime
from typing import Dict, Any

class SystemState:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SystemState, cls).__new__(cls)
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        self.connection_status = "online"
        self.battery_level = 78  # Mock starting value
        self.last_command_time = None
        self.sensors: Dict[str, Any] = {
            "soil": {
                "moisture": 42,
                "temperature": 26,
                "ph": 5.6,
                "nitrogen": 18,
                "phosphorus": 12,
                "potassium": 20
            },
            "environment": {
                "temperature": 30,
                "humidity": 60
            }
        }
        self.last_command = {"x": 0, "y": 0, "speed": 0, "ts": 0}

    def set_command(self, x, y, speed):
        self.last_command = {
            "x": x,
            "y": y,
            "speed": speed,
            "ts": datetime.now().timestamp()
        }
        self.update_last_command_time()

    def update_last_command_time(self):
        self.last_command_time = datetime.now()

    def get_status(self):
        last_cmd_str = "Never"
        if self.last_command_time:
            # Calculate readable time difference or just return string
            # For simplicity in Phase 1, we can return a formatted string or relative time
            # But the PRD example says "2 seconds ago". 
            # We'll just return ISO format or calculated string. 
            # Let's return ISO for API and let frontend parse, OR return a simple string for now if strictly following example.
            # PRD Response: "2 seconds ago". I'll implement a simple helper or just return ISO for now and let Frontend handle it?
            # PRD Key Assumption: "Backend responsible for... Sending live status".
            # I will return a string approximation for now to match the PRD example directly.
            diff = datetime.now() - self.last_command_time
            seconds = int(diff.total_seconds())
            last_cmd_str = f"{seconds} seconds ago"

        return {
            "connection": self.connection_status,
            "battery": self.battery_level,
            "lastCommand": last_cmd_str
        }

    def get_sensors(self):
        # In a real app, this might read from hardware.
        # Here we return the stored state (which matches the mock data).
        return {
            **self.sensors,
            "lastUpdated": datetime.now().isoformat()
        }

# Global instance
state = SystemState()
