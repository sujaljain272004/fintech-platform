import api from "./api";

export const getDashboard = async () => {
  const response = await api.get("/wallet/dashboard");
  return response.data.data;
};

export const getWallet = async () => {
  const response = await api.get("/wallet");
  return response.data.data;
};

export const searchRecipientByPhone = async (phoneNumber) => {
  const response = await api.get("/wallet/recipient", {
    params: { phone: phoneNumber },
  });
  return response.data.data;
};

export const transferMoney = async (payload) => {
  const response = await api.post("/wallet/transfer", payload);
  return response.data;
};
