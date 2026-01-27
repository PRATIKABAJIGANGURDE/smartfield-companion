import time
import logging
from pi_agent.config import config
from .motor_driver import MotorDriver
from .servo_controller import ServoController

class RoverMotion:
    def __init__(self):
        self.motors = MotorDriver()
        
        # Initialize 4 Servos for Steering (4WS) - Kept for future/exhibition completeness
        # but ignored in simple motion logic for now.
        self.servo_fl = ServoController(config.SERVO_PIN_FL)
        self.servo_fr = ServoController(config.SERVO_PIN_FR)
        self.servo_rl = ServoController(config.SERVO_PIN_RL)
        self.servo_rr = ServoController(config.SERVO_PIN_RR)
        
        self.last_cmd_time = time.time()

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
        Process command.
        Y: Drive Motors (Forward/Backward)
        X: Steer Servos (Left/Right)
        """
        # Apply Deadzone
        if abs(y) < config.JOYSTICK_DEADZONE: y = 0
        if abs(x) < config.JOYSTICK_DEADZONE: x = 0

        self.last_cmd_time = time.time()
        self.watchdog_triggered = False
        
        # Special Case: Idle
        if x == 0 and y == 0:
            self.motors.stop()
            # Stop Servos to prevent buzzing/jitter
            self.servo_fl.detach()
            self.servo_fr.detach()
            self.servo_rl.detach()
            self.servo_rr.detach()
            return
        
        # 1. Drive Motors (Y-Axis)
        # Positive Y = Forward, Negative Y = Backward
        self.motors.drive(y)

        # 2. Steer Servos (X-Axis)
        if x != 0:
            front, rear = self.joystick_to_steering(x)
            self.servo_fl.set_angle(front)
            self.servo_fr.set_angle(front)
            # Rear steering is inverted for tighter turning radius
            self.servo_rl.set_angle(rear)
            self.servo_rr.set_angle(rear)
        else:
            # If moving straight, center servos
            self.servo_fl.set_angle(90)
            self.servo_fr.set_angle(90)
            self.servo_rl.set_angle(90)
            self.servo_rr.set_angle(90)
        
        # Logging (sparse)
        # logging.info(f"Cmd: x={x} y={y}")

    def check_watchdog(self):
        """
        Check if too much time has passed since last command.
        Stops motors if timeout exceeded.
        """
        if time.time() - self.last_cmd_time > config.WATCHDOG_TIMEOUT:
            if not getattr(self, 'watchdog_triggered', False):
                logging.warning("🛑 WATCHDOG TRIGGERED: Timeout exceeded. Stopping motors!")
                self.motors.stop()
                self.watchdog_triggered = True
            return True
        return False

# Global instance
rover = RoverMotion()
