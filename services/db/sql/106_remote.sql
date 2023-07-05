
CREATE TABLE IF NOT EXISTS "elwood"."remote" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "name" varchar(255) NOT NULL,
  "type" varchar(255) NOT NULL,
  "options" jsonb NOT NULL DEFAULT '{}',
  "parameters" jsonb NOT NULL DEFAULT '{}',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX idx_unq_remote_name ON elwood.remote("name");