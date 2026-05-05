@echo off
setlocal

set BUILD_DIR=%DEPLOYMENT_SOURCE%\.build

:: Assemble both directories in a clean build workspace
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"
mkdir "%BUILD_DIR%\nodejs-deployed-to-azure-functions"
mkdir "%BUILD_DIR%\nodejs-simple-rss-scraper"

xcopy /e /i /y "%DEPLOYMENT_SOURCE%\nodejs-deployed-to-azure-functions" "%BUILD_DIR%\nodejs-deployed-to-azure-functions\"
xcopy /e /i /y "%DEPLOYMENT_SOURCE%\nodejs-simple-rss-scraper" "%BUILD_DIR%\nodejs-simple-rss-scraper\"

:: Install dependencies (resolves "file:../nodejs-simple-rss-scraper" correctly)
cd /d "%BUILD_DIR%\nodejs-deployed-to-azure-functions"
call npm install
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

:: Copy built output to deployment target
xcopy /e /i /y . "%DEPLOYMENT_TARGET%\"
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%
