FROM kong:2.1

EXPOSE 8000

ENV KONG_DATABASE 'off'
ENV KONG_DECLARATIVE_CONFIG /var/lib/kong/kong.yml
ENV KONG_DNS_ORDER LAST,A,CNAME
ENV KONG_PLUGINS request-transformer,request-termination,cors,key-auth,acl

ENV FS_HOST "127.0.0.1"
ENV AUTH_HOST "127.0.0.1"
ENV REST_HOST "127.0.0.1"
ENV REALTIME_HOST "127.0.0.1"
ENV WORKFLOW_HOST "127.0.0.1"
ENV YML_ANON_CRED ""
ENV YML_SR_KEY ""

USER root

ENV BUILD_DEPS="gettext" \
    RUNTIME_DEPS="libintl"

RUN set -x && \
    apk add --update $RUNTIME_DEPS && \
    apk add --virtual build_deps $BUILD_DEPS &&  \
    cp /usr/bin/envsubst /usr/local/bin/envsubst && \
    apk del build_deps

COPY /entry.sh /entry.sh
COPY ./kong.template.yml /var/lib/kong/kong.template

ENTRYPOINT ["/entry.sh"]
CMD ["kong", "docker-start"]


