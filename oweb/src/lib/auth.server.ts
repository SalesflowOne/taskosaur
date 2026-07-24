import { getRequestHeader } from "@tanstack/react-start/server";
import { createUserClient } from "@/integrations/supabase/client.server";

export async function getAuthedClient() {
  const auth = getRequestHeader("Authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    throw new Error("Unauthorized");
  }
  const client = createUserClient(token);
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) {
    throw new Error("Unauthorized");
  }
  return { client, user: data.user };
}
