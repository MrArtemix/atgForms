import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userData = {
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "User",
    avatarUrl: user.user_metadata?.avatar_url ?? "",
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[hsl(var(--background))]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header user={userData} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 custom-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}
