INSERT INTO applications (tenant_id, id, name, secret, type, oidc_client_metadata)
VALUES (
    'default',
    'qcma8qo4f4req96mhc5kl',
    'CloudGPT Web App',
    'A3JW4aZgqcSc8vUA7uP9IdATpAuN6q4I',
    'SPA',
    '{
        "redirect_uris": [
            "http://localhost:3000/api/logto/callback",
            "https://cloudgptapi.vercel.app/api/logto/callback",
            "http://157.151.169.121.sslip.io/api/logto/callback"
        ],
        "post_logout_redirect_uris": [
            "http://localhost:3000",
            "https://cloudgptapi.vercel.app",
            "http://157.151.169.121.sslip.io"
        ],
        "grant_types": ["authorization_code", "refresh_token"],
        "response_types": ["code"],
        "token_endpoint_auth_method": "none"
    }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    secret = EXCLUDED.secret,
    type = EXCLUDED.type,
    oidc_client_metadata = EXCLUDED.oidc_client_metadata;
