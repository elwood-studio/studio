drop publication if exists supabase_realtime;
create publication supabase_realtime;
alter publication supabase_realtime add table elwood.object;