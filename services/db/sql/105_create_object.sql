


create type elwood.create_object_input AS (
    type elwood.object_type, 
    name text, 
    display_name text, 
    parent_id uuid,  
    mime_type text, 
    metadata jsonb, 
    size int,
    sidecar_type text, 
    skip_workflows boolean
);


CREATE FUNCTION elwood.create_object(input elwood.create_object_input)
    RETURNS uuid
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
    shell_id uuid;
BEGIN
 
  IF elwood.can_create_object(input.parent_id) = false THEN
      RAISE EXCEPTION 'User does not have permission to write to this tree';
  END IF;

  INSERT 
    INTO elwood.object (        
        "type", 
        "state",
        "name", 
        "display_name", 
        "parent_id",  
        "mime_type", 
        "metadata", 
        "size",
        "sidecar_type", 
        "created_by_user_id", 
        "skip_workflows"
    ) 
    VALUES (
        input.type,
        'PENDING'::elwood.object_state,
        input.name,
        input.display_name,
        input.parent_id,
        input.mime_type,
        input.metadata,
        input.size,
        input.sidecar_type,
        auth.uid(), 
        input.skip_workflows
    )
    RETURNING id INTO shell_id;

    return shell_id;
END
$$ VOLATILE STRICT SECURITY DEFINER;



CREATE FUNCTION elwood.can_create_object(parent_id uuid)
    RETURNS boolean
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
    access_row elwood.object_access;
BEGIN
 
  SELECT * INTO access_row FROM elwood.get_object_access(parent_id);

  IF access_row.has_access = false OR access_row.can_write_tree = false THEN
      return false;
  END IF;


  return true;
END
$$ VOLATILE STRICT SECURITY DEFINER;