import {
  addParcelOutItem as modelAddParcelOutItem,
  getParcelOutItems as modelGetParcelOutItems,
  updateParcelOutItem as modelUpdateParcelOutItem,
  deleteParcelOutItem as modelDeleteParcelOutItem,
  deleteAllParcelOutItems as modelDeleteAllParcelOutItems,
} from "../models/parcelDeliveryModel";

export const addParcelOutItem = async (payload) => {
  return await modelAddParcelOutItem(payload);
};

export const getParcelOutItems = async () => {
  return await modelGetParcelOutItems();
};

export const updateParcelOutItem = async (id, updates) => {
  return await modelUpdateParcelOutItem(id, updates);
};

export const deleteParcelOutItem = async (id) => {
  return await modelDeleteParcelOutItem(id);
};

export const clearParcelOutHistory = async () => {
  return await modelDeleteAllParcelOutItems();
};
