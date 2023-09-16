FROM node:16.16.0-alpine

RUN apk add g++ make py3-pip

WORKDIR /app

COPY package.json /app

COPY yarn.lock /app

COPY . /app

RUN yarn install
#
#RUN yarn build:main

COPY . .

EXPOSE 9000

CMD [ "yarn", "main:start" ]