#FROM node:18.12-alpine
#https://github.com/nodejs/docker-node/blob/main/18/alpine3.16/Dockerfile
# COPY --from=0 /usr/local/bin/node /usr/local/bin/node
# COPY --from=0 /usr/local/bin/nodejs /usr/local/bin/nodejs
# COPY --from=0 /usr/local/lib/node_modules /usr/local/lib/node_modules
# WORKDIR /usr/local/bin/
# RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js npm
# RUN ln -s ../lib/node_modules/npm/bin/npx-cli.js npx

FROM osgeo/gdal:ubuntu-small-latest
#https://github.com/OSGeo/gdal/blob/master/docker/alpine-small/Dockerfile

RUN curl -sL https://deb.nodesource.com/setup_18.x | bash -
RUN apt-get update -y && apt-get install -y \
	build-essential \
	libgdal-dev \
	nodejs \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /home

COPY ./ ./

RUN npm install
RUN cd server && npm install

CMD ["node", "server/index.js"]
