SELECT id, name, oidc_client_metadata->'redirect_uris' as redirects, oidc_client_metadata->'post_logout_redirect_uris' as post_logout FROM applications;
