const supabaseURL = 'https://voygehzdwnkrsowhseyh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveWdlaHpkd25rcnNvd2hzZXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjI0ODYsImV4cCI6MjA2NTg5ODQ4Nn0.zf0QL4lGuSv1jT4cLPD2UGBEiv4JgSp0lVoLKC47AGc'

export const supabaseDB = supabase.createClient(supabaseURL, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})