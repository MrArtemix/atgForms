import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceRedirectPage({ params }: Props) {
  const { workspaceId } = await params;

  try {
    const supabase = await createClient();
    const { data: workspace } = await supabase
      .from("workspaces")
      .select("filiale_id")
      .eq("id", workspaceId)
      .single();

    if (workspace?.filiale_id) {
      redirect(`/filiales/${workspace.filiale_id}/projets/${workspaceId}`);
    }
  } catch {
    // Fallback to filiales
  }

  redirect("/filiales");
}
