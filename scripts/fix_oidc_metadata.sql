UPDATE applications 
SET oidc_client_metadata = oidc_client_metadata || '{"redirect_uris": [], "post_logout_redirect_uris": []}'::jsonb 
WHERE id IN ('vl31l61gniqq0mreelxlm', 'admin-console', 'm-default', 'fzyc1grkyiwulacblfmo0', 'm-admin', 'm-migration');
