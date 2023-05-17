
-- AFTER
CREATE OR REPLACE FUNCTION elwood.trigger_after_object() 
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS
$$
BEGIN

    -- blobs should go into a workflow
    IF NEW.type = 'BLOB' THEN

        -- if this object has just been uploaded, we need to add 
        -- it to the uploaded workflow so it can be moved to deep storage
        -- once any other jobs are done
        IF NEW.state = 'UPLOADED' AND OLD.state = 'PENDING' THEN
            -- stuff
        END IF;
        
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
