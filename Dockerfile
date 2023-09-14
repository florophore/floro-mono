FROM node:16.16.0-alpine

RUN apk add g++ make py3-pip

ARG cdn_host_arg

ENV CDN_HOST=$cdn_host_arg

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

RUN rm -rf packages/desktop-app/

COPY . /app

RUN yarn

RUN yarn build:main

COPY . .

EXPOSE 9000

CMD [ "npm", "run", "main:start" ]