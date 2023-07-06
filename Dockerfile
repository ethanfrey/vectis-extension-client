# docker build . -t pulsar/vectis-todo:latest

# Build stage for a Node.js application
FROM node:18-bullseye as build-stage

WORKDIR /app
COPY . /app

# Yarn install
# hack: https://github.com/evanw/esbuild/issues/2812
ENV ESBUILD_BINARY_PATH ""
RUN yarn install --network-timeout 100000

# Build lib
WORKDIR /app/lib
RUN yarn build

# Build vectis client
WORKDIR /app/examples/vectis-client
RUN yarn build

# Production stage
FROM nginx:stable-alpine

COPY --from=build-stage /app/examples/vectis-client/dist /usr/share/nginx/html

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]

