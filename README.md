# Kuma Community

Kuma Community is a collection of practical guides on civilian preparedness and technology. This repository contains the articles and source code for [www.kumacommunity.com](https://www.kumacommunity.com).

## Local development

The site uses Docusaurus. The project pins Node.js 26.13.1 and npm 12.2.3. With `nvm` installed, run these commands from the repository root:

```sh
nvm install
nvm use
npm install --global npm@12.2.3
npm ci
npm start
```

Open `http://localhost:3000`. The site reloads as you edit.

| Directory | Contents |
|---|---|
| `docs/` | Guides and reference articles |
| `blog/` | Blog posts, authors, and tags |
| `src/` | React components, standalone pages, and styles |
| `static/` | Images and other files served as-is |
| `e2e/` | Playwright tests |

## Checking changes

Install Chromium once with `npx playwright install chromium`. Then run `npm run check` to check TypeScript, build the site, and run the browser tests. To preview the production build locally, run `npm run serve`.

Keep the `@docusaurus/*` packages on the same version when upgrading. See the [modernization report](./MODERNIZATION_REPORT.md) for details on the TypeScript configuration and dependency overrides.

## Contributing

Pull requests are currently closed. To suggest a code change, report an error, or propose an article, follow the email instructions on the site’s Contributing page. For a bug, include steps to reproduce it. For an article, send a short outline and any sources you plan to use.

## License

The site source is licensed under the [GNU General Public License v3.0](./LICENSE).