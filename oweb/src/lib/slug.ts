export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "item";
}

export function taskSlug(taskNumber: number, title: string): string {
  return `${taskNumber}-${slugify(title)}`.slice(0, 80);
}
