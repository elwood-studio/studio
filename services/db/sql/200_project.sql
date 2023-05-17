
CREATE TYPE elwood.project_type AS ENUM (
    'SCRATCH',
    'STANDARD'
);


CREATE TABLE IF NOT EXISTS "elwood"."project" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "name" text NOT NULL,
    "display_name" text NULL,
    "description" text NULL,
    "type" elwood.project_type NOT NULL DEFAULT 'STANDARD',

    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),

    PRIMARY KEY ("id")
);


CREATE TABLE IF NOT EXISTS "elwood"."project_members" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "project_id" uuid NOT NULL,
    "user_id" uuid NOT NULL,

    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),

    CONSTRAINT "project_members_project_id" FOREIGN KEY ("project_id") REFERENCES "elwood"."project"("id"),
    CONSTRAINT "project_members_user_id" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id"),
    PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "elwood"."project_object" (
    "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    "project_id" uuid NOT NULL,
    "object_id" uuid NOT NULL,

    "created_at" timestamptz DEFAULT now(),
    "updated_at" timestamptz DEFAULT now(),

    CONSTRAINT "project_object_project_id" FOREIGN KEY ("project_id") REFERENCES "elwood"."project"("id"),
    CONSTRAINT "project_object_object_id" FOREIGN KEY ("object_id") REFERENCES "elwood"."object"("id"),
    PRIMARY KEY ("id")
);