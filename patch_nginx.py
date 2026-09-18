import sys

file_path = '/etc/nginx/sites-available/yaale'

try:
    with open(file_path, 'r') as f:
        content = f.read()

    # We want to make sure the location /api/ block proxies to http://127.0.0.1:8000/ 
    # replacing any existing 8010 or missing trailing slash
    
    lines = content.split('\n')
    in_api_block = False
    
    for i, line in enumerate(lines):
        if 'location /api/' in line or 'location /api ' in line:
            in_api_block = True
        elif in_api_block and 'proxy_pass' in line:
            # Found the proxy_pass inside the api block
            lines[i] = '        proxy_pass http://127.0.0.1:8000/;'
            in_api_block = False
        elif in_api_block and '}' in line:
            in_api_block = False

    with open(file_path, 'w') as f:
        f.write('\n'.join(lines))
        
    print("Successfully patched nginx config.")
except Exception as e:
    print(f"Error: {e}")
