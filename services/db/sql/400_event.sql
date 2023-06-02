
CREATE TABLE IF NOT EXISTS "elwood"."event" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "type" text[] NOT NULL,
  "trigger" text NULL,
  "payload" jsonb NULL DEFAULT '{}',
  "job_ids" uuid[] NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);