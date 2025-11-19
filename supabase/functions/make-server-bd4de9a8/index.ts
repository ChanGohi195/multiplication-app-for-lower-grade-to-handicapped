import app from '../../../src/supabase/functions/server/index.tsx';

Deno.serve(app.fetch);
