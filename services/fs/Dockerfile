FROM node:18-alpine as deps
RUN apk add --no-cache libc6-compat python3 make g++ make
WORKDIR /app
COPY package.json /app/
RUN cd /app \
    && yarn install

FROM node:18-alpine as build
RUN apk add --no-cache libc6-compat python3 make g++ make
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY ./package.json ./tsconfig.json /app/
COPY ./src/ /app/src/
RUN cd /app \
    && ./node_modules/.bin/ncc build ./src/server.ts -o ./dist --external cpu-features --external pg-cloudflare \
    && ./node_modules/.bin/pkg --transpile-only -t node18-alpine -o ./fs-server ./dist/index.js

FROM rclone/rclone
WORKDIR /app
COPY --from=build /app/ /app
COPY ./package.json ./entry.sh /app/
RUN mkdir -p /data/local/uploads \
    && ls /app

ENV PORT 4000
ENV HOST 0.0.0.0
ENV DATA_DIR /data
ENV RCLONE_PORT 5001
ENV RCLONE_ADDR 127.0.0.1:$RCLONE_PORT

ENTRYPOINT ["/app/entry.sh"]
CMD ["/app/fs-server"]