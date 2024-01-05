#FROM node:alpine
FROM node:18.16.0-slim

WORKDIR /app

# Install app dependencies
COPY package*.json ./
COPY .env ./

#RUN npm install -g npm@latest

RUN npm install

# Bundle app source
COPY . .

EXPOSE 80

CMD [ "npm", "start" ]


