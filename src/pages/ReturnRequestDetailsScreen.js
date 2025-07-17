import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import OrderService from "../services/OrderService";
import "../assets/css/ReturnRequestStyle.css";

const ReturnRequestDetailsScreen = () => {
  const { requestId } = useParams();
  const [returnRequest, setReturnRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReturnRequestDetails();
  }, [requestId]);

  const fetchReturnRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrderService.getReturnRequestDetails(requestId);
      
      if (response.success) {
        setReturnRequest(response.data.returnRequest);
      } else {
        setError(response.msg || "Không thể tải chi tiết yêu cầu hoàn trả");
      }
    } catch (error) {
      console.error("Error fetching return request details:", error);
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      if (error.response?.status === 404) {
        setError("Không tìm thấy yêu cầu hoàn trả này");
        return;
      }
      setError("Có lỗi xảy ra khi tải chi tiết yêu cầu hoàn trả");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Không xác định";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "return-status-pending";
      case "approved":
        return "return-status-approved";
      case "processed":
        return "return-status-processed";
      case "completed":
        return "return-status-completed";
      case "rejected":
        return "return-status-rejected";
      default:
        return "return-status-default";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xử lý";
      case "approved":
        return "Đã chấp nhận";
      case "processed":
        return "Đang xử lý";
      case "completed":
        return "Hoàn thành";
      case "rejected":
        return "Từ chối";
      default:
        return status || "Không xác định";
    }
  };

  const getOrderStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "Chờ xác nhận";
      case "confirmed":
        return "Đã xác nhận";
      case "shipped":
        return "Đang giao hàng";
      case "delivered":
        return "Đã giao hàng";
      case "cancelled":
        return "Đã hủy";
      case "refunded":
        return "Đã hoàn tiền";
      default:
        return status || "Không xác định";
    }
  };

  const handleBackToList = () => {
    navigate("/return-requests");
  };

  const handleViewOrder = () => {
    if (returnRequest?.orderId?._id) {
      navigate(`/order-details/${returnRequest.orderId._id}`);
    }
  };

  if (loading) {
    return (
      <div className="return-request-container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải chi tiết yêu cầu hoàn trả...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="return-request-container">
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={handleBackToList}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!returnRequest) {
    return (
      <div className="return-request-container">
        <div className="alert alert-warning" role="alert">
          Không tìm thấy yêu cầu hoàn trả
        </div>
        <button className="btn btn-primary" onClick={handleBackToList}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="return-request-container">
      <div className="return-request-header">
        <h1 className="return-request-title">
          <i className="fas fa-undo-alt me-2"></i>
          Chi tiết yêu cầu hoàn trả
        </h1>
        <button className="btn btn-outline-primary" onClick={handleBackToList}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại danh sách
        </button>
      </div>

      <div className="return-request-card">
        <div className="return-request-card-header">
          <div>
            <div className="return-request-id">
              Yêu cầu #{returnRequest._id?.slice(-6).toUpperCase() || "N/A"}
            </div>
            <div className="return-request-date">
              Tạo lúc: {formatDate(returnRequest?.createdAt)}
            </div>
          </div>
          <span
            className={`return-request-status ${getStatusClass(
              returnRequest?.status
            )}`}
          >
            {getStatusText(returnRequest?.status)}
          </span>
        </div>

        <div className="return-request-info">
          <div className="return-request-info-item">
            <span className="return-request-info-label">Trạng thái</span>
            <span className="return-request-info-value">
              {getStatusText(returnRequest?.status)}
            </span>
          </div>
          <div className="return-request-info-item">
            <span className="return-request-info-label">Ngày tạo</span>
            <span className="return-request-info-value">
              {formatDate(returnRequest?.createdAt)}
            </span>
          </div>
          {returnRequest?.updatedAt && returnRequest?.updatedAt !== returnRequest?.createdAt && (
            <div className="return-request-info-item">
              <span className="return-request-info-label">Cập nhật lần cuối</span>
              <span className="return-request-info-value">
                {formatDate(returnRequest?.updatedAt)}
              </span>
            </div>
          )}
        </div>

        <div className="return-request-reason">
          <strong>Lý do hoàn trả:</strong>
          <br />
          {returnRequest?.reason}
        </div>

        {returnRequest?.adminNote && (
          <div className="return-request-reason" style={{ borderLeftColor: "#dc3545" }}>
            <strong>Ghi chú từ quản trị viên:</strong>
            <br />
            {returnRequest?.adminNote}
          </div>
        )}

        {returnRequest?.orderId && (
          <div className="return-request-order-info">
            <div className="return-request-order-title">
              THÔNG TIN ĐƠN HÀNG LIÊN QUAN
            </div>
            <div className="return-request-info">
              <div className="return-request-info-item">
                <span className="return-request-info-label">Mã đơn hàng</span>
                <span className="return-request-info-value">
                  #{returnRequest?.orderId?._id?.slice(-6).toUpperCase() || "N/A"}
                </span>
              </div>
              <div className="return-request-info-item">
                <span className="return-request-info-label">Ngày đặt hàng</span>
                <span className="return-request-info-value">
                  {formatDate(returnRequest?.orderId?.orderDate)}
                </span>
              </div>
              <div className="return-request-info-item">
                <span className="return-request-info-label">Trạng thái đơn hàng</span>
                <span className="return-request-info-value">
                  {getOrderStatusText(returnRequest?.orderId?.status)}
                </span>
              </div>
              <div className="return-request-info-item">
                <span className="return-request-info-label">Tổng tiền</span>
                <span className="return-request-info-value return-request-total">
                  {formatCurrency(returnRequest?.orderId?.totalPrice)}
                </span>
              </div>
            </div>

            {returnRequest?.orderId?.addressId && (
              <div className="return-request-info-item">
                <span className="return-request-info-label">Địa chỉ giao hàng</span>
                <span className="return-request-info-value">
                  {returnRequest?.orderId?.addressId?.fullName} - {" "}
                  {returnRequest?.orderId?.addressId?.street}, {" "}
                  {returnRequest?.orderId?.addressId?.city}, {" "}
                  {returnRequest?.orderId?.addressId?.state}, {" "}
                  {returnRequest?.orderId?.addressId?.country}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="return-request-actions">
          {returnRequest?.orderId && (
            <button
              className="btn btn-outline-info"
              onClick={handleViewOrder}
            >
              <i className="fas fa-eye me-1"></i>
              Xem đơn hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnRequestDetailsScreen; 