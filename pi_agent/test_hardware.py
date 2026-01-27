import time
import logging
import sys
import os

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(message)s')

def test_servo():
    print("� Servo Calibration Tool")
    print("-----------------------")
    
    try:
        import RPi.GPIO as GPIO
        import lgpio
    except ImportError:
        print("❌ ERROR: rpi-lgpio not installed. Run 'pip install rpi-lgpio'")
        return

    # Configuration load attempt
    try:
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        from config import config
        PIN = config.SERVO_PIN_FL
    except:
        PIN = 23
        print(f"⚠️ Config not found, using default Pin {PIN}")

    print(f"\n🎯 Target Pin: {PIN}")
    print("Commands:")
    print("  0-180 : Move to angle")
    print("  min   : Move to 0")
    print("  mid   : Move to 90")
    print("  max   : Move to 180")
    print("  q     : Quit")
    
    pwm = None
    try:
        # Debugging Library Source
        print(f"DEBUG: GPIO File: {GPIO.__file__}")
        
        GPIO.setmode(GPIO.BCM)
        GPIO.setup(PIN, GPIO.OUT)
        
        pwm = GPIO.PWM(PIN, 50) # 50Hz
        pwm.start(0)
        
        while True:
            cmd = input("\n👉 Enter angle (or q): ").strip().lower()
            
            if cmd == 'q':
                break
                
            angle = -1
            if cmd == 'min': angle = 0
            elif cmd == 'mid': angle = 90
            elif cmd == 'max': angle = 180
            else:
                try:
                    angle = float(cmd)
                except ValueError:
                    print("❌ Invalid input")
                    continue
            
            # Map Angle to Duty Cycle
            duty = 2 + (angle / 18.0)
            
            print(f"Angle: {angle}° -> Duty: {duty:.2f}%")
            pwm.ChangeDutyCycle(duty)
            
            print("...Listen for buzzing/stalling...")

    except KeyboardInterrupt:
        pass
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        print("\nStopping...")
        if pwm:
            pwm.stop()
            del pwm
        try:
            GPIO.cleanup()
        except:
            pass
        print("✅ Cleanup complete")

if __name__ == "__main__":
    test_servo()
