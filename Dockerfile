FROM node:16.16.0-alpine

RUN apk add g++ make py3-pip

WORKDIR /app

COPY . .

EXPOSE 9000

CMD [ "yarn", "main:start" ]