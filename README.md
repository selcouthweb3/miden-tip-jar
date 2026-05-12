# Miden Tip Jar

Miden Tip Jar is a Miden testnet dApp for sending private, anonymous tips to creators using the Miden ZK rollup. It connects to a Miden-compatible browser wallet, hides the sender's identity through zero-knowledge proofs, and lets creators receive and withdraw tips from a dedicated dashboard.

Live app: miden-tip-jar.vercel.app
Repository: github.com/selcouthweb3/miden-tip-jar

## Overview

Miden uses a privacy-first account and note model where transaction senders can remain completely hidden from public view. Miden Tip Jar is built around that model:

- Send anonymous tips to a creator's Miden account
- Watch ZK proof generation steps animate in real time
- Track live network stats including block height, TPS, and proof time
- Manage received tips and withdrawals from a creator dashboard
- Share a unique tip link with your audience

Miden Tip Jar does not custody keys or sign transactions internally. All sensitive wallet actions are routed through the Miden wallet adapter.

### Landing Page

![Miden Tip Jar Landing Page](/assets/miden%20landing%20page.png)

### ZK Proof in Action

![ZK Proof Animation](/assets/miden%20zk%20proof.png)

### Creator Dashboard

![Creator Dashboard](/assets/miden%20creator%20dashboard.png)

## Testnet Flow

1. Open miden-tip-jar.vercel.app
2. Connect a Miden-compatible wallet on testnet
3. Enter an amount and optional message on the Send Tip tab
4. Click Send Private Tip and watch the ZK proof generation animate live
5. Switch to Creator Dashboard to see incoming tips with transaction IDs
6. Withdraw accumulated tokens when ready

## Features

- **Real Miden wallet connection**: uses the Miden wallet adapter for connect, disconnect, and account sync
- **ZK Proof Visualizer**: step-by-step animation showing sender identity hidden, amount committed to ZK circuit, STARK proof generated, locally verified, and submitted to network
- **Live Network Stats**: block height, TPS, and average proof time refreshing every 3 seconds
- **Live Transaction Feed**: incoming tips animate into a feed with truncated transaction IDs and timestamps
- **Creator Dashboard**: tip history, total received balance, withdrawal flow, and shareable tip link
- **Miden-inspired UI**: dark theme with Miden green accents and monospace typography

## Architecture

Key files:

- `src/App.tsx` — full application including wallet flow, tip sending, ZK proof animation, creator dashboard, network stats, and live feed
- `src/main.tsx` — React entry point and Miden WalletProvider setup
- `index.html` — app shell with CSP configuration for Miden SDK

## Tech Stack

- React 18
- TypeScript
- Vite
- Miden SDK 0.14.x
- Miden wallet adapter
- react-hot-toast
- Vercel

## Requirements

- Node.js 20 or newer
- A Miden-compatible browser wallet
- A Miden testnet account

## Local Development

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Run the local dev server:

```bash
npm run dev
```

Open: http://localhost:5173

Build production assets:

```bash
npm run build
```

## Deployment

Miden Tip Jar is deployed on Vercel.

Recommended Vercel settings:

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install --legacy-peer-deps`

## Current Limitations

- Targets Miden testnet only
- Tip sending uses simulated ZK proof animation; real note-based transactions will plug in as the SDK matures
- Not audited and should not be used with mainnet funds

## Links

- App: miden-tip-jar.vercel.app
- GitHub: github.com/selcouthweb3/miden-tip-jar
- Miden docs: docs.miden.xyz
- X: x.com/_Haboye