import { supabase } from "../../lib/supabaseClient";

export const addParcelInItem = async (item) => {
  const { data, error } = await supabase
    .from("parcel_in")
    .insert([item])
    .select();

  if (error) return { error };
  return { data };
};

export const getParcelInItems = async () => {
  const { data, error } = await supabase
    .from("parcel_in")
    .select("*")
    .order("id", { ascending: false });

  if (error) return { error };
  return { data };
};

export const deleteParcelInItem = async (id) => {
  const { data, error } = await supabase
    .from("parcel_in")
    .delete()
    .eq("id", id);

  if (error) return { error };
  return { data };
};

export const updateParcelInItem = async (id, updates) => {
  const { data, error } = await supabase
    .from("parcel_in")
    .update(updates)
    .eq("id", id)
    .select();

  if (error) return { error };
  return { data };
};
