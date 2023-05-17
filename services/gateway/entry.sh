#!/usr/bin/env bash

echo $(envsubst < /var/lib/kong/kong.template)

envsubst < /var/lib/kong/kong.template > /var/lib/kong/kong.yml

. /docker-entrypoint.sh