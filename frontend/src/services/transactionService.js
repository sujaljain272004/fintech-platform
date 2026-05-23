import api from "./api";

export const getTransactions = async (params = {}) => {
  const response = await api.get("/transactions", { params });
  return response.data;
};

export const verifyTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}/verify`);
  return response.data.data;
};
