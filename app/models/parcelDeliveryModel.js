import { supabase } from "../../lib/supabaseClient";

export const addParcelOutItem = async ({ item_name, date, quantity, time_out }) => {
  try {
    // Check available stock
    const { data: inItem, error: inError } = await supabase
      .from("parcel_in")
      .select("id, quantity, item_name")
      .eq("item_name", item_name)
      .single();

    if (inError) throw inError;
    if (!inItem) throw new Error("Item not found in stock");
    if (inItem.quantity < quantity) throw new Error("Not enough stock available");

    // Insert parcel-out
    const { data: outData, error: outError } = await supabase
      .from("parcel_out")
      .insert([{ item_name, date, quantity: Number(quantity), time_out }])
      .select()
      .single();
    if (outError) throw outError;

    // Decrement parcel-in stock
    const { error: updateError } = await supabase
      .from("parcel_in")
      .update({ quantity: inItem.quantity - Number(quantity) })
      .eq("id", inItem.id);

    if (updateError) throw updateError;

    return { data: outData };
  } catch (err) {
    return { error: err };
  }
};

export const getParcelOutItems = async () => {
  const { data, error } = await supabase
    .from("parcel_out")
    .select("*")
    .order("id", { ascending: false });
  return error ? { error } : { data };
};

export const updateParcelOutItem = async (id, updates) => {
  const { data, error } = await supabase
    .from("parcel_out")
    .update(updates)
    .eq("id", id)
    .select();
  return error ? { error } : { data };
};

export const deleteParcelOutItem = async (id) => {
  const { data, error } = await supabase
    .from("parcel_out")
    .delete()
    .eq("id", id);
  return error ? { error } : { data };
};
