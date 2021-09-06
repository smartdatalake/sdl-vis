FROM node:15.5.1-buster


#############################################
# See: https://stackoverflow.com/a/62627073 #
#############################################
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY app .

RUN chown -R node:node /usr/src/app

USER node

RUN npm install
# `npm rebuild node-sass` is a workaround for https://gitlab.dbvis.de/SmartDataLake/development/-/issues/8.
RUN npm rebuild node-sass
