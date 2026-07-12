import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);

export const getProducts = () => api.get("/products");
export const createProduct = (data) => api.post("/products", data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

export const getOrders = () => api.get("/orders");
export const createOrder = (data) => api.post("/orders", data);

export const getAnalytics = () => api.get("/analytics");
export const getAlerts = () => api.get("/alerts");

export const getCompanies = () => api.get("/admin/companies");
export const createCompany = (data) => api.post("/admin/companies", data);
export const updateCompany = (id, data) => api.put(`/admin/companies/${id}`, data);
export const deleteCompany = (id) => api.delete(`/admin/companies/${id}`);
export const getUsers = () => api.get("/admin/users");
export const createUser = (data) => api.post("/admin/users", data);
export const updateUser = (id, data) => api.put(`/admin/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

export const getApiErrorMessage = (error, fallbackMessage) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request) {
    return "Cannot connect to the backend server. Please try again in a few moments.";
  }

  return fallbackMessage;
};

export default api;
