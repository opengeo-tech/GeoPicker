FROM node:18.12-alpine AS builder
#https://github.com/nodejs/docker-node/blob/main/18/alpine3.16/Dockerfile


FROM osgeo/gdal:alpine-small-latest
#https://github.com/OSGeo/gdal/blob/master/docker/alpine-small/Dockerfile

RUN apk add file

COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/bin/nodejs /usr/local/bin/nodejs
#COPY --from=builder /usr/local/bin/npm /usr/local/bin/npm
#COPY --from=builder /usr/local/bin/npx /usr/local/bin/npx
COPY --from=builder /usr/local/lib/node_modules /usr/local/lib/node_modules

WORKDIR /usr/local/bin/

RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js npm
RUN ln -s ../lib/node_modules/npm/bin/npx-cli.js npx

WORKDIR /home

RUN npm install express
RUN echo "const e = require('express')();e.get('/',(req,res)=>{res.send({ciao:'mondo'})}).listen(3000)" > index.js

CMD ["node","index.js"]

#COPY ./ ./
#RUN npm version
# RUN cd server && npm install

#RUN npm install

#CMD ["sh"]
#CMD ["node", "server/index.js"]
