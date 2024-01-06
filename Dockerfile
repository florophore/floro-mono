FROM node:16.16.0-alpine

RUN apk add g++ make py3-pip

RUN apk update && apk add bind-tools

ARG cdn_host_arg

ENV CDN_HOST=$cdn_host_arg

ARG vite_host_arg

ENV VITE_HOST=$vite_host_arg

ARG vite_is_secure_arg

ENV VITE_IS_SECURE=$vite_is_secure_arg

ARG vite_build_env_normalized_arg

ENV VITE_BUILD_ENV_NORMALIZED=$vite_build_env_normalized_arg

ARG floro_remote_api_key_arg

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

COPY . /app

RUN yarn install

RUN npm install -g floro

RUN floro module build -m packages/common-generators/floro.module.js -k $floro_remote_api_key_arg

RUN yarn graphql-schemas:build

RUN yarn postprocess:locales

RUN yarn main build

COPY . .

EXPOSE 9000

CMD [ "yarn", "main:start" ]