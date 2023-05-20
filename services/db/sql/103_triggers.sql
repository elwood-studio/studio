
-- AFTER
CREATE OR REPLACE FUNCTION elwood.trigger_after_object() 
	RETURNS TRIGGER 
	LANGUAGE PLPGSQL
	AS
$$
BEGIN

		IF NEW.state = 'READY' THEN
			INSERT INTO 
				pgboss.job
				(
					"name",
					"singletonkey",
					"data"
				) 
			VALUES
				(
					'event',
					NEW.id,
					json_build_object(
						'eventType', 'object:ready',
						'previousState', OLD.state,
						'objectId', NEW.id
					)
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
