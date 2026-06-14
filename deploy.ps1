npm run build
tar.exe -cf dist.tar -C dist .
scp dist.tar root@89.127.214.182:/root/
ssh root@89.127.214.182 "rm -rf /var/www/basingselegions/* && tar -xf /root/dist.tar -C /var/www/basingselegions/ && rm /root/dist.tar && (systemctl reload nginx || true)"
ssh root@89.127.214.182 "echo '--- index.html (first 20 lines) ---' && head -n 20 /var/www/basingselegions/index.html && echo '--- assets/index-* list ---' && ls -1 /var/www/basingselegions/assets/index-*.js"
