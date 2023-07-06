# docker build . -t pulsar/vectis-todo:latest

# build stage for a Node.js application
FROM node:20-alpine as build-stage
WORKDIR /app
COPY . /app
# SHELL ["/bin/bash", "-c"]
RUN apk add --update --no-cache alpine-sdk linux-headers build-base gcc libusb-dev python3 py3-pip eudev-dev nodejs yarn
RUN ln -sf python3 /usr/bin/python
RUN yarn cache clean --all && rm yarn.lock && yarn install --network-timeout 100000
# RUN yarn install
WORKDIR /app/examples/vectis-client
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/examples/vectis-client/dist /usr/share/nginx/html
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]