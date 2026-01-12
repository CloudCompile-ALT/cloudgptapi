UPDATE applications 
SET oidc_client_metadata = oidc_client_metadata || '{
  "redirectUris": ["http://localhost:3000/api/logto/sign-in-callback", "https://cloudgptapi.vercel.app/api/logto/sign-in-callback"],
  "postLogoutRedirectUris": ["http://localhost:3000", "https://cloudgptapi.vercel.app"]
}'::jsonb 
WHERE id = 'qcma8qo4f4req96mhc5kl';
