const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!projectId) {
  throw new Error('Missing VITE_SUPABASE_PROJECT_ID. Set it in your .env file.');
}

if (!publicAnonKey) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY. Set it in your .env file.');
}

export { projectId, publicAnonKey };
