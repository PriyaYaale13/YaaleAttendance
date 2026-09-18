#!/bin/bash

# This script sets up HTTPS for the server using a free .nip.io domain and Let's Encrypt (Certbot)
# It modifies the existing Nginx configuration to support the domain and requests an SSL certificate.

DOMAIN="72-62-227-163.nip.io"
EMAIL="admin@yaale.com"

echo "=========================================="
echo " Setting up HTTPS for $DOMAIN"
echo "=========================================="

echo "1. Installing Certbot..."
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

echo "2. Updating Nginx configuration to include the domain..."
# Update the server_name in the existing nginx config to include the nip.io domain
sudo sed -i "s/server_name 72.62.227.163;/server_name 72.62.227.163 $DOMAIN;/g" /etc/nginx/sites-available/yaale

echo "3. Restarting Nginx to apply domain..."
sudo nginx -t && sudo systemctl reload nginx

echo "4. Requesting free SSL Certificate from Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo "=========================================="
echo " DONE! HTTPS is now configured."
echo "=========================================="
echo "Please tell your employees to access the site using this new secure URL:"
echo "👉 https://$DOMAIN 👈"
echo ""
echo "If they use this new HTTPS URL, their phone browsers will allow the live camera to open!"
