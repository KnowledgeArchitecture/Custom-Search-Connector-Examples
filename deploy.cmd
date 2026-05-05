@echo off
setlocal

if "%PROJECT_DIR%"=="" (
  echo ERROR: PROJECT_DIR environment variable is not set. 1>&2
  exit /b 1
)

set SCRIPT=%DEPLOYMENT_SOURCE%\%PROJECT_DIR%\deploy.cmd

if not exist "%SCRIPT%" (
  echo ERROR: No deploy.cmd found at %SCRIPT% 1>&2
  exit /b 1
)

call "%SCRIPT%"
