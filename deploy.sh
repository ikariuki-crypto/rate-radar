#!/usr/bin/env bash
# Deploys Rate Radar to both web servers behind the load balancer
for ip in 13.40.8.127 18.175.136.125; do
  ssh ubuntu@"$ip" 'sudo mkdir -p /var/www/html/rate-radar && sudo chown ubuntu /var/www/html/rate-radar'
  scp index.html style.css app.js ubuntu@"$ip":/var/www/html/rate-radar/
done
