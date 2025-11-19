import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function supabaseServer() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value ?? null;
        },
        set(name, value, options) {
          try {
            cookieStore.set({
              name,
              value,
              ...options,
            });
          } catch (e) {
            // Ignore errors during SSR
          }
        },
        remove(name, options) {
          try {
            cookieStore.delete({
              name,
              ...options,
            });
          } catch (e) {
            // Ignore errors during SSR
          }
        },
      },
    }
  );
}
