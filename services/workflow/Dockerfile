FROM node:18-alpine as build
RUN apk add --no-cache libc6-compat python3 make g++ make \ 
    && npm install -g pkg
WORKDIR /app
COPY ./dist/ /app/dist/
RUN cd /app \
    && npm install ssh2 \
    && pkg -t node18-linux -o ./workflow-entry ./dist/entry.js

FROM lukechannings/deno
WORKDIR /app
COPY --from=build /app/workflow-entry /app/workflow-entry
COPY ./entry.sh /app/entry.sh
RUN chmod 755 /app/entry.sh /app/workflow-entry
RUN mkdir -p /var/workflows /var/actions /var/system-workflows /var/workflow /data

ENV ACTIONS_DIR /var/actions
ENV WORKFLOWS_DIR /var/workflows
ENV DATA_DIR /data
ENV WORKING_DIR /var/workflow
ENV PORT 3002
ENV HOST 0.0.0.0
ENV LAUNCH_MODE UNIVERSAL

ENTRYPOINT ["/app/entry.sh"]
CMD ["/app/workflow-entry"]