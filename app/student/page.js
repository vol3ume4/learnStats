import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import StudentClient from "./StudentClient";

export default async function StudentPage() {
  const supabase = supabaseServer();

  // 1. Get the logged in user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Get the profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_student")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_student) redirect("/unauthorized");

  // 3. Render your existing UI
  return <StudentClient />;
}
