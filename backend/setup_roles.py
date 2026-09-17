import requests

roles = [
    {"name": "Super Admin"},
    {"name": "Admin"},
    {"name": "Accounts"},
    {"name": "Registration"},
    {"name": "Sales"}
]

for role in roles:
    try:
        response = requests.post("http://localhost:8000/roles/", json=role)
        if response.status_code in [200, 201]:
            print(f"Added role: {role['name']}")
        else:
            print(f"Failed to add role {role['name']}: {response.text}")
    except Exception as e:
        print(f"Error for {role['name']}: {e}")
