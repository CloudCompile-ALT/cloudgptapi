#!/bin/bash

# CloudGPT Honeypot & SSH Tunnel Setup
# Target VPS: 157.151.169.121

echo "Setting up honeypot tunnel..."

# Configuration
VPS_IP="157.151.169.121"
VPS_PORT="8000"
SSH_KEY="./ssh-key-2026-01-10.key"
VPS_USER="opc" # Oracle Cloud default user

# 1. Fix permissions for the SSH key
chmod 600 "$SSH_KEY"

# 2. Instructions for the user
echo "--------------------------------------------------------"
echo "Honeypot Endpoint: /security (and all sub-paths)"
echo "Traffic is being forwarded to: http://$VPS_IP:$VPS_PORT"
echo "--------------------------------------------------------"
echo ""
echo "To set up the SSH tunnel on your VPS, run one of the following:"
echo ""
echo "Option A: Reverse Tunnel (VPS -> Local Collector)"
echo "Use this if you want to analyze traffic on your local machine."
echo "Command (run from your local machine):"
echo "ssh -i $SSH_KEY -R $VPS_PORT:localhost:8000 $VPS_USER@$VPS_IP"
echo ""
echo "Option B: Local Tunnel (App Server -> VPS)"
echo "Use this if the VPS port $VPS_PORT is only accessible via localhost."
echo "Command (run from the server hosting CloudGPT):"
echo "ssh -i $SSH_KEY -L $VPS_PORT:localhost:8000 $VPS_USER@$VPS_IP"
echo ""
echo "Option C: Persistent Tunnel (systemd)"
echo "Create a service file /etc/systemd/system/honeypot-tunnel.service on the VPS:"
echo "[Unit]"
echo "Description=Honeypot SSH Tunnel"
echo "After=network.target"
echo ""
echo "[Service]"
echo "ExecStart=/usr/bin/ssh -i /path/to/key -N -R $VPS_PORT:localhost:8000 $VPS_USER@$VPS_IP"
echo "Restart=always"
echo "RestartSec=10"
echo ""
echo "[Install]"
echo "WantedBy=multi-user.target"
echo "--------------------------------------------------------"
