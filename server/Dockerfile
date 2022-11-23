FROM node:14-buster-slim

RUN apt-get -yqq update \
    && DEBIAN_FRONTEND=noninteractive apt-get -yqq install \
	build-essential \
	g++-6 \
	libc6-dev \
	libgdal-dev \
    make \
	&& apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /home

COPY ./ ./

RUN npm install --build-from-source

RUN cd server && npm install

CMD ["node", "server/index.js"]
