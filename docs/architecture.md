
# Architecture

## Index

- [Packages](#packages)
- [Server](#server)
- [Lib](#lib)
- [Startup](#startup)
- [buildApp](#buildapp)
- [CLI](#cli)
- [Docker](#docker)

## Packages

npm workspaces of the root `package.json`.

```
 ┌────────────┐ geopicker  ┌────────────┐
 │ benchmark/ │───────────▶│ cli/       │
 └─────┬──────┘            └──┬──────┬──┘
       │ spawn / HTTP         │      │ get/set
       ▼                      ▼      │
 ┌──────────────────────────────┐    │
 │ server/  (Fastify)           │    │
 └──────────────┬───────────────┘    │
                ▼                    ▼
 ┌───────────────────────────────────────┐
 │ lib/  (GDAL core)                     │
 └───────────────────────────────────────┘
```

The server never requires the CLI: the `geopicker` command of the Docker image is linked by the root workspaces install.

## Server

```
 server/
 ┌─────────────────────────────────────────────────────────────────┐
 │ ┌───────────┐ loadConfig ┌─────────────────┐                    │
 │ │ server.js │───────────▶│ parserConfig.js │◀─ config.yml       │
 │ └─────┬─────┘            └─────────────────┘◀─ schemas/config.js│
 │       │ start()                                                 │
 │       ▼                                                         │
 │ ┌───────────┐                                                   │
 │ │ app.js    │                                                   │
 │ └──┬─────┬──┘                                                   │
 │    │     ▼                                                      │
 │    │  ┌──────────────────────┐        ┌──────────────────────┐  │
 │    │  │ plugins/             │ merge  │ schemas/             │  │
 │    │  │ errors datasets      │───────▶│ datasets geometry    │  │
 │    │  │ schema validation    │        │ locations lonlat     │  │
 │    │  │ dataparser densify   │        │ metadata params      │  │
 │    │  │ simplify precision   │        │ query status         │  │
 │    │  │ format swagger       │        └──────────────────────┘  │
 │    │  │ verbose              │ onSend ┌──────────────────────┐  │
 │    │  │                      │───────▶│ formats/             │  │
 │    │  └──────────────────────┘        │ array json geojson   │  │
 │    │                                  │ gpx polyline wkt     │  │
 │    ▼                                  └──────────────────────┘  │
 │ ┌──────────────────────┐                                        │
 │ │ routes/              │──────▶ lib/                            │
 │ │ status datasets      │                                        │
 │ │ lonlat locations     │                                        │
 │ │ geometry metadata    │                                        │
 │ │ contour demopage     │                                        │
 │ └──────────────────────┘                                        │
 └─────────────────────────────────────────────────────────────────┘
```

## Lib

```
 lib/
 ┌───────────────────────────────────────┐
 │ geopicker.js  openFile getValue       │
 │    │          setValue                │
 │    ▼                                  │
 │ utils/  index.js                      │
 │         contour.js densify.js         │
 │         simplify.js                   │
 └─────────┬───────────────────┬─────────┘
           ▼                   ▼
       gdal-async          @turf/turf
```

## Startup

```
 npm start / dev ──────────┐
 benchmark spawn ──────────┤
 geopicker server-start ───┤   (Docker CMD)
                           ▼
 server.js
   loadConfig()   file → env CONFIG → server/config.yml
   start()        buildApp(config) → listen({host, port})
```

## buildApp

```
 Fastify(config.fastifyConf)
   decorators   config gpicker package utils status
   plugins      errors → datasets → schema → validation → dataparser
                → densify → simplify → precision → format
   optional     cors compress swagger demopage verbose
   routes       status datasets lonlat locations geometry metadata contour
```

## CLI

| Command | Uses |
|---------|------|
| `--get`, `--set` | `lib/geopicker.js` |
| `config-validate`, `config-show`, `server-status` | `server.loadConfig()` |
| `config-generate` | `server/parserConfig.js`, `server/schemas/config.js` |
| `server-start` | `server.start()` |

## Docker

```
 host                          container  /home
 ┌──────────────────┐          ┌──────────────────────────────────────┐
 │ tests/data/      │─────────▶│ /data            datapath            │
 │ custom.config.yml│─────────▶│ server/config.yml                    │
 │ 127.0.0.1:8080   │◀─────────│ :8080                                │
 └──────────────────┘          │                                      │
                               │ CMD geopicker server-start           │
                               │       --config server/config.yml     │
                               │   └─ node_modules/.bin/geopicker     │
                               │        └─ cli/ → server/ → lib/      │
                               └──────────────────────────────────────┘
```
