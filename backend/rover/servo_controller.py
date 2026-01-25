import logging

# Mock RPi.GPIO if not running on Raspberry Pi (Shared mock logic could be extracted, but keeping isolated for now)
try:
    import RPi.GPIO as GPIO
except (ImportError, RuntimeError):
    # Using the same mock assumption as motor_driver.py
    # If this file is imported after motor_driver, the mock might already be in sys.modules if we were monkeypatching, 
    # but here we just handle the import error locally.
    class GPIO:
        BCM = "BCM"
        OUT = "OUT"
        @staticmethod
        def setup(pin, mode): pass
        
        class PWM:
            def __init__(self, pin, freq): pass
            def start(self, duty_cycle): pass
            def ChangeDutyCycle(self, duty_cycle): pass

class ServoController:
    def __init__(self, pin):
        self.pin = pin
        try:
            GPIO.setup(pin, GPIO.OUT)
            self.pwm = GPIO.PWM(pin, 50) # 50Hz for servos
            self.pwm.start(0)
        except Exception as e:
            logging.error(f"Failed to initialize servo on pin {pin}: {e}")

    def set_angle(self, angle):
        """
        Set servo angle (0 to 180 degrees).
        """
        angle = max(0, min(180, angle))
        # Map 0-180 to Duty Cycle (usually 2% to 12% for SG90/MG996R)
        # 0deg = 2.5%, 180deg = 12.5% is common, but user provided 2 + angle/18
        # User formula: 0deg->2, 180deg->12. Matches standard range approx.
        duty = 2 + (angle / 18)
        self.pwm.ChangeDutyCycle(duty)
