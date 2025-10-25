# Provenance

A Solana blockchain-based content provenance system that allows users to register and verify the authenticity of AI-generated content.

## Overview

Provenance is built on the Solana blockchain using the Anchor framework. It provides a way to:
- Register content with its prompt and output hashes
- Verify the authenticity of registered content
- Track content modifications and updates

## Project Structure

- `/client` - Frontend application
- `/programs` - Solana program code
- `/tests` - Program tests
- `/migrations` - Deployment scripts

## Setup

### Prerequisites
- Rust (latest stable)
- Solana CLI
- Node.js & Yarn
- Anchor CLI

### Installation

1. Install dependencies:
   ```bash
   yarn install
   cd client && yarn install
   ```

2. Build the program:
   ```bash
   anchor build
   ```

3. Deploy the program:
   ```bash
   anchor deploy
   ```

4. Start the client:
   ```bash
   cd client
   yarn dev
   ```

## Routes

The application provides the following routes:

- `/` - Home/Landing page
- `/register` - Register new content
  - Submit a prompt and AI-generated output
  - The system will generate and store hashes of both
  - Returns a transaction signature for verification
- `/verify` - Verify content authenticity
  - Check if content has been registered
  - View registration details including timestamps and creator
- `/registry` - View registration history
  - Browse previously registered content
  - View detailed information about each registration

## Usage

1. Register content by providing a prompt and content
2. Verify content authenticity using the verification tool
3. View registration history and details

## License

MIT
