import { supabase } from "../../lib/supabaseClient";

/* ===============================
        PRODUCT IN MODEL
================================*/

// Insert or update Product In
export const upsertProductIn = async (data) => {
  // Check if product already exists
  const { data: existingData, error } = await supabase
    .from("product_in")
    .select("*")
    .eq("product_name", data.product_name)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found
    console.error("Supabase fetch error:", error);
    return null;
  }

  if (existingData) {
    // Merge quantities
    const newQuantity = existingData.quantity + data.quantity;

    // Merge components
    let mergedComponents = [];
    const existingComponents = Array.isArray(existingData.components)
      ? existingData.components
      : JSON.parse(existingData.components || "[]");

    const newComponents = Array.isArray(data.components)
      ? data.components
      : JSON.parse(data.components || "[]");

    // Merge each component
    mergedComponents = existingComponents.map((comp) => {
      const newComp = newComponents.find((c) => c.name === comp.name);
      if (newComp)
        return { name: comp.name, quantity: comp.quantity + newComp.quantity };
      return comp;
    });

    // Add components that didn't exist before
    newComponents.forEach((comp) => {
      if (!mergedComponents.find((c) => c.name === comp.name))
        mergedComponents.push(comp);
    });

    // Update Supabase
    const { data: updatedData, error: updateError } = await supabase
      .from("product_in")
      .update({
        quantity: newQuantity,
        components: mergedComponents,
        date: data.date,
        time_in: data.time_in,
      })
      .eq("id", existingData.id)
      .select();

    if (updateError) {
      console.error("Supabase update error:", updateError);
      return null;
    }

    return updatedData[0];
  } else {
    // Insert new product
    const { data: insertedData, error: insertError } = await supabase
      .from("product_in")
      .insert([data])
      .select();

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return null;
    }
    return insertedData[0];
  }
};

// Get all Product In records
export const getProductIn = async () => {
  const { data, error } = await supabase
    .from("product_in")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  return data.map((item) => ({
    ...item,
    components: Array.isArray(item.components)
      ? item.components
      : JSON.parse(item.components || "[]"),
  }));
};

// Get specific product by name
export const getProductInByName = async (product_name) => {
  const { data, error } = await supabase
    .from("product_in")
    .select("*")
    .eq("product_name", product_name)
    .single();

  if (error) {
    console.error("Supabase fetch error:", error);
    return null;
  }

  return {
    ...data,
    components: Array.isArray(data.components)
      ? data.components
      : JSON.parse(data.components || "[]"),
  };
};

// Deduct quantity and components from Product In
export const deductProductIn = async (product_name, quantity) => {
  const { data: existingData, error } = await supabase
    .from("product_in")
    .select("*")
    .eq("product_name", product_name)
    .single();

  if (error) {
    console.error("Product not found in inventory:", error);
    return { success: false, message: "Product not found in inventory" };
  }

  // Check if enough quantity available
  if (existingData.quantity < quantity) {
    return {
      success: false,
      message: `Not enough stock! Available: ${existingData.quantity}, Requested: ${quantity}`,
    };
  }

  const newQuantity = existingData.quantity - quantity;

  // Calculate deducted components
  const existingComponents = Array.isArray(existingData.components)
    ? existingData.components
    : JSON.parse(existingData.components || "[]");

  // Deduct components proportionally
  const deductedComponents = existingComponents.map((comp) => {
    const componentPerProduct = comp.quantity / existingData.quantity;
    const deductAmount = componentPerProduct * quantity;
    return {
      name: comp.name,
      quantity: deductAmount,
    };
  });

  // Update remaining components
  const remainingComponents = existingComponents.map((comp) => {
    const componentPerProduct = comp.quantity / existingData.quantity;
    const deductAmount = componentPerProduct * quantity;
    return {
      name: comp.name,
      quantity: comp.quantity - deductAmount,
    };
  });

  // Update Supabase
  const { data: updatedData, error: updateError } = await supabase
    .from("product_in")
    .update({
      quantity: newQuantity,
      components: remainingComponents,
    })
    .eq("id", existingData.id)
    .select();

  if (updateError) {
    console.error("Supabase update error:", updateError);
    return { success: false, message: "Error updating inventory" };
  }

  return {
    success: true,
    deductedComponents,
    remainingQuantity: newQuantity,
  };
};

/* ===============================
        PRODUCT OUT MODEL
================================*/

// Insert a new Product Out
export const insertProductOut = async (data) => {
  const { data: insertedData, error } = await supabase
    .from("products_out")
    .insert([data])
    .select();

  if (error) {
    console.error("Supabase insert error:", error);
    return { data: null, error };
  }

  return { data: insertedData, error: null };
};

// Get all Product Out records
export const getProductOut = async () => {
  const { data, error } = await supabase
    .from("products_out")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }

  return data.map((item) => ({
    ...item,
    components: Array.isArray(item.components)
      ? item.components
      : JSON.parse(item.components || "[]"),
  }));
};
