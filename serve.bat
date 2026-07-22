@echo off
title Arcanus Online - Dev Server
cd /d "%~dp0"

echo.
echo  ========================================
echo   Arcanus Online - Servidor Local
echo  ========================================
echo.

echo  Compilando index.html desde JSONs...
node scripts\build.js
echo.
echo  Abriendo http://localhost:3000 ...
echo  Cerrá esta ventana para detener.
echo.

start "" http://localhost:3000
node scripts\server.js
pause
