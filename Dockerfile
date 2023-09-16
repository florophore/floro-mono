FROM node:16.16.0-alpine

RUN apk add g++ make py3-pip

ARG cdn_host_arg

ENV CDN_HOST=$cdn_host_arg

ARG vite_host_arg

ENV VITE_HOST=$vite_host_arg

ARG vite_host_arg

ENV VITE_IS_SECURE=$vite_is_secure_arg

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

COPY . /app

RUN yarn install

RUN yarn build:main

COPY . .

EXPOSE 9000

CMD [ "yarn", "main:start" ]