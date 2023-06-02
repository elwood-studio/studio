
CREATE SCHEMA IF NOT EXISTS elwood AUTHORIZATION supabase_admin;

grant usage on schema elwood to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on sequences to postgres, anon, authenticated, service_role;

\set pguser `echo "$POSTGRES_USER"`

create schema if not exists _realtime;
alter schema _realtime owner to :pguser;


