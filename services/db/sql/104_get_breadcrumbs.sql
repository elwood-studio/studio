
CREATE OR REPLACE FUNCTION elwood.get_object_breadcrumbs(object_id uuid)
 RETURNS TABLE(id uuid, name text, display_name text, parent_id uuid, depth_from_parent integer)
 LANGUAGE plpgsql
AS $$
declare 
begin
    return query WITH RECURSIVE breadcrumbs AS (
        SELECT 
            r.id, 
            r.name, 
            r.display_name, 
            r.parent_id,
            0 as depth_from_parent  
        FROM elwood.object r WHERE r.id = object_id
        UNION
            SELECT
                o.id,
                o.name,
                o.display_name,
                o.parent_id,
                b.depth_from_parent + 1
            FROM elwood.object o
            INNER JOIN breadcrumbs b ON b.parent_id = o.id
    ) SELECT * FROM breadcrumbs ORDER BY depth_from_parent DESC;
END;
$$;