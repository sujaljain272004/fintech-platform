import api from "./api";

export const getLatestInsight = async () => {
  const response = await api.get("/insights/latest");
  return response.data.data;
};

export const generateInsight = async () => {
  const response = await api.post("/insights/generate");
  return response.data.data;
};
