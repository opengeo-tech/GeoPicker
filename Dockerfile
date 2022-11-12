FROM node:18.12-alpine

WORKDIR /home

COPY ./ ./

RUN apk add --no-cache --virtual .gyp build-base cmake python3 make g++ gdal gdal-dev
#RUN apk add gdal-dev --virtual .gyp python
RUN npm install gdal-next --build-from-source --shared_gdal
#--build-from-source
RUN npm install

CMD ["node", "server/index.js"]
