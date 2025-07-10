import apiInterceptor from "./apiInterceptor";

class OrderService {
  // Get order history with pagination and filtering
  static async getOrderHistory(params = {}) {
    try {
      const { page = 1, limit = 10, status } = params;
      let url = `/orders?page=${page}&limit=${limit}`;
      
      if (status) {
        url += `&status=${status}`;
      }

      const response = await apiInterceptor.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching order history:", error);
      throw error;
    }
  }

  // Get order details by ID
  static async getOrderDetails(orderId) {
    try {
      const response = await apiInterceptor.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order details:", error);
      throw error;
    }
  }

  // Create return request
  static async createReturnRequest(data) {
    try {
      const response = await apiInterceptor.post("/return-requests", data);
      return response.data;
    } catch (error) {
      console.error("Error creating return request:", error);
      throw error;
    }
  }

  // Get return requests
  static async getReturnRequests(params = {}) {
    try {
      const { page = 1, limit = 10, status } = params;
      let url = `/return-requests?page=${page}&limit=${limit}`;
      
      if (status) {
        url += `&status=${status}`;
      }

      const response = await apiInterceptor.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching return requests:", error);
      throw error;
    }
  }

  // Get return request details by ID
  static async getReturnRequestDetails(requestId) {
    try {
      const response = await apiInterceptor.get(`/return-requests/${requestId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching return request details:", error);
      throw error;
    }
  }
}

export default OrderService; 