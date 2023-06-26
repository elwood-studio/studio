
CREATE TABLE IF NOT EXISTS "elwood"."event" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "type" text[] NOT NULL,
  "trigger" text NULL,
  "trigger_by_user_id" uuid NULL,
  "payload" jsonb NULL DEFAULT '{}',
  "has_processed" boolean NOT NULL DEFAULT FALSE,
  "processed_at" timestamptz NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  PRIMARY KEY ("id")
);


-- AFTER
CREATE OR REPLACE FUNCTION elwood.trigger_after_event() 
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
DECLARE
  _payload jsonb;
BEGIN

  _payload := NEW.payload;

    INSERT INTO 
      elwood_boss.job
      (
        "name",
        "singletonkey",
        "data"
      ) 
    VALUES
      (
        array_to_string(array_cat(ARRAY['event'], NEW.type), ':')::text,
        NEW.id,
        json_build_object(
          'payload', _payload,
          'event_id', NEW.id
        )
      )  
    ;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_after_event_func
	AFTER INSERT
	ON elwood.event
	FOR EACH ROW
	EXECUTE PROCEDURE elwood.trigger_after_event();
