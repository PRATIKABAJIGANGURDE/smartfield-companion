import logging
import sys

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
        # GPIO Pins Configuration
        self.LEFT_IN1 = 5
        self.LEFT_IN2 = 6
        self.LEFT_PWM = 12

        self.RIGHT_IN1 = 13
        self.RIGHT_IN2 = 19
        self.RIGHT_PWM = 18

        # Setup GPIO
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        pins = [
            self.LEFT_IN1, self.LEFT_IN2,
            self.RIGHT_IN1, self.RIGHT_IN2
        ]

        for p in pins:
            GPIO.setup(p, GPIO.OUT)

        GPIO.setup(self.LEFT_PWM, GPIO.OUT)
        GPIO.setup(self.RIGHT_PWM, GPIO.OUT)

        # Initialize PWM at 1000Hz
        self.pwm_left = GPIO.PWM(self.LEFT_PWM, 1000)
        self.pwm_right = GPIO.PWM(self.RIGHT_PWM, 1000)

        self.pwm_left.start(0)
        self.pwm_right.start(0)
        
        logging.info("MotorDriver initialized.")

    def set_motor(self, in1, in2, pwm, speed):
        """
        Control a single motor group.
        speed: -100 to 100
        """
        # Clamp speed
        speed = max(-100, min(100, speed))
        
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
        self.set_motor(
            self.LEFT_IN1, self.LEFT_IN2,
            self.pwm_left, left_speed
        )

        self.set_motor(
            self.RIGHT_IN1, self.RIGHT_IN2,
            self.pwm_right, right_speed
        )

    def stop(self):
        """Stop all motors immediately."""
        self.pwm_left.ChangeDutyCycle(0)
        self.pwm_right.ChangeDutyCycle(0)
        GPIO.output(self.LEFT_IN1, GPIO.LOW)
        GPIO.output(self.LEFT_IN2, GPIO.LOW)
        GPIO.output(self.RIGHT_IN1, GPIO.LOW)
        GPIO.output(self.RIGHT_IN2, GPIO.LOW)
