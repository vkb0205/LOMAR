-- Trigger functions do not need direct RPC execution privileges.
revoke all on function public.handle_new_auth_user()
  from public, anon, authenticated, service_role;
