
# Development

Run from source in development mode (requirements in the main README "Usage" section):

```bash
npm install
npm run dev
```

then browse the demo page: http://localhost:9090/

## Contributor scripts

some useful tools for contributors `npm run <scriptname>`

- `start` run in production mode
- `dev` run in development mode
- `lint` run eslint on the whole repo
- `validate-custom-config` validate `server/custom.config.yml` via the cli
- `docker-build` build the docker image
- `docker-up` run in local docker-compose container
- `bench` run benchmarks

## Release

Publishing a new release is a two step flow, driven by the `postversion` and `postpublish` scripts in `package.json`.

Prerequisites: publish rights on the [@stefcud/geopicker](https://www.npmjs.com/package/@stefcud/geopicker) npm package (`npm login`) and push rights on the [stefcud/geopicker](https://hub.docker.com/r/stefcud/geopicker) Docker Hub repository (`docker login`).

1. bump the version — creates the version commit and the git tag, then (`postversion`) pushes both to the remote:

```bash
npm version patch   # or: minor, major
```

2. publish — pushes the package (`lib/` and `cli/`, see `files` in `package.json`) to the npm registry, then (`postpublish`) builds the Docker image and pushes it to Docker Hub tagged both `latest` and the new version:

```bash
npm publish .
```
