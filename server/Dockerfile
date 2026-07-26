FROM node:18-buster-slim

WORKDIR /home

# Copy only the dependency manifests before the rest of the code: as long as
# these files don't change, Docker reuses the cache for these layers and
# skips npm install even when other files under /server change (e.g.
# index.html, routes, config).
COPY package.json package-lock.json ./
RUN npm install

COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm install

# Source code is copied last: its changes only invalidate this layer, not
# the two npm install steps above.
COPY ./ ./

CMD ["node", "server/server.js"]
