FROM node:18.12-alpine
#https://github.com/nodejs/docker-node/blob/main/18/alpine3.16/Dockerfile
FROM osgeo/gdal:ubuntu-small-latest
#https://github.com/OSGeo/gdal/blob/master/docker/alpine-small/Dockerfile

#RUN apk add python3 gdal-dev
	#make g++
RUN  apt-get update -y && apt-get install -y sudo libgdal-dev

# COPY --from=0 /usr/local/bin/node /usr/local/bin/node
# COPY --from=0 /usr/local/bin/nodejs /usr/local/bin/nodejs
# COPY --from=0 /usr/local/lib/node_modules /usr/local/lib/node_modules
# WORKDIR /usr/local/bin/
# RUN ln -s ../lib/node_modules/npm/bin/npm-cli.js npm
# RUN ln -s ../lib/node_modules/npm/bin/npx-cli.js npx

RUN curl -sL https://deb.nodesource.com/setup_18.x | sudo bash - && \
	apt-get install -y nodejs build-essential

WORKDIR /home

COPY ./ ./

#RUN npm install gdal-next --shared_gdal
RUN npm install gdal-next
RUN npm install

EXPOSE 8080

CMD ["node", "server/index.js"]
