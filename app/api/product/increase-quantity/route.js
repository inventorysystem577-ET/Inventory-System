import { supabase } from "../../../lib/supabaseClient.js";

export async function POST(req) {
  try {
    const { itemName, quantity, date, category, type } = await req.json();

    if (!itemName || !quantity || quantity <= 0) {
      return new Response(
        JSON.stringify({ message: "Invalid itemName or quantity" }),
        { status: 400 }
      );
    }

    // Determine which table to update based on type
    const tableName = type === "PRODUCT" ? "product_in" : "stock";

    // Get current item (most recent entry)
    const { data: items, error: fetchError } = await supabase
      .from(tableName)
      .select("id, quantity_in")
      .eq("product_name", itemName)
      .eq("category", category)
      .lte("date", date)
      .order("date", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      // If item doesn't exist, create new entry with the quantity
      const { data: newItem, error: insertError } = await supabase
        .from(tableName)
        .insert({
          product_name: itemName,
          quantity_in: quantity,
          date: date,
          category: category,
          time_in: new Date().toISOString().split("T")[1],
          description: "Released via Item Transfer",
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
