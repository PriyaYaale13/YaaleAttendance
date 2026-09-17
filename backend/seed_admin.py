import requests

url = "http://localhost:8010/system-users/"

payload = {
  "firstName": "Admin",
  "midName": "",
  "lastName": "User",
  "gender": "Male",
  "birthDate": "1990-01-01",
  "userName": "admin",
  "password": "password123",
  "email": "admin@example.com",
  "secondaryEmail": "",
  "contactNo": "1234567890",
  "secondaryContactNo": "",
  "role": "Superadmin",
  "systemDateFormat": "YYYY-MM-DD"
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200 or response.status_code == 201:
        print("Successfully created admin user!")
        print("Username: admin")
        print("Password: password123")
    else:
        print(f"Failed to create user. Status code: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error connecting to server: {e}")
