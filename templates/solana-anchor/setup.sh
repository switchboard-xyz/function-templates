#!/bin/bash

set -eo pipefail

#1, check if git, cargo, anchor, and solana are installed

#2, determine if there is a parent directory with an already initialized git repository
# if no, then initialize a new git repository
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Skipping git initialization"
else
    git init
fi

#3, determine the NodeJS package manager and run install command to generate lockfile
npm install

#4, run 'anchor keys sync' to update PID, then run anchor build
anchor keys sync > /dev/null 2>&1

#5, echo some helpful commands for the user to get started
printf "\nGetting Started:\n"
printf "\n\t- %s: %s" "make" "build the sgx-function docker image"
printf "\n\t- %s: %s" "make measurement" "view the sgx-function's latest MrEnclave measurement"