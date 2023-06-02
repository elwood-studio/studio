
CREATE TYPE elwood.workflow_run_trigger AS ENUM (
  'EVENT',
  'USER'
);

CREATE TABLE IF NOT EXISTS "elwood"."workflow_run" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "trigger" elwood.workflow_run_trigger NOT NULL DEFAULT 'USER',
  "state" text NOT NULL DEFAULT 'PENDING',
  "name" text NOT NULL,
  "description" text NULL,
  "instructions" jsonb NULL DEFAULT '{}',
  "input" jsonb NULL DEFAULT '{}',
  "job_ids" uuid[] NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);