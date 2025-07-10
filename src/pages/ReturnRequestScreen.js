import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import OrderService from "../services/OrderService";
import "../assets/css/ReturnRequestStyle.css";

const ReturnRequestScreen = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchReturnRequests();
  }, [currentPage, statusFilter]);

  const fetchReturnRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: ITEMS_PER_PAGE,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await OrderService.getReturnRequests(params);
      
      if (response.success) {
        setReturnRequests(response.data.returnRequests || []);
        setCurrentPage(response.data.currentPage || 1);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.msg || "Không thể tải danh sách yêu cầu hoàn trả");
      }
    } catch (error) {
      console.error("Error fetching return requests:", error);
      if (error.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError("Có lỗi xảy ra khi tải danh sách yêu cầu hoàn trả");
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

  const handleViewDetails = (requestId) => {
    if (requestId) {
      navigate(`/return-requests/${requestId}`);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  if (loading && returnRequests.length === 0) {
    return (
      <div className="return-request-container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
          <p>Đang tải danh sách yêu cầu hoàn trả...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="return-request-container">
      <div className="return-request-header">
        <h1 className="return-request-title">
          <i className="fas fa-undo-alt me-2"></i>
          Yêu cầu hoàn trả
        </h1>
        <div className="return-request-filters">
          <select
            className="form-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
            style={{ width: "200px" }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã chấp nhận</option>
            <option value="processed">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="fas fa-exclamation-circle me-2"></i>
          {error}
        </div>
      )}

      {returnRequests.length === 0 && !loading ? (
        <div className="no-return-requests">
          <i className="fas fa-inbox"></i>
          <h3>Chưa có yêu cầu hoàn trả nào</h3>
          <p>Bạn chưa tạo yêu cầu hoàn trả nào cho các đơn hàng của mình.</p>
        </div>
      ) : (
        <>
          {returnRequests.map((request) => (
            <div key={request._id} className="return-request-card">
              <div className="return-request-card-header">
                <div>
                  <div className="return-request-id">
                    Yêu cầu #{request._id?.slice(-6).toUpperCase() || "N/A"}
                  </div>
                  <div className="return-request-date">
                    Tạo lúc: {formatDate(request?.createdAt)}
                  </div>
                </div>
                <span
                  className={`return-request-status ${getStatusClass(
                    request?.status
                  )}`}
                >
                  {getStatusText(request?.status)}
                </span>
              </div>

              <div className="return-request-reason">
                <strong>Lý do hoàn trả:</strong> {request?.reason}
              </div>

              <div className="return-request-order-info">
                <div className="return-request-order-title">
                  THÔNG TIN ĐƠN HÀNG LIÊN QUAN
                </div>
                <div className="return-request-info">
                  <div className="return-request-info-item">
                    <span className="return-request-info-label">Mã đơn hàng</span>
                    <span className="return-request-info-value">
                      #{request?.order?._id?.slice(-6).toUpperCase() || "N/A"}
                    </span>
                  </div>
                  <div className="return-request-info-item">
                    <span className="return-request-info-label">Ngày đặt</span>
                    <span className="return-request-info-value">
                      {formatDate(request?.order?.orderDate)}
                    </span>
                  </div>
                  <div className="return-request-info-item">
                    <span className="return-request-info-label">Số lượng sản phẩm</span>
                    <span className="return-request-info-value">
                      {request?.itemCount || 0} sản phẩm
                    </span>
                  </div>
                  <div className="return-request-info-item">
                    <span className="return-request-info-label">Tổng tiền</span>
                    <span className="return-request-info-value return-request-total">
                      {formatCurrency(request?.order?.totalPrice)}
                    </span>
                  </div>
                </div>

                {request?.order?.shippingAddress && (
                  <div className="return-request-info-item">
                    <span className="return-request-info-label">Địa chỉ giao hàng</span>
                    <span className="return-request-info-value">
                      {request?.order?.shippingAddress?.fullName} - {" "}
                      {request?.order?.shippingAddress?.street}, {" "}
                      {request?.order?.shippingAddress?.city}, {" "}
                      {request?.order?.shippingAddress?.state}, {" "}
                      {request?.order?.shippingAddress?.country}
                    </span>
                  </div>
                )}
              </div>

              <div className="return-request-actions">
                <button
                  className="btn-view-return-details"
                  onClick={() => handleViewDetails(request?._id)}
                >
                  <i className="fas fa-eye me-1"></i>
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Return requests pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                </li>

                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 2 && page <= currentPage + 2)
                  ) {
                    return (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    );
                  } else if (
                    page === currentPage - 3 ||
                    page === currentPage + 3
                  ) {
                    return (
                      <li key={page} className="page-item disabled">
                        <span className="page-link">...</span>
                      </li>
                    );
                  }
                  return null;
                })}

                <li
                  className={`page-item ${
                    currentPage === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          )}

          {loading && (
            <div className="text-center mt-3">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReturnRequestScreen; 