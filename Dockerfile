FROM node:24

WORKDIR /app

COPY package*.json ./

RUN npm install

RUN apt-get update && apt-get install -y openssl

COPY . .

EXPOSE 80

CMD ["npm", "run", "server"]