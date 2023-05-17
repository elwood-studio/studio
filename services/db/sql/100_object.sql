
CREATE TYPE elwood.object_type AS ENUM (
    'TREE',
    'BLOB',
    'LINK'
);

CREATE TYPE elwood.object_state AS ENUM (
    'CREATING',
    'PENDING',
    'UPLOADED',
    'PROCESSING',
    'FAILED',
    'READY'
);

CREATE TABLE IF NOT EXISTS "elwood"."object" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "type" elwood.object_type NOT NULL DEFAULT 'BLOB',
    "state" elwood.object_state NOT NULL DEFAULT 'PENDING',
    "name" text NOT NULL,
    "display_name" text NOT NULL,
    "parent_id" uuid NULL,
    "current_version" int NOT NULL DEFAULT 0,
    "mime_type" text NULL,
    "metadata" jsonb NULL,
    "size" bigint NULL,

    -- type of sidecar file for this object
    "sidecar_type" text NULL,

    -- remote info for this object
    -- and where it is stored. not all objects have
    "remote_id" uuid NULL,
    "remote_urn" text[] NULL,

    -- timestamps for stuff
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "last_accessed_at" timestamptz DEFAULT now(),

    -- who created this object
    "created_by_user_id" uuid NULL,

    -- the user that owns the root object
    -- this is used to determine if this is a user dir or a shared dir
    -- if it's a user dir, sharing is limited to explicit grants
    "root_user_id" uuid NULL,

    -- should we skip automated workflows for this object
    "skip_workflows" boolean NOT NULL DEFAULT false,


    -- keys and stuff
    CONSTRAINT "object_parent_id" FOREIGN KEY ("parent_id") REFERENCES "elwood"."object"("id"),
    CONSTRAINT "object_root_user_id" FOREIGN KEY ("root_user_id") REFERENCES "auth"."users"("id"),
    CONSTRAINT "object_created_by_user_id" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);

ALTER TABLE elwood.object ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_root_user_id ON elwood.object("root_user_id");
CREATE UNIQUE INDEX idx_parent_id_name ON elwood.object("parent_id", "name");
CREATE INDEX idx_parent_id ON elwood.object("parent_id");
CREATE INDEX idx_name ON elwood.object("name");



