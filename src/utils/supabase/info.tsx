function sanitizeEnv(name: string, value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`Missing ${name}. Set it in your .env file.`);
  }

  const sanitized = trimmed.replace(/[^\x20-\x7E]/g, '');
  if (sanitized.length !== trimmed.length) {
    console.warn(`[supabase] ${name} contained non-ASCII chars and was sanitized.`);
  }
  return sanitized;
}

const projectId = sanitizeEnv('VITE_SUPABASE_PROJECT_ID', import.meta.env.VITE_SUPABASE_PROJECT_ID);
const publicAnonKey = sanitizeEnv('VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY);

export { projectId, publicAnonKey };
