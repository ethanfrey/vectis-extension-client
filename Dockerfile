# docker build . -t pulsar/vectis-todo:latest

# build stage for a Node.js application
FROM node:20-bullseye as build-stage
WORKDIR /app
COPY . /app
RUN echo $ESBUILD_BINARY_PATH
RUN ESBUILD_BINARY_PATH="" yarn install
WORKDIR /app/examples/vectis-client
RUN yarn build

# production stage
FROM nginx:stable-bullseye as production-stage
COPY --from=build-stage /app/examples/vectis-client/dist /usr/share/nginx/html
EXPOSE 8000
CMD ["nginx", "-g", "daemon off;"]