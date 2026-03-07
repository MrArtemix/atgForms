export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateFormSlug(title: string): string {
  const base = slugify(title).slice(0, 40);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
