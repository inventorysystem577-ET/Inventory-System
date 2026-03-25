import axios from "axios";

const getApiErrorMessage = (error, fallbackMessage) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string") {
    const normalized = responseData.trim().toLowerCase();
    if (normalized.startsWith("<!doctype html") || normalized.startsWith("<html")) {
      return "API route was not found (received HTML response). Please restart the dev server and try again.";
    }
    return responseData;
  }

  if (responseData && typeof responseData === "object") {
    return responseData.message || fallbackMessage;
  }

  return fallbackMessage;
};

export const handleSubmitAccessRequest = async (formData) => {
  console.log('=== HANDLE ACCESS REQUEST START ===');
  console.log('Form data received:', formData);
  
  try {
    const requestData = {
      name: formData.name,
      email: formData.email,
      role: formData.role,
      reason: formData.reason,
    };
    console.log('Request data to send:', requestData);

    const response = await axios.post("/api/auth/request-access", requestData);
    console.log('API response:', response.data);
    console.log('=== HANDLE ACCESS REQUEST COMPLETE ===');

    return response.data; // ✅ Return data for onSuccess callback
  } catch (error) {
    console.error('=== HANDLE ACCESS REQUEST ERROR ===');
    console.error('Error details:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    
    if (error.response) {
      throw new Error(getApiErrorMessage(error, "Request failed"));
    } else if (error.request) {
      throw new Error("No Response From Server. Please Try Again");
    } else {
      throw new Error(error.message);
    }
  }
};

export const fetchAccessRequests = async (status = null) => {
  try {
    const params = status ? `?status=${status}` : '';
    const response = await axios.get(`/api/auth/request-access${params}`);
    console.log('API Response:', response.data);
    return response.data.requests || response.data; // Handle both structures
  } catch (error) {
    console.error('Fetch error:', error);
    if (error.response) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch access requests"));
    } else if (error.request) {
      throw new Error("No Response From Server. Please Try Again");
    } else {
      throw new Error(error.message);
    }
  }
};

export const fetchAccessRequestStatusByEmail = async (email) => {
  try {
    const normalizedEmail = (email || "").toString().trim().toLowerCase();
    if (!normalizedEmail) {
      throw new Error("Email is required");
    }

    const response = await axios.get(
      `/api/auth/request-access?email=${encodeURIComponent(normalizedEmail)}`,
    );

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(getApiErrorMessage(error, "Failed to fetch access request status"));
    } else if (error.request) {
      throw new Error("No Response From Server. Please Try Again");
    } else {
      throw new Error(error.message);
    }
  }
};

export const handleApproveRequest = async (requestId, action, approvedBy) => {
  try {
    const response = await axios.post("/api/auth/approve-access", {
      requestId,
      action,
      approvedBy,
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(getApiErrorMessage(error, "Failed to update access request"));
    } else if (error.request) {
      throw new Error("No Response From Server. Please Try Again");
    } else {
      throw new Error(error.message);
    }
  }
};
