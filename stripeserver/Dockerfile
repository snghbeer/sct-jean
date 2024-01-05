FROM node:18.16.0-slim as build-step

RUN mkdir -p /shared
RUN chmod -R 777 /shared


RUN mkdir /app
WORKDIR /app
COPY . /app

RUN npm install
COPY package*.json /dist
COPY .env /dist

RUN npm run tsc
COPY package*.json /dist
COPY .env /dist

EXPOSE 3002

# Start the server
CMD [ "npm", "start" ]


