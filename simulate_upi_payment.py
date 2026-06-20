import sys
import requests

def simulate_upi_webhook(order_id):
    url = f"http://localhost:8000/api/webhook/upi/{order_id}"
    try:
        response = requests.post(url)
        if response.status_code == 200:
            print(f"Success: {response.json()}")
        else:
            print(f"Failed: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to backend: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python simulate_upi_payment.py <order_id>")
        sys.exit(1)
    
    order_id = sys.argv[1]
    simulate_upi_webhook(order_id)
