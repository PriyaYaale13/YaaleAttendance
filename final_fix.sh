#!/bin/bash

echo "Starting the ultimate fix..."

# 1. We know your YaaleAttendance folder is at /root/YaaleAttendance based on the logs
cd /root/YaaleAttendance/frontend

# 2. Fix the .env file so the frontend uses relative paths (no more Mixed Content!)
echo "VITE_API_URL=/api" > .env

# 3. Install and build the frontend correctly in the right folder
npm install
npm run build

# 4. Fix Nginx configuration
# We will explicitly point /api/ to port 8010 (since PM2 logs show your backend is on 8010)
# And / to port 3029 (where your frontend is running)
cat << 'EOF' | sudo tee /etc/nginx/sites-available/yaale
server {
    listen 80;
    server_name 72.62.227.163 72-62-227-163.nip.io;

    # Backend
    location /api/ {
        proxy_pass http://127.0.0.1:8010/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
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

# Restart Nginx
sudo nginx -t
sudo systemctl restart nginx

# 5. Restart PM2 frontend process
pm2 restart frontend

# 6. Re-run Certbot just in case the HTTPS block was corrupted
sudo certbot --nginx -d 72-62-227-163.nip.io --non-interactive --agree-tos --redirect -m admin@yaale.com

echo "====================================================="
echo "ALL FIXED! Please refresh your browser!"
echo "====================================================="
