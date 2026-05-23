import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");
  return response.data.data;
};

export const getAdminUsers = async (params = {}) => {
  const response = await api.get("/admin/users", { params });
  return response.data;
};

export const getAdminTransactions = async (params = {}) => {
  const response = await api.get("/admin/transactions", { params });
  return response.data;
};

export const getAdminAuthLogs = async (params = {}) => {
  const response = await api.get("/admin/auth-logs", { params });
  return response.data;
};

export const updateAdminUserStatus = async (userId, status) => {
  const response = await api.patch(`/admin/users/${userId}/status`, { status });
  return response.data.data;
};

export const approveAdminUserKyc = async (userId) => {
  const response = await api.patch(`/admin/users/${userId}/kyc`);
  return response.data.data;
};

export const reverseAdminTransaction = async (transactionId) => {
  const response = await api.post(`/admin/transactions/${transactionId}/reverse`);
  return response.data.data;
};