
CREATE TYPE elwood.access_type AS ENUM (
    'MEMBER',
    'LINK'
);

CREATE TYPE elwood.access_state AS ENUM (
    'PENDING',
    'ACTIVE',
    'DISABLED'
);

CREATE TABLE IF NOT EXISTS "elwood"."access" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "type" elwood.access_type NOT NULL DEFAULT 'MEMBER',    
    "user_id" uuid NULL,
    "object_id" uuid NOT NULL,
    "state" elwood.access_state NOT NULL DEFAULT 'ACTIVE',
    "can_view_children" boolean NOT NULL DEFAULT false,
    "can_view_descendants" boolean NOT NULL DEFAULT false,
    "can_write_blob" boolean NOT NULL DEFAULT false,
    "can_write_tree" boolean NOT NULL DEFAULT false,
    "can_share" boolean NOT NULL DEFAULT false,
    "can_download" boolean NOT NULL DEFAULT false,
    "block_pattern" text[] NULL,
    "allow_pattern" text[] NULL,
    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),
    "added_by_user_id" uuid NULL,
    "description" text NULL,
    "is_public" boolean NOT NULL DEFAULT false,
    "share_password" text NULL,

    CONSTRAINT "access_object_id" FOREIGN KEY ("object_id") REFERENCES "elwood"."object"("id"),
    CONSTRAINT "object_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id"),
    CONSTRAINT "object_added_by_user_id" FOREIGN KEY ("added_by_user_id") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);

