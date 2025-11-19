import { supabaseServer } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import TeacherClient from "./TeacherClient";

export default async function TeacherPage() {
  const supabase = supabaseServer();

  // 1. Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Check profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_teacher")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_teacher) redirect("/unauthorized");

  // 3. Render existing UI
  return <TeacherClient />;
}
