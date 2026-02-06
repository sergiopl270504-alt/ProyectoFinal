@echo off
echo [CASAFINDER] Iniciando entorno con Docker...
docker-compose up -d

echo.
echo [CASAFINDER] Esperando servicios (5 seg)...
timeout /t 5 /nobreak >nul

echo.
echo [CASAFINDER] Abriendo http://localhost:8080 ...
start "" "http://localhost:8080"

echo.
echo [CASAFINDER] Todo listo. Pulsa cualquier tecla para ver los logs o cierra esta ventana.
pause
docker-compose logs -f
