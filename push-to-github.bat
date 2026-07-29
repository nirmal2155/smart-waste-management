@echo off
title Push EcoFlow to GitHub (nirmal2155)
color 0a
echo ========================================================
echo   EcoFlow Smart Waste Management - GitHub Automated Uploader
echo ========================================================
echo.

set /p TOKEN="Enter your GitHub Personal Access Token (ghp_...): "

if "%TOKEN%"=="" (
    echo Error: Token cannot be empty.
    pause
    exit /b
)

echo.
echo [1/4] Preparing project files...
powershell -ExecutionPolicy Bypass -File .\upload-script.ps1 -Token "%TOKEN%"

echo.
echo ========================================================
echo Process Finished! Check your repository: https://github.com/nirmal2155/smart-waste-management
echo ========================================================
pause
