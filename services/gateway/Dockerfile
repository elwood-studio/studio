FROM lukechannings/deno as build

WORKDIR /app
RUN mkdir -p /app
COPY build.ts /app/
COPY ./services /app/services
RUN cd /app && deno run -A build.ts

RUN cat /app/kong.yml

FROM kong/kong:arm64-latest

ENV FS_HOST "127.0.0.1:3001"
ENV AUTH_HOST "127.0.0.1:9999"
ENV REST_HOST "127.0.0.1:3000"
ENV REALTIME_HOST "127.0.0.1:5000"
ENV WORKFLOW_HOST "127.0.0.1:3002"
ENV YML_ANON_CRED ""
ENV YML_SR_KEY ""

EXPOSE 8000

ENV KONG_DATABASE 'off'
ENV KONG_DECLARATIVE_CONFIG /var/lib/kong/kong.yml
ENV KONG_DNS_ORDER LAST,A,CNAME
ENV KONG_PLUGINS request-transformer,request-termination,cors,key-auth,acl

USER root

ENV BUILD_DEPS="gettext" \
    RUNTIME_DEPS="libintl"

RUN set -x && \
    apk add --update $RUNTIME_DEPS && \
    apk add --virtual build_deps $BUILD_DEPS &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps

COPY /entry.sh /entry.sh
COPY --from=build /app/kong.yml /var/lib/kong/kong.template

ENTRYPOINT ["/entry.sh"]
CMD ["kong", "docker-start"]


