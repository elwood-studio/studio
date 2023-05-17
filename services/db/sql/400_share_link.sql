
create type elwood.share_link_access AS (
    has_access boolean,
    password_required boolean
);

CREATE OR REPLACE FUNCTION elwood.get_share_link(id uuid, password text) 
  RETURNS elwood.share_link_access
  LANGUAGE PLPGSQL
  AS
$$
DECLARE
    access_row elwood.access;
BEGIN

  SELECT * INTO access_row FROM "elwood"."access" a WHERE a.id = id AND a.type = 'LINK';

  -- no access row for this link
  IF access_row.id IS NULL THEN 
    return (
      false,
      false
    );
  END IF;

  -- access link has a password
  IF access_row.share_password IS NOT NULL THEN
    IF password IS NULL THEN
      return (
        false,
        true
      );
    END IF;

    IF access_row.share_password <> password THEN
      return (
        false,
        true
      );
    END IF;
  END IF;

  return (
    true,
    false
  );

END;
$$ VOLATILE STRICT SECURITY DEFINER;