UPDATE applications 
SET oidc_client_metadata = oidc_client_metadata || '{"grant_types": ["client_credentials"], "token_endpoint_auth_method": "client_secret_basic"}'::jsonb 
WHERE id = 'm-admin';
