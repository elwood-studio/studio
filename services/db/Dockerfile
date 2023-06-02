FROM supabase/postgres:15.1.0.67 as sql

RUN apt-get install -y --no-install-recommends coreutils

COPY ./sql /tmp/sql
RUN cat /tmp/sql/*.sql > /tmp/999999_elwood.sql
RUN cat /tmp/999999_elwood.sql

FROM supabase/postgres:15.1.0.67

ENV POSTGRES_HOST /var/run/postgresql

COPY --from=sql /tmp/999999_elwood.sql /docker-entrypoint-initdb.d/migrations/999999_elwood.sql

CMD ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf", "-c", "log_min_messages=fatal"]
