UPDATE applications SET oidc_client_metadata = oidc_client_metadata::jsonb || '{"grant_types": ["client_credentials"]}'::jsonb WHERE id = 'm-default';
