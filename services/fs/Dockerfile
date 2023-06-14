FROM node:18-alpine as deps
RUN apk add --no-cache libc6-compat python3 make g++ make jq
WORKDIR /app
COPY ./package.json /app/
RUN cd /app \
    && jq -c 'del(.devDependencies)' package.json > package.json.tmp \
    && mv package.json.tmp package.json \
    && npm install --omit=dev --omit=optional

FROM node:18-alpine as build
RUN apk add --no-cache libc6-compat python3 make g++ make \ 
      && npm install -g pkg
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY ./package.json ./tsconfig.json /app/
COPY ./dist/ /app/dist/
RUN cd /app \
    && pkg -t node18-alpine -o ./fs-server ./dist/server.js

FROM rclone/rclone as rclone
WORKDIR /app
COPY --from=build /app/fs-server /usr/local/bin/fs-server
COPY ./package.json ./entry.sh /app/
RUN chmod 755 /app/entry.sh /usr/local/bin/fs-server
RUN mkdir -p /data/local/uploads

ENV PORT 3001
ENV HOST 0.0.0.0
ENV DATA_DIR /data
ENV RCLONE_PORT 5001
ENV RCLONE_ADDR 127.0.0.1:$RCLONE_PORT

ENTRYPOINT ["/app/entry.sh"]
CMD ["fs-server"]