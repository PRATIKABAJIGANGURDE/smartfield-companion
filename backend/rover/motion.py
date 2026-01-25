import time
import logging
from backend.config import config
from .motor_driver import MotorDriver
from .servo_controller import ServoController

class RoverMotion:
    def __init__(self):
        self.motors = MotorDriver()
        
        # Initialize 4 Servos for Steering (4WS)
        # Assuming layout: Front-Left, Front-Right, Rear-Left, Rear-Right
        self.servo_fl = ServoController(config.SERVO_PIN_FL)
        self.servo_fr = ServoController(config.SERVO_PIN_FR)
        self.servo_rl = ServoController(config.SERVO_PIN_RL)
        self.servo_rr = ServoController(config.SERVO_PIN_RR)
        
        self.last_cmd_time = time.time()
        
    def joystick_to_wheels(self, x, y, max_speed=100):
        """
        Convert joystick x,y into left & right wheel speeds.
        x: -100 to 100 (left/right)
        y: -100 to 100 (forward/backward)
        returns: left_speed, right_speed (-100 to 100)
        """
        # Differential drive mixing
        left = y + x
        right = y - x

        # Clamp values
        left = max(-max_speed, min(max_speed, left))
        right = max(-max_speed, min(max_speed, right))

        return left, right
        
    def joystick_to_steering(self, x):
        """
        Convert turn intent (x) to servo angles for 4-Wheel Steering.
        front: Turn with x (90 + x)
        rear: Turn against x (90 - x) for tighter radius
        Range: 70 to 110 degrees (clamped)
        """
        # Map x (-100 to 100) to delta angle (e.g., +/- 20 degrees)
        delta = (x * 20.0) / 100.0
        
        # Front wheels turn in direction of turn
        # Rear wheels turn opposite for tighter radius (Counter-steering)
        front_angle = 90 + delta
        rear_angle = 90 - delta
        
        # Clamp to safe range (70-110)
        front_angle = max(70, min(110, front_angle))
        rear_angle = max(70, min(110, rear_angle))
        
        return front_angle, rear_angle

    def process_command(self, x: int, y: int, speed: int, servo_angle: int = None):
        """
        Process a high-level command to move the rover.
        """
        self.last_cmd_time = time.time()
        
        # 1. Drive Motors (Differential)
        # Note: If x determines steering, do we still want it affecting wheel speed (skid steer)?
        # For a 6WD with 4WS, usually you do both (Ackermann-ish + Differential) to help turn.
        # Keeping existing differential mix as requested implicitly.
        left, right = self.joystick_to_wheels(x, y, max_speed=speed)
        
        self.motors.set_speed(left, right)
        
        # 2. Steering Servos (4WS)
        front, rear = self.joystick_to_steering(x)
        
        self.servo_fl.set_angle(front)
        self.servo_fr.set_angle(front)
        self.servo_rl.set_angle(rear)
        self.servo_rr.set_angle(rear)
        
        logging.info(f"Cmd: x={x} y={y} | Motors: L={left} R={right} | Steer: F={front:.1f} R={rear:.1f}")

    def check_watchdog(self):
        """
        Check if too much time has passed since last command.
        Stops motors if timeout exceeded.
        """
        if time.time() - self.last_cmd_time > config.WATCHDOG_TIMEOUT:
            self.motors.stop()
            # Optional: Reset servos to center?
            # self.servo_fl.set_angle(90)
            # ...
            return True
        return False

# Global instance
rover = RoverMotion()
