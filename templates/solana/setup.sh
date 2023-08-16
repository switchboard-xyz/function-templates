#!/bin/bash

set -eo pipefail

Color_Off=$'\033[0m'
Red=$'\033[31;1m'
Green=$'\033[0;32m'
Blue=$'\033[0;34m'

# Parse command-line arguments for the -y flag
SKIP_PROMPTS=0
while getopts ":y" option; do
    case $option in
        y) SKIP_PROMPTS=1 ;;
        *) echo "Unknown option: -$OPTARG" && exit 1 ;;
    esac
done
should_install() {
    local software=$1
    if ! command -v "${software}" >/dev/null 2>&1; then
        if [[ ${SKIP_PROMPTS} -eq 1 ]]; then
            # TODO: log warning
            return 1  # Do not install
        else
            read -rp "${software} not installed, do you want to install it? [yN] " answer
            case ${answer} in
                [yY]) return 1 ;;  # Proceed with installation.
                *) return 0 ;;  # Do not proceed.
            esac
        fi
    fi
    return 0
}

#1, determine if there is a parent directory with an already initialized git repository
# if no, then initialize a new git repository
if git rev-parse --is-inside-work-tree > /dev/null 2>&1; then
    echo "Existing git repository detected"
else
    git init
fi

#2, check if rust, anchor, and solana are installed
if [[ $(should_install "rustup") -eq "1" ]]; then
    echo -e "${Green}Installing Rust ...${Color_Off}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh > /dev/null 2>&1
fi
if [[ $(should_install "solana") -eq "1" ]]; then
    echo -e "${Green}Installing Solana ...${Color_Off}"
    sh -c "$(curl -sSfL https://release.solana.com/stable/install)" > /dev/null 2>&1
fi

#3, determine the NodeJS package manager and run install command to generate lockfile
if [[ -f "package.json" ]]; then
   npm install
fi

#4 echo some helpful commands for the user to get started
printf "\n%sGetting Started:%s\n" "${Green}" "${Color_Off}"
printf " > start by editing the Makefile with your docker repository\n"
printf " > then update the switchboard-function with your custom off-chain logic\n"
printf " > then run one of the following commands to deploy your function\n"
printf "\t- %s: %s\n" "${Blue}make${Color_Off}" "build the switchboard-function docker image"
printf "\t- %s: %s\n" "${Blue}make measurement${Color_Off}" "view the switchboard-function's latest MrEnclave measurement"