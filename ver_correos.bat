@echo off
echo Buscando correos enviados ultimamente...
echo.
docker-compose logs --tail=20 backend
echo.
echo Copia el enlace que aparece arriba (si hay alguno) y pegalo en tu navegador.
echo.
pause
