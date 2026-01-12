UPDATE applications SET oidc_client_metadata = oidc_client_metadata::jsonb || '{"grant_types": ["client_credentials"]}'::jsonb WHERE id = 'qcma8qo4f4req96mhc5kl';
