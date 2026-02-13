import { supabase } from "@/lib/supabase";
import type { LoveLetter } from "@/types/letters";

export async function fetchLetters(): Promise<LoveLetter[]> {
  if (!supabase) {
    console.error("[letterService] Supabase client not initialized");
    return [];
  }

  const { data, error } = await supabase
    .from("love_letters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[letterService] Error fetching letters:", error.message);
    return [];
  }

  return data ?? [];
}

export async function createLetter(letter: Partial<LoveLetter>): Promise<LoveLetter | null> {
  if (!supabase) {
    console.error("[letterService] Supabase client not initialized");
    return null;
  }

  const { data, error } = await supabase
    .from("love_letters")
    .insert(letter)
    .select()
    .single();

  if (error) {
    console.error("[letterService] Error creating letter:", error.message);
    return null;
  }

  return data;
}

export async function updateLetter(
  id: string,
  updates: Partial<LoveLetter>
): Promise<LoveLetter | null> {
  if (!supabase) {
    console.error("[letterService] Supabase client not initialized");
    return null;
  }

  console.log("[letterService] updateLetter called:", { id, updates });

  const { data, error } = await supabase
    .from("love_letters")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[letterService] Error updating letter:", error.message);
    return null;
  }

  console.log("[letterService] updateLetter result:", data);
  return data;
}

export async function sealLetter(id: string): Promise<LoveLetter | null> {
  console.log("[letterService] sealLetter called with id:", id);
  const result = await updateLetter(id, { is_sealed: true });
  console.log("[letterService] sealLetter result:", result);
  return result;
}
