import { supabase } from "../../lib/supabaseClient";

// controller
/**
 * Insert a new parcel-out item and decrement stock
 */
export const addParcelOutItem = async ({
  item_name,
  date,
  quantity,
  time_out,
}) => {
  try {
    // 1️⃣ Check available stock
    const { data: inItem, error: inError } = await supabase
      .from("parcel_in")
      .select("id, quantity")
      .eq("name", item_name)
      .single();

    if (inError) throw inError;
    if (!inItem) throw new Error("Item not found in stock");
    if (inItem.quantity < quantity)
      throw new Error("Not enough stock available");

    // 2️⃣ Insert parcel-out
    const { data: outData, error: outError } = await supabase
      .from("parcel_out")
      .insert([{ item_name, date, quantity: Number(quantity), time_out }])
      .select()
      .single();
    if (outError) throw outError;

    // 3️⃣ Decrement parcel-in stock
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

/**
 * Fetch all parcel-out items
 */
export const getParcelOutItems = async () => {
  const { data, error } = await supabase
    .from("parcel_out")
    .select("*")
    .order("id", { ascending: false });
  return error ? { error } : { data };
};

/**
 * Update a parcel-out item
 */
export const updateParcelOutItem = async (id, updates) => {
  const { data, error } = await supabase
    .from("parcel_out")
    .update(updates)
    .eq("id", id)
    .select();
  return error ? { error } : { data };
};

/**
 * Delete a parcel-out item
 */
export const deleteParcelOutItem = async (id) => {
  const { data, error } = await supabase
    .from("parcel_out")
    .delete()
    .eq("id", id);
  return error ? { error } : { data };
};
