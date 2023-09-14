FROM node:16.16.0-alpine

ARG cdn_host_arg

ENV CDN_HOST=$cdn_host_arg

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

COPY . /app

COPY . .

RUN yarn

CMD yarn build:main

EXPOSE 9000

CMD [ "yarn", "main:start" ]