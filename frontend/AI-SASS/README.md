# Quick AI frontend

React 19 application built with Rollup, Babel, and Tailwind CSS. See the [root README](../../README.md) for the full application setup, provider configuration, and production limitations.

```sh
npm install
npm run lint
npm run build
npm run preview
```

The preview server serves the SPA on port 4173 and proxies `/api` to the backend. Build output uses root-relative assets so nested routes can be opened directly.
