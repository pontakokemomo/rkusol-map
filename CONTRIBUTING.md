# Contributing

Thanks for your interest in rkuSOL Ecosystem Map. This is a small project, and bug
reports, ideas, and pull requests are all welcome.

## Local development

Node.js 22 is recommended (the same version CI uses).

```
npm ci        # install exactly what the lockfile pins
npm run dev   # http://localhost:5173
```

## Before you submit a change

Make sure both of these pass:

```
npm run lint
npm run build
```

CI runs the same checks on every push and pull request.

## Bug reports

Please open an issue and include:

- Steps to reproduce
- What you expected to happen
- What actually happened
- A screenshot, if it helps

## Feature suggestions

Please open an issue and describe:

- What you would like to improve
- Why it would be useful

## Pull requests

- Keep each pull request focused on one purpose.
- Avoid large changes that the purpose does not need, such as unrelated
  refactoring or reformatting.
- Confirm that `npm run lint` and `npm run build` pass.

## Historical data

`public/history.json` holds the daily record of rkuSOL metrics. Some past values
cannot be recovered from any API, so please do not delete or rewrite existing
records without a clear reason explained in the pull request. New records are
added automatically by the daily snapshot workflow, so pull requests normally do
not need to touch this file.

## Unofficial project

This is an unofficial fan project. It is not affiliated with, endorsed by, or
operated by Raiku.
