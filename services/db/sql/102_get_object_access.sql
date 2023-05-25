
create type elwood.object_access AS (
    has_access boolean,
    can_view_children boolean,
    can_view_descendants boolean,
    can_share boolean,
    can_write_blob boolean,
    can_write_tree boolean,
    block_pattern text[],
    allow_pattern text[]
);

-- GET OBJECT ACCESS
CREATE OR REPLACE FUNCTION elwood.get_object_access(object_id uuid) 
  RETURNS elwood.object_access
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
    access_row elwood.access;
    row_id uuid;
    object_type elwood.object_type;
BEGIN

  IF auth.role() = 'service_role' THEN 
    return (
        true,
        true,
        true,
        true,
        true, 
        true,
        ARRAY[]::text[],
        ARRAY[]::text[] 
    );
  END IF;

  -- start by going down the tree to see if this object is there
  FOR row_id IN (
      WITH RECURSIVE tree AS (
      SELECT 
          r.id, 
          r.parent_id,
          0 as depth_from_parent  
      FROM elwood.object r WHERE r.id = object_id
      UNION
          SELECT
              o.id,
              o.parent_id,
              t.depth_from_parent + 1
          FROM elwood.object o
          INNER JOIN tree t ON t.parent_id = o.id
      ) SELECT tr.id FROM tree tr ORDER BY tr.depth_from_parent ASC
  )
  LOOP
      EXIT WHEN row_id IS NULL;

      SELECT * INTO access_row 
      FROM "elwood"."access" a 
      WHERE a.object_id = row_id AND a.user_id = auth.uid();

      EXIT WHEN access_row.id IS NOT NULL;
  END LOOP;


  -- if we didn't find anything down the tree
  -- check to see if this is a tree. if yes, check up the tree
  IF access_row.id IS NULL THEN
      SELECT o.type INTO object_type FROM elwood.object o WHERE o.id = object_id;

      IF object_type = 'TREE' THEN
          
          FOR row_id IN (
              WITH RECURSIVE tree AS (
              SELECT 
                  r.id, 
                  r.parent_id,
                  0 as depth_from_parent  
              FROM elwood.object r WHERE r.id = object_id
              UNION
                  SELECT
                      o.id,
                      o.parent_id,
                      t.depth_from_parent + 1
                  FROM elwood.object o
                  INNER JOIN tree t ON t.id = o.parent_id
              ) SELECT tr.id, tr.name FROM tree tr ORDER BY tr.depth_from_parent ASC
          )
          LOOP
              EXIT WHEN row_id IS NULL;

              SELECT * INTO access_row 
              FROM "elwood"."access" a 
              WHERE a.object_id = row_id AND a.user_id = auth.uid();

              EXIT WHEN access_row.id IS NOT NULL;
          END LOOP;    

      END IF;

  END IF;


  return (
      access_row.id IS NOT NULL,
      access_row.can_view_children,
      access_row.can_view_descendants,
      access_row.can_share,
      access_row.can_write_blob,
      access_row.can_write_tree,
      access_row.block_pattern,
      access_row.allow_pattern
  );

END;
$$ VOLATILE SECURITY DEFINER;


CREATE OR REPLACE FUNCTION elwood.has_access_to_object(object_id uuid) 
  RETURNS boolean
  LANGUAGE PLPGSQL AS
$$
DECLARE
    row elwood.object_access;
BEGIN
    SELECT has_access FROM elwood.get_object_access(object_id) INTO row;
    return row.has_access;
END;
$$;