FROM node:20-alpine as deps
RUN apk add --no-cache libc6-compat python3 make g++ make
WORKDIR /app
COPY ./package.json /app/
RUN cd /app \
    && yarn install

FROM node:20-alpine as build
RUN apk add --no-cache libc6-compat python3 make g++ make
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY ./package.json ./tsconfig.json /app/
COPY ./src/ /app/src/
RUN cd /app \
    && ./node_modules/.bin/ncc build ./src/server.ts -o ./dist --external cpu-features --external pg-cloudflare \
    && ./node_modules/.bin/pkg -t node18-linux -o ./workflow-server ./dist/index.js


FROM lukechannings/deno
WORKDIR /app
COPY --from=build /app/workflow-server /app/workflow-server
COPY ./entry.sh /app/entry.sh
RUN chmod 755 /app/entry.sh /app/workflow-server
RUN mkdir -p /var/workflow/data /var/workflow/working-dir

ENV WORKFLOWS_DIR /var/workflow/workflows
ENV DATA_DIR /var/workflow/data
ENV WORKING_DIR /var/workflow/working-dir
ENV PORT 4000
ENV HOST 0.0.0.0

ENTRYPOINT ["/app/entry.sh"]
CMD ["/app/workflow-server"]