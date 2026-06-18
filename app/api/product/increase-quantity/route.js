import { supabase } from "../../../utils/supabaseClient.js";

export async function POST(req) {
  try {
    const { itemName, quantity, date, category, type } = await req.json();

    if (!itemName || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({ message: "Invalid itemName or quantity" }),
        { status: 400 }
      );
    }

    // Always use product_in table for inventory
    const tableName = "product_in";

    // Search using case-insensitive match (like the product model does)
    const { data: items, error: fetchError } = await supabase
      .from(tableName)
      .select("id, quantity_in, product_name")
      .ilike("product_name", itemName)
      .order("date", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      // If item doesn't exist, create new entry
      const { data: newItem, error: insertError } = await supabase
        .from(tableName)
        .insert({
          product_name: itemName.trim(),
          quantity_in: quantity,
          date: date,
          time_in: new Date().toISOString().split("T")[1],
          description: "Added via Item Transfer Return",
        })
        .select();

      if (insertError) {
        throw new Error(`Failed to create new item: ${insertError.message}`);
      }

      return new Response(
        JSON.stringify({
          message: "New item created successfully",
          itemName,
          quantity,
          action: "created",
        }),
        { status: 201 }
      );
    }

    const item = items[0];
    const newQuantity = item.quantity_in + quantity;

    // Update quantity
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ quantity_in: newQuantity })
      .eq("id", item.id);

    if (updateError) {
      throw new Error(`Failed to update quantity: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: "Quantity increased successfully",
        itemName,
        previousQuantity: item.quantity_in,
        newQuantity,
        incrementBy: quantity,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in increase-quantity:", error);
    return new Response(
      JSON.stringify({ message: error.message || "Server error" }),
      { status: 500 }
    );
  }
}
