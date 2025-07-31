FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y openssl

COPY . .

RUN npm run build:server

EXPOSE 80

CMD ["node", "./dist/server/index.js"]