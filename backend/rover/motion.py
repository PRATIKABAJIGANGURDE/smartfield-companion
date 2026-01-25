import time
import logging
from .motor_driver import MotorDriver
from .servo_controller import ServoController

class RoverMotion:
    def __init__(self):
        self.motors = MotorDriver()
        # Initialize 4 servos
        # Default pins: 23, 24, 25, 8. Update here if hardware changes.
        self.servo_pins = [23, 24, 25, 8]
        self.servos = [ServoController(pin) for pin in self.servo_pins]
        # Alias for backward compatibility (accessing first servo)
        self.servo = self.servos[0]
        self.last_cmd_time = time.time()
        
    def calculate_steering_angles(self, x):
        """
        Calculate 4-wheel steering angles based on Joystick X.
        x: -100 (Left) to 100 (Right)
        Returns: [front_left, front_right, rear_left, rear_right]
        Logic: Counter-steering (4WS) for tight turns.
        Center: 90 degrees
        Range: +/- 45 degrees (45 to 135)
        """
        # Map x (-100 to 100) to angle offset (-45 to 45)
        offset = (x / 100.0) * 45
        
        # Front wheels turn WITH the turn (Left turn -> Angle < 90)
        # Note: If 0 is Right and 180 is Left on your servo, invert this sign.
        # Assuming: 0=Right, 90=Center, 180=Left
        # Left Turn (x < 0) -> Front should point Left (Angle > 90)
        # Wait, usually 0 is one side. Let's assume standard:
        # 0 = Far Right, 90 = Center, 180 = Far Left.
        # So x=-100 (Left) -> Angle = 135.
        #    x=100 (Right) -> Angle = 45.
        
        front_angle = 90 + offset  # Wait, if x=100, 90+45=135 (Left?). 
        # Let's fix direction: x is Left(-100)/Right(100).
        # We want x=100 (Right) -> servos point Right.
        # If 90 is center. Right is usually < 90 or > 90 depending on horn.
        # Let's assume: Right is < 90 (e.g. 45), Left is > 90 (e.g. 135).
        # So x=100 -> want 45. x=-100 -> want 135.
        # Formula: 90 - (x/100 * 45)
        
        front_angle = 90 - offset 
        
        # Rear wheels turn OPPOSITE (Counter-Steer)
        # x=100 (Right) -> Rear should point Left (135).
        rear_angle = 90 + offset
        
        return [front_angle, front_angle, rear_angle, rear_angle]

    def joystick_to_wheels(self, x, y, max_speed=100):
        """
        Convert joystick y into simple forward/backward speed.
        Steering is now handled by servos, so we just drive.
        """
        # Simple Drive: Both sides equal to Y
        speed_val = y
        
        # Clamp values
        speed_val = max(-max_speed, min(max_speed, speed_val))
        
        return speed_val, speed_val

    def process_command(self, x: int, y: int, speed: int, servo_angle: int = None, servos: list = None):
        """
        Process a high-level command to move the rover.
        """
        self.last_cmd_time = time.time()
        
        # 1. Handle Steering (Servos)
        if servos:
            # Explicit servo override from API
            target_angles = servos
        else:
            # Automatic 4WS Steering from Joystick X
            target_angles = self.calculate_steering_angles(x)
            
        # Apply angles to servos
        for i, angle in enumerate(target_angles):
            if i < len(self.servos):
                self.servos[i].set_angle(angle)

        # 2. Handle Motors (Drive)
        # Use Y for speed (Forward/Back). X is ignored for differential drive now.
        left, right = self.joystick_to_wheels(x, y, max_speed=speed)
        
        msg = f"Cmd: x={x}, y={y} -> Speed={left}, Angles={target_angles}"
        logging.info(msg)
        print(f"DEBUG: {msg}") # Force output to console
        
        # Apply to motors
        self.motors.set_speed(left, right)
        
        # Handle deprecated single 'servo_angle' if really needed (ignoring for now to avoid conflict)

    def check_watchdog(self):
        """
        Check if too much time has passed since last command.
        Stops motors if timeout exceeded (e.g. 1 second).
        """
        if time.time() - self.last_cmd_time > 1.0:
            self.motors.stop()
            # logging.warning("Watchdog triggered: Rover stopped.")
            return True
        return False

# Global instance
rover = RoverMotion()
