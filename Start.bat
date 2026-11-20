@echo off

start "Angular" cmd /k "npx ng serve --port 4200"

timeout /t 5 /nobreak >nul

start "Cloudflare" cmd /k "cloudflared tunnel --url http://localhost:4200/"

exit