FROM node:18.12-alpine as node

FROM osgeo/gdal:alpine-small-latest
#https://github.com/OSGeo/gdal/blob/master/docker/alpine-small/Dockerfile


COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/bin/npm /usr/local/bin/npm
COPY --from=node /usr/local/bin/npx /usr/local/bin/npx
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm


ENV NODE_PATH=/usr/local/lib/node_modules
RUN ls /usr/local/lib/node_modules

WORKDIR /home


COPY ./ ./
#RUN npm version
# RUN cd server && npm install

RUN npm install
CMD ["sh"]
#CMD ["node", "server/index.js"]
