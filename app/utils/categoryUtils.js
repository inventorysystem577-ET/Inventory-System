export const CATEGORIES = {
  COMPONENT: "Component",
  PRODUCT: "Product",
  TOOL: "Tool",
  EROV_PRODUCT: "EROV PRODUCT",
  JSUMO_PRODUCT: "JSUMO PRODUCT", 
  ZM_ROBO_PRODUCT: "ZM ROBO PRODUCT",
  OTHERS: "Others",
};

// Component categories (without the new product categories)
export const COMPONENT_CATEGORY_OPTIONS = [
  { value: CATEGORIES.COMPONENT, label: "Component (electronic components)" },
  { value: CATEGORIES.PRODUCT, label: "Product (finished products)" },
  { value: CATEGORIES.TOOL, label: "Tool (equipment and tools)" },
  { value: CATEGORIES.OTHERS, label: "Others (miscellaneous items)" },
];

// Product categories (only the new product categories)
export const PRODUCT_CATEGORY_OPTIONS = [
  { value: CATEGORIES.EROV_PRODUCT, label: "EROV PRODUCT" },
  { value: CATEGORIES.JSUMO_PRODUCT, label: "JSUMO PRODUCT" },
  { value: CATEGORIES.ZM_ROBO_PRODUCT, label: "ZM ROBO PRODUCT" },
];

// All categories (for backward compatibility)
export const CATEGORY_OPTIONS = [
  { value: CATEGORIES.COMPONENT, label: "Component (electronic components)" },
  { value: CATEGORIES.PRODUCT, label: "Product (finished products)" },
  { value: CATEGORIES.TOOL, label: "Tool (equipment and tools)" },
  { value: CATEGORIES.EROV_PRODUCT, label: "EROV PRODUCT" },
  { value: CATEGORIES.JSUMO_PRODUCT, label: "JSUMO PRODUCT" },
  { value: CATEGORIES.ZM_ROBO_PRODUCT, label: "ZM ROBO PRODUCT" },
  { value: CATEGORIES.OTHERS, label: "Others (miscellaneous items)" },
];

// Helper to get display name from database value
export const getCategoryDisplayName = (category) => {
  const categoryMap = {
    'Component': 'Component',
    'Product': 'Product', 
    'Tool': 'Tool',
    'EROV PRODUCT': 'EROV PRODUCT',
    'JSUMO PRODUCT': 'JSUMO PRODUCT',
    'ZM ROBO PRODUCT': 'ZM ROBO PRODUCT',
    'Others': 'Others'
  };
  return categoryMap[category] || category;
};

export const getCategoryColor = (category) => {
  switch (category) {
    case CATEGORIES.COMPONENT:
      return "bg-blue-100 text-blue-800 border-blue-200";
    case CATEGORIES.PRODUCT:
      return "bg-green-100 text-green-800 border-green-200";
    case CATEGORIES.TOOL:
      return "bg-purple-100 text-purple-800 border-purple-200";
    case CATEGORIES.EROV_PRODUCT:
      return "bg-orange-100 text-orange-800 border-orange-200";
    case CATEGORIES.JSUMO_PRODUCT:
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case CATEGORIES.ZM_ROBO_PRODUCT:
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case CATEGORIES.OTHERS:
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export const getCategoryIcon = (category) => {
  switch (category) {
    case CATEGORIES.COMPONENT:
      return "⚡";
    case CATEGORIES.PRODUCT:
      return "📦";
    case CATEGORIES.TOOL:
      return "🔧";
    case CATEGORIES.EROV_PRODUCT:
      return "🤖";
    case CATEGORIES.JSUMO_PRODUCT:
      return "🚀";
    case CATEGORIES.ZM_ROBO_PRODUCT:
      return "🦾";
    case CATEGORIES.OTHERS:
    default:
      return "📋";
  }
};

