FROM node:18-buster-slim

WORKDIR /home

# Copy only the dependency manifests before the rest of the code: as long as
# these don't change, Docker reuses the cache and skips npm install even when
# other files change (routes, config, index.html, cli commands, etc).
COPY package.json package-lock.json ./
COPY server/package.json ./server/
COPY cli/package.json ./cli/
RUN npm install

# Make workspace bins (geopicker-cli's `geopicker` command, symlinked by npm
# into node_modules/.bin) runnable by name from anywhere in the container.
ENV PATH="/home/node_modules/.bin:${PATH}"

# Source code is copied last: its changes only invalidate this layer, not
# the npm install step above.
COPY ./ ./

CMD ["node", "server/server.js"]
