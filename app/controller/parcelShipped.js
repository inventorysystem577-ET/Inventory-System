import {
  addParcelInItem as modelAddParcelInItem,
  getParcelInItems as modelGetParcelInItems,
  deleteParcelInItem as modelDeleteParcelInItem,
  updateParcelInItem as modelUpdateParcelInItem,
} from "../models/parcelShippedModel";

export const addParcelInItem = async (item) => {
  return await modelAddParcelInItem(item);
};

export const getParcelInItems = async () => {
  return await modelGetParcelInItems();
};

export const deleteParcelInItem = async (id) => {
  return await modelDeleteParcelInItem(id);
};

export const updateParcelInItem = async (id, updates) => {
  return await modelUpdateParcelInItem(id, updates);
};
