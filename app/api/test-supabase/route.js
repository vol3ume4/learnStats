import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const { data, error } = await supabase.from("profiles").select("id").limit(1);

    return Response.json({
      env_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "OK" : "MISSING",
      env_key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "OK" : "MISSING",
      query_status: error ? "ERROR" : "OK",
      error: error || null,
      sample_row: data?.[0] || null,
    });
  } catch (e) {
    return Response.json({
      crash: true,
      message: e.message,
    });
  }
}
