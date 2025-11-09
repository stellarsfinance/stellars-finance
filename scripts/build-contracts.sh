#!/bin/bash

# Build all Soroban contracts to WASM
# This script compiles all contracts in the contracts directory

set -e

echo "Building Stellars Finance contracts..."

cd contracts

# Build all contracts using the Cargo workspace
stellar contract build

echo "✓ All contracts built successfully"
echo "WASM files are in: contracts/target/wasm32v1-none/release/"
