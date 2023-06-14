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
    && pkg -t node18-linux -o ./workflow-server ./dist/server.js

FROM lukechannings/deno
WORKDIR /app
COPY --from=build /app/workflow-server /app/workflow-server
COPY ./entry.sh /app/entry.sh
RUN chmod 755 /app/entry.sh /app/workflow-server
RUN mkdir -p /var/workflows /var/actions /var/system-workflows /var/workflow /data

ENV ACTIONS_DIR /var/actions
ENV WORKFLOWS_DIR /var/workflows
ENV DATA_DIR /data
ENV WORKING_DIR /var/workflow
ENV PORT 3002
ENV HOST 0.0.0.0

ENTRYPOINT ["/app/entry.sh"]
CMD ["/app/workflow-server"]