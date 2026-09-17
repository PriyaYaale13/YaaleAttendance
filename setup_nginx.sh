#!/bin/bash

# This script configures Nginx to proxy port 80 to the frontend (3029) and backend (8010)

echo "Setting up Nginx configuration..."

cat << 'EOF' | sudo tee /etc/nginx/sites-available/yaale
server {
    listen 80;
    server_name 72.62.227.163;

    # Route /api to the FastAPI backend
    location /api/ {
        proxy_pass http://127.0.0.1:8010/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Route everything else to the React frontend
    location / {
        proxy_pass http://127.0.0.1:3029;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
EOF

# Enable the site and restart Nginx
sudo ln -sf /etc/nginx/sites-available/yaale /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "Nginx configured successfully! You can now access the app at http://72.62.227.163/"
