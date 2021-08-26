FROM node:14
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i
COPY . .
RUN npx tsc

CMD ["node", "index.js"]
