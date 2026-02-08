// utils/parcelHelper.js
import axios from "axios";

// Fetch all parcel-in items
export const fetchParcelItems = async () => {
  try {
    const res = await axios.get("/api/parcelShipped");
    return res.data.map((item) => ({
      id: item.id,
      name: item.item_name,
      date: item.date,
      quantity: item.quantity,
      timeIn: item.time_in,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Add a new parcel-in item
export const addParcelItem = async ({ item_name, date, quantity, time_in }) => {
  try {
    const res = await axios.post("/api/parcelShipped", {
      item_name,
      date,
      quantity,
      time_in,
    });
    const data = res.data;
    return {
      id: data.id,
      name: data.item_name,
      date: data.date,
      quantity: data.quantity,
      timeIn: data.time_in,
    };
  } catch (err) {
    console.error(err.response?.data || err.message);
    return null;
  }
};

// High-level handler moved out of page: accepts form pieces, creates time string and adds item
export const handleAddParcelIn = async ({ name, date, quantity, timeHour, timeMinute, timeAMPM }) => {
  const timeString = `${timeHour}:${timeMinute} ${timeAMPM}`;
  const newItem = await addParcelItem({ item_name: name, date, quantity: Number(quantity), time_in: timeString });
  if (!newItem) return null;

  // Return newly added item and refreshed list
  const items = await fetchParcelItems();
  return { newItem, items };
};
