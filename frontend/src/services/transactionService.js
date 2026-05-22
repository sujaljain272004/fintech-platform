import api from "./api";

export const getTransactions = async () => {
  const response = await api.get("/transactions");
  return response.data.data;
};

export const verifyTransaction = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}/verify`);
  return response.data.data;
};
