# rkuSOL Ecosystem Map

An unofficial, open-source 3D visualization of the rkuSOL liquid staking token
ecosystem on Solana, and a tracker of its historical on-chain data.

**Live: https://rkusol-map.netlify.app/**

## What it shows

- Protocols that integrate rkuSOL, drawn as orbiting planets
- History of rkuSOL supply, holder count, price, and Kamino collateral
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
| Supply, holder count, price | Jupiter Token API (Solana RPC as fallback) |
| Kamino collateral, protocol TVL, past prices | DeFiLlama |

## Historical data

Historical records begin in June 2026, but earlier records contain partial metric
coverage. Automated daily snapshots have been maintained through GitHub Actions since
September 2026, when upstream data is available. Records are stored in
`public/history.json`.

| Metric | Coverage |
| --- | --- |
| Price, Kamino collateral | From 2026-06-12 (June to early September largely backfilled from DeFiLlama history) |
| Supply | A few points in June and July 2026, then from 2026-09-03 |
| Holder count | From 2026-09-03 |

Supply and holder count have no public history API, so a missed day cannot be
filled in later and is left as a gap.

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

## License

The original source code is released under the [MIT License](LICENSE).
Third-party trademarks, logos, and images (including Raiku and rkuSOL assets)
belong to their respective owners and are not covered by the MIT License.
See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
