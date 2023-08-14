@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM 1. Check if git, cargo, anchor, and solana are installed
for %%c in (git cargo anchor solana) do (
    where /q %%c
    if ErrorLevel 1 (
        echo "%%c is not installed" 
        exit /b 1
    )
)

REM 2. Determine if there is a parent directory with an already initialized git repository
REM if no, then initialize a new git repository
git rev-parse --is-inside-work-tree >nul 2>&1
if ErrorLevel 1 (
    git init
) else (
    echo "Skipping git initialization"
)

REM 3. Determine the NodeJS package manager and run install command to generate lockfile
npm install

REM 4. Run 'anchor keys sync' to update PID, then run anchor build
anchor keys sync >nul 2>&1

REM 5. Echo some helpful commands for the user to get started
echo.
echo Getting Started:
echo.
echo     - make: build the sgx-function docker image
echo     - make measurement: view the sgx-function's latest MrEnclave measurement

ENDLOCAL
