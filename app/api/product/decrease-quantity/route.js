import { supabase } from "../../utils/supabaseClient.js";

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

    // Get current item
    const { data: items, error: fetchError } = await supabase
      .from(tableName)
      .select("id, quantity_in")
      .eq("product_name", itemName)
      .eq("category", category)
      .gte("date", date)
      .order("date", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw new Error(`Failed to fetch item: ${fetchError.message}`);
    }

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({
          message: `Item "${itemName}" not found in inventory`
        }),
        { status: 404 }
      );
    }

    const item = items[0];
    const newQuantity = Math.max(0, item.quantity_in - quantity);

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
        message: "Quantity decreased successfully",
        itemName,
        previousQuantity: item.quantity_in,
        newQuantity,
        decrementBy: quantity,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in decrease-quantity:", error);
    return new Response(
      JSON.stringify({ message: error.message || "Server error" }),
      { status: 500 }
    );
  }
}
