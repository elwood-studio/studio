
-- AFTER
CREATE OR REPLACE FUNCTION elwood.trigger_after_object() 
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
DECLARE
  objectType text;
  eventType text;
BEGIN

  objectType := LOWER(NEW.type::text);
  eventType := LOWER(TG_OP);

  IF NEW.type = 'TREE' THEN 
    NEW.state = 'READY';
  END IF;

  IF NEW.state = 'READY' THEN

    -- if it was in pending state and now it is 
    -- ready, then it was actually create, not updated
    IF OLD.STATE = 'PENDING' THEN 
      eventType := 'created';
    END IF;

    INSERT INTO 
      elwood.event
      (
        "type",
        "payload",
        "trigger",
        "trigger_by_user_id"
      ) 
    VALUES
      (
        ARRAY['object', objectType, eventType],
        json_build_object(
          'object_id', NEW.id,
          'new', NEW,
          'old', OLD
        ),
        'system',
        auth.uid()
      )  
    ;

  END IF;

  RETURN NEW;

END;
$$;

CREATE TRIGGER trigger_after_object_func
	AFTER INSERT OR DELETE OR UPDATE
	ON elwood.object
	FOR EACH ROW
	EXECUTE PROCEDURE elwood.trigger_after_object();


--- BEFORE
CREATE OR REPLACE FUNCTION elwood.trigger_before_object() 
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
BEGIN
		
		-- always updated at
		NEW.updated_at = now();
		
		RETURN NEW;

END;
$$;

CREATE TRIGGER trigger_before_object_func
	BEFORE UPDATE
	ON elwood.object
	FOR EACH ROW
	EXECUTE PROCEDURE elwood.trigger_before_object();
