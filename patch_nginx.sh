#!/bin/bash

# This script safely fixes the Nginx routing for /api/ without deleting your HTTPS settings.

echo "Patching Nginx proxy settings..."

# Find the proxy_pass line under /api/ and ensure it points to 8000 with a trailing slash
sudo sed -i 's|proxy_pass http://127.0.0.1:8010/;|proxy_pass http://127.0.0.1:8000/;|g' /etc/nginx/sites-available/yaale
sudo sed -i 's|proxy_pass http://127.0.0.1:8010;|proxy_pass http://127.0.0.1:8000/;|g' /etc/nginx/sites-available/yaale
sudo sed -i 's|proxy_pass http://127.0.0.1:8000;|proxy_pass http://127.0.0.1:8000/;|g' /etc/nginx/sites-available/yaale

# Restart Nginx
sudo nginx -t && sudo systemctl reload nginx

echo "Routing fixed!"
