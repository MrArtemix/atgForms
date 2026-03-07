import { createClient } from "@/lib/supabase/client";

export const storageService = {
  async uploadFormAsset(
    file: File,
    formId: string,
    path?: string
  ): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${formId}/${path || crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("form-assets")
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage
      .from("form-assets")
      .getPublicUrl(fileName);

    return data.publicUrl;
  },

  async uploadResponseFile(
    file: File,
    formId: string,
    responseId: string
  ): Promise<string> {
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const fileName = `${formId}/${responseId}/${crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("response-uploads")
      .upload(fileName, file);

    if (error) throw error;

    return fileName;
  },

  async getResponseFileUrl(path: string): Promise<string> {
    const supabase = createClient();
    const { data } = await supabase.storage
      .from("response-uploads")
      .createSignedUrl(path, 3600);

    return data?.signedUrl || "";
  },

  async deleteFormAsset(path: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.storage
      .from("form-assets")
      .remove([path]);
    if (error) throw error;
  },
};
