# rkuSOL Ecosystem Map

An unofficial 3D visualization of the rkuSOL liquid staking token ecosystem on Solana.

**Live: https://rkusol-map.netlify.app/**

## What it shows

- rkuSOL supply, holder count, and Kamino collateral, recorded daily since June 2026
- Protocols that integrate rkuSOL, drawn as orbiting planets
- Growth measured in token counts, never USD, so price moves cannot inflate it

Sparklines use a non-zero baseline so small movements stay visible, and always print
the real `min - max` range underneath. Days with no record are drawn as a dotted
segment rather than a straight line, so the chart never implies a measurement that
was not taken.

## Disclaimer

This is an unofficial fan site. It is not affiliated with, endorsed by, or operated
by Raiku. Every figure is taken from a public source and is not investment advice.

## Data sources

| Metric | Source |
| --- | --- |
| Supply, holder count | Jupiter Token API (Solana RPC as fallback) |
| Kamino collateral, protocol TVL | DeFiLlama |

A GitHub Action records one snapshot per day into `public/history.json`. Past values
are not available from any API, so the record only grows forward from June 2026.

## How it is built

Built with Claude Code (Anthropic). Project direction, fact-checking, and QA by the
author.

## Stack

React 19, TypeScript, Vite, Three.js (`@react-three/fiber`, `drei`, `postprocessing`),
zustand.

## Development

```
npm ci        # install exactly what the lockfile pins
npm run dev   # http://localhost:5173
npm run build # output to dist/
```
