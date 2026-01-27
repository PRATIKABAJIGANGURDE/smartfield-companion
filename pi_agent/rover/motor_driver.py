import logging
import sys
from pi_agent.config import config

# Mock RPi.GPIO if not running on Raspberry Pi
try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    # Create a dummy GPIO class for non-Pi environments (e.g., Windows dev)
    class GPIO:
        BCM = "BCM"
        OUT = "OUT"
        HIGH = 1
        LOW = 0
        
        @staticmethod
        def setmode(mode): pass
        
        @staticmethod
        def setwarnings(flag): pass
        
        @staticmethod
        def setup(pin, mode): pass
        
        @staticmethod
        def output(pin, state): pass
        
        @staticmethod
        def cleanup(): pass
        
        class PWM:
            def __init__(self, pin, freq): pass
            def start(self, duty_cycle): pass
            def ChangeDutyCycle(self, duty_cycle): pass
            def stop(self): pass

    logging.warning("RPi.GPIO not found. Using mock GPIO driver.")

class MotorDriver:
    """
    Handles low-level motor control.
    Currently supports 2 channels (Left/Right).
    For 6-wheel rovers, motors should be wired in parallel (3 Left, 3 Right).
    """
    def __init__(self):
        # Setup GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        pins = [
            config.LEFT_IN1, config.LEFT_IN2,
            config.RIGHT_IN1, config.RIGHT_IN2
        ]

        for p in pins:
            GPIO.setup(p, GPIO.OUT)

        GPIO.setup(config.LEFT_PWM, GPIO.OUT)
        GPIO.setup(config.RIGHT_PWM, GPIO.OUT)

        # Initialize PWM using config frequency
        self.pwm_left = GPIO.PWM(config.LEFT_PWM, config.PWM_FREQ_MOTOR)
        self.pwm_right = GPIO.PWM(config.RIGHT_PWM, config.PWM_FREQ_MOTOR)

        self.pwm_left.start(0)
        self.pwm_right.start(0)
        
        logging.info("MotorDriver initialized.")

    def set_motor(self, in1, in2, pwm, speed):
        """
        Control a single motor group.
        speed: -100 to 100
        """
        # Clamp speed
        speed = max(-config.MAX_SPEED, min(config.MAX_SPEED, speed))
        
        # Verbose Logging for debugging
        # logging.debug(f"Set Motor (Pin {in1}/{in2}) Speed: {speed}")
        
        if speed >= 0:
            GPIO.output(in1, GPIO.HIGH)
            GPIO.output(in2, GPIO.LOW)
        else:
            GPIO.output(in1, GPIO.LOW)
            GPIO.output(in2, GPIO.HIGH)

        pwm.ChangeDutyCycle(abs(speed))

    def set_speed(self, left_speed, right_speed):
        """
        Set speed for both left and right motor groups.
        left_speed, right_speed: -100 to 100
        """
        logging.info(f"⚙️  [MOTORS] Left: {left_speed} | Right: {right_speed}")
        
        self.set_motor(
            config.LEFT_IN1, config.LEFT_IN2,
            self.pwm_left, left_speed
        )

        self.set_motor(
            config.RIGHT_IN1, config.RIGHT_IN2,
            self.pwm_right, right_speed
        )

    def stop(self):
        """Stop all motors immediately."""
        logging.info("🛑 [MOTORS] Stopping all motors.")
        self.pwm_left.ChangeDutyCycle(0)
        self.pwm_right.ChangeDutyCycle(0)
        GPIO.output(config.LEFT_IN1, GPIO.LOW)
        GPIO.output(config.LEFT_IN2, GPIO.LOW)
        GPIO.output(config.RIGHT_IN1, GPIO.LOW)
        GPIO.output(config.RIGHT_IN2, GPIO.LOW)
