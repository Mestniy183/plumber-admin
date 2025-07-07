import { createClient } from "@supabase/supabase-js";
import { S3Client } from "@aws-sdk/client-s3";

const supabaseURL = "https://voygehzdwnkrsowhseyh.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZveWdlaHpkd25rcnNvd2hzZXloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzMjI0ODYsImV4cCI6MjA2NTg5ODQ4Nn0.zf0QL4lGuSv1jT4cLPD2UGBEiv4JgSp0lVoLKC47AGc";

export const supabaseDB = createClient(supabaseURL, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const client = new S3Client({
  forcePathStyle: true,
  tls: true,
  signatureVersion: "v4",
  region: "eu-west-2",
  endpoint: "https://voygehzdwnkrsowhseyh.supabase.co/storage/v1/s3",
  credentials: {
    accessKeyId: "d1adb50392a3680e1e1ec3a403f52fcd",
    secretAccessKey:
      "9d254cde597569f46da0b4ea9a5ce801eb3dc726a93a361cbfaf5fcaba8b59fa",
  },
});
