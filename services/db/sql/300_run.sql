
CREATE TYPE elwood.run_trigger AS ENUM (
  'EVENT',
  'USER'
);

CREATE TABLE IF NOT EXISTS "elwood"."run" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "event_id" uuid NULL,
  "trigger" elwood.run_trigger NOT NULL DEFAULT 'USER',
  "state" text NOT NULL DEFAULT 'created',
  "has_failed" boolean NOT NULL DEFAULT false,
  "name" text NOT NULL,
  "description" text NULL,
  "instructions" jsonb NULL DEFAULT '{}',
  "input" jsonb NULL DEFAULT '{}',
  "output" jsonb NULL DEFAULT '{}',
  "job_id" uuid[] NULL, 
  "completed_at" timestamptz NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "data" jsonb NULL DEFAULT '{}',
  PRIMARY KEY ("id")
);