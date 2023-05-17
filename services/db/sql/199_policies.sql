
CREATE POLICY object_policy_select ON elwood.object 
    FOR SELECT
    USING ( 
        "state" != 'CREATING' 
        AND (
            "root_user_id" = auth.uid() OR
            elwood.has_access_to_object("id") = true
        )
    );

CREATE POLICY object_policy_update ON elwood.object 
    FOR UPDATE
    USING ( 
        "root_user_id" = auth.uid() OR
        elwood.has_access_to_object("id") = true
    );
