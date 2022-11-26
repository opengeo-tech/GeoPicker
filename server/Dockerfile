FROM node:18-buster-slim

WORKDIR /home

COPY ./ ./

RUN npm install
RUN cd server && npm install

CMD ["node", "server/index.js"]
