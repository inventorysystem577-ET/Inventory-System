import axios from "axios";
import { supabase } from "../../lib/supabaseClient";

/**
 * Fetch all parcel-out items
 */
export const fetchParcelOutItems = async () => {
  try {
    const res = await axios.get("/api/parcelDelivery");
    if (res.data.error) return [];
    return res.data.map((item) => ({
      id: item.id,
      name: item.item_name,
      date: item.date,
      quantity: item.quantity,
      timeOut: item.time_out,
    }));
  } catch (err) {
    console.error(
      "Failed to fetch parcel-out items:",
      err.response?.data || err.message,
    );
    return [];
  }
};

/**
 * Add a parcel-out item (with stock validation and decrement)
 */
export const addParcelOutItemHelper = async ({
  item_name,
  date,
  quantity,
  time_out,
}) => {
  try {
    // ✅ STEP 1: Kuhanin ang current stock from parcel_in
    const { data: parcelInItem, error: fetchError } = await supabase
      .from("parcel_in")
      .select("id, quantity")
      .eq("item_name", item_name)
      .single();

    if (fetchError) {
      console.error("Error fetching item from parcel_in:", fetchError);
      throw new Error(`Item "${item_name}" not found in inventory`);
    }

    const currentStock = Number(parcelInItem.quantity);
    const qtyOut = Number(quantity);
    const remaining = currentStock - qtyOut;

    console.log("Current Stock:", currentStock);
    console.log("Quantity Out:", qtyOut);
    console.log("Remaining:", remaining);

    // ✅ STEP 2: Validate stock (pwede na maging 0, pero hindi negative)
    if (qtyOut > currentStock) {
      throw new Error(
        `Not enough stock for "${item_name}"!\nAvailable: ${currentStock} units\nRequested: ${qtyOut} units`,
      );
    }

    if (remaining < 0) {
      throw new Error(
        `Cannot create Parcel Out for "${item_name}"!\n` +
          `This would result in negative stock (${remaining})\n` +
          `Available: ${currentStock} units\n` +
          `Maximum you can take out: ${currentStock} units`,
      );
    }

    // ✅ STEP 3: Update (decrement) ang parcel_in quantity (pwede maging 0)
    const { error: updateError } = await supabase
      .from("parcel_in")
      .update({ quantity: remaining })
      .eq("item_name", item_name);

    if (updateError) {
      console.error("Error updating parcel_in:", updateError);
      throw new Error("Failed to update inventory stock");
    }

    // ✅ STEP 4: Insert sa parcel_out
    const { data, error: insertError } = await supabase
      .from("parcel_out")
      .insert([{ item_name, date, quantity: qtyOut, time_out }])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting to parcel_out:", insertError);

      // ⚠️ ROLLBACK: I-revert ang update sa parcel_in
      await supabase
        .from("parcel_in")
        .update({ quantity: currentStock })
        .eq("item_name", item_name);

      throw new Error("Failed to create parcel out record");
    }

    console.log("✅ Successfully created parcel out:", data);
    console.log(
      `✅ Updated inventory: ${item_name} now has ${remaining} units`,
    );

    return {
      id: data.id,
      name: data.item_name,
      date: data.date,
      quantity: data.quantity,
      timeOut: data.time_out,
    };
  } catch (err) {
    console.error("Error in addParcelOutItemHelper:", err);
    alert(err.message); // Show error to user
    return null;
  }
};
