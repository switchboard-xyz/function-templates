#!/bin/bash

set -euo pipefail

if [[ ! -e "/sgx-detect/sgx-detect" ]]; then
    echo "ERROR: sgx-detect not found"
    exit 1
fi

if [[ ! -e "/sgx/app/index.js" ]]; then
    echo "ERROR: index.js not found at /sgx/app"
    exit 1
fi

# Start SGX-enabled application
echo "Starting enclave.."
gramine-sgx /sgx/app
