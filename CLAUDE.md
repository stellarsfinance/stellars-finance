# Overview
- Stellars Finance is a Perps Protocol on the Stellars Blockchain
- It's written in Soroban, a framework for rust

# Structure
- This is a monorepo:
 - bindings: generated js bindings to be used in the frontend and backend, can be generated using a script
 - contracts: the soroban contracts, can be build and tested using a script
 - deployments: collection of json files to find the contract addresses, useful for server and frontend
 - frontend: a vite + react app to interact with the blockchain
 - packages: collection for other code we might need to share between packages
 - scripts: scripts for building, generating bindings, deployment and more


# Bash commands
- npm run dev (start frontend in dev mode)
- npm run build (build frontend)
- npm run build:contracts (build contracts)
- npm run generate:bindings (generate ts bindings for the contracts)
- npm run test:contracts (run tests for the contracts)
- npm run test:unit (run only unit tests for the contracts)
- npm run test:e2e (run only e2e tests for the contracts)

# Code style
- Use ES modules (import/export) syntax, not CommonJS (require)
- Destructure imports when possible (eg. import { foo } from 'bar')
- Keep code readable and maintainable
- Use best practices like SOLID
- Reuse functions as much as possible
- Add comments only for important and critical business logic
- Aviod "else", use returns as possible
- Aviod nested logic, deep indentation, long functions

# Workflow
- Use the avaiable bash commands whenever possible (npm run test instead of cargo test)
- Think critical and ask questions if not sure
- Only focus at the task at hand