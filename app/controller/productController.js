import {
  upsertProductIn,
  getProductIn,
  getProductInByName,
  deductProductIn,
  insertProductOut,
  getProductOut,
} from "../models/productModel";

/* =====================================
        PRODUCT IN CONTROLLER
=====================================*/

// ADD / UPDATE PRODUCT IN
export const handleAddProductIn = async (
  product_name,
  quantity,
  date,
  time_in,
  components,
) => {
  if (!product_name || !quantity) {
    alert("Fill all fields");
    return;
  }

  const formattedComponents = Array.isArray(components)
    ? components
    : JSON.parse(components || "[]");

  const result = await upsertProductIn({
    product_name,
    quantity,
    date,
    time_in,
    components: formattedComponents,
  });

  if (!result) {
    alert("Error adding/updating product");
    return;
  }

  alert("Product IN added/updated!");
  return result;
};

// FETCH PRODUCT IN
export const fetchProductInController = async () => {
  const data = await getProductIn();
  return data;
};

/* =====================================
        PRODUCT OUT CONTROLLER
=====================================*/

// ADD PRODUCT OUT (with automatic deduction from Product IN)
export const handleAddProductOut = async (
  product_name,
  quantity,
  date,
  time_out,
) => {
  if (!product_name || !quantity) {
    alert("Fill all fields");
    return;
  }

  // Step 1: Check and deduct from Product IN
  const deductResult = await deductProductIn(product_name, parseInt(quantity));

  if (!deductResult.success) {
    alert(deductResult.message);
    return;
  }

  // Step 2: Insert to Product OUT with deducted components
  const { data, error } = await insertProductOut({
    product_name,
    quantity: parseInt(quantity),
    date,
    time_out,
    components: deductResult.deductedComponents,
  });

  if (error) {
    console.error(error);
    alert("Error adding product OUT");
    return;
  }

  alert(
    `Product OUT added! Remaining stock: ${deductResult.remainingQuantity}`,
  );
  return data;
};

// FETCH PRODUCT OUT
export const fetchProductOutController = async () => {
  const data = await getProductOut();
  return data;
};
