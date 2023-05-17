
CREATE SCHEMA IF NOT EXISTS elwood AUTHORIZATION supabase_admin;

grant usage on schema elwood to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on tables to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on functions to postgres, anon, authenticated, service_role;
alter default privileges in schema elwood grant all on sequences to postgres, anon, authenticated, service_role;


CREATE OR REPLACE FUNCTION elwood.trigger_after_user_create() 
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS  
$$
DECLARE
  object_id uuid;
BEGIN

    NEW.raw_user_meta_data = jsonb_build_object(
      'username', SPLIT_PART(NEW.email, '@', 1)
    );

    -- create their home dir
    INSERT INTO elwood.object
      (
        "type", 
        "state", 
        "name", 
        "display_name", 
        "root_user_id", 
        "parent_id", 
        "created_by_user_id"
      )
    VALUES
    (
        'TREE',
        'READY',
        NEW.id,
        NEW.id,
        NEW.id,
        NULL,
        NEW.id
    )
    RETURNING id INTO object_id;

    -- give them access to it
    INSERT INTO elwood.access
      (
        "user_id",
        "object_id", 
        "can_view_children", 
        "can_view_descendants", 
        "can_share",
        "can_write_blob",
        "can_write_tree"
      ) 
    VALUES (
      NEW.id,
      object_id,
      true,
      true,
      true,
      true,
      true
    );

    RETURN NEW;

END;
$$;


CREATE TRIGGER trigger_after_user_create
  AFTER INSERT
  ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE elwood.trigger_after_user_create();

--- #

CREATE OR REPLACE FUNCTION elwood.trigger_before_user_create() 
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL
  AS  
$$
DECLARE
  object_id uuid;
BEGIN

    NEW.raw_user_meta_data = NEW.raw_user_meta_data || jsonb_build_object(
      'username', SPLIT_PART(NEW.email, '@', 1)
    );

    RETURN NEW;

END;
$$;

CREATE TRIGGER trigger_before_user_create
  BEFORE INSERT
  ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE elwood.trigger_before_user_create();


create view elwood.account as 
  SELECT 
    id, 
    raw_user_meta_data->>'username' as username 
  FROM 
  auth.users;

GRANT SELECT ON elwood.account TO authenticated;
