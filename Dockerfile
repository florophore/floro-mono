FROM node:16.16.0-alpine

ARG cdn_host_arg

ENV CDN_HOST=$cdn_host_arg

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

RUN yarn

COPY . /app

CMD yarn build:main

COPY . .

EXPOSE 9000

CMD [ "yarn", "main:start" ]