import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService';
import '../assets/css/OrderHistoryStyle.css';

const OrderHistoryScreen = () => {
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [limit] = useState(10);

  // Fetch orders from API
  const fetchOrders = async (page = 1, status = '') => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit,
        ...(status && { status })
      };
      
      const response = await OrderService.getOrderHistory(params);
      
      if (response.success) {
        setOrders(response.data.orders);
        setTotalPages(response.data.totalPages);
        setTotalOrders(response.data.totalOrders);
        setCurrentPage(response.data.currentPage);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      
      // Handle authentication errors like ProfileScreen
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      }
      
      setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders(1, statusFilter);
  }, [statusFilter]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchOrders(newPage, statusFilter);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    setCurrentPage(1);
  };

  // Handle view order details
  const handleViewDetails = (orderId) => {
    navigate(`/order-details/${orderId}`);
  };

  // Handle back button
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle return request
  const handleReturnRequest = async (orderId, event = null) => {
    let originalText = '';
    try {
      const reason = prompt('Vui lòng nhập lý do hoàn trả:');
      if (!reason || reason.trim() === '') {
        alert('Vui lòng nhập lý do hoàn trả.');
        return;
      }

      // Show loading state
      if (event && event.target) {
        originalText = event.target.textContent;
        event.target.textContent = 'Đang xử lý...';
        event.target.disabled = true;
      }

      const response = await OrderService.createReturnRequest({
        orderId,
        reason: reason.trim()
      });

      if (response.success) {
        alert('Yêu cầu hoàn trả đã được gửi thành công!\nChúng tôi sẽ xem xét và phản hồi trong vòng 24-48 giờ.');
        fetchOrders(currentPage, statusFilter); // Refresh orders
      } else {
        // Handle specific error messages
        if (response.message && response.message.includes('already in progress')) {
          alert('Đơn hàng này đã có yêu cầu hoàn trả đang được xử lý.\nVui lòng kiểm tra trạng thái yêu cầu hoàn trả của bạn.');
        } else if (response.message && response.message.includes('status:')) {
          alert('Không thể tạo yêu cầu hoàn trả cho đơn hàng này.\nChỉ có thể hoàn trả đơn hàng đã giao hoặc đang giao.');
        } else {
          alert(response.message || 'Có lỗi xảy ra khi tạo yêu cầu hoàn trả. Vui lòng thử lại sau.');
        }
      }
    } catch (error) {
      console.error('Error creating return request:', error);
      
      // Handle authentication errors
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
          navigate('/login');
          return;
        } else if (error.response.status === 400 && error.response.data?.msg) {
          // Handle 400 errors with specific messages
          if (error.response.data.msg.includes('already in progress')) {
            alert('Đơn hàng này đã có yêu cầu hoàn trả đang được xử lý.\nVui lòng kiểm tra trạng thái yêu cầu hoàn trả của bạn.');
          } else {
            alert(error.response.data.msg);
          }
          return;
        }
      }
      
      alert('Không thể tạo yêu cầu hoàn trả. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      // Reset button state
      if (event && event.target) {
        event.target.textContent = originalText || 'Hoàn trả';
        event.target.disabled = false;
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(0);
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      case 'refunded': return 'status-refunded';
      default: return 'status-pending';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Chờ xử lý';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipped': return 'Đang giao';
      case 'delivered': return 'Đã giao';
      case 'cancelled': return 'Đã hủy';
      case 'refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Check if order can be returned
  const canReturn = (order) => {
    const allowedStatuses = ['delivered', 'shipped'];
    const hasValidStatus = allowedStatuses.includes(order.status);
    const hasNoReturnRequest = !order.returnRequest?.hasReturnRequest;
    return hasValidStatus && hasNoReturnRequest;
  };

  // Get return request status text and class
  const getReturnRequestInfo = (returnRequest) => {
    if (!returnRequest?.hasReturnRequest) {
      return null;
    }
    
    const statusText = {
      pending: 'Chờ xử lý',
      approved: 'Đã chấp nhận',
      processed: 'Đang xử lý',
      completed: 'Hoàn thành',
      rejected: 'Bị từ chối'
    };
    
    const statusClass = {
      pending: 'return-status-pending',
      approved: 'return-status-approved', 
      processed: 'return-status-processed',
      completed: 'return-status-completed',
      rejected: 'return-status-rejected'
    };
    
    return {
      text: statusText[returnRequest.status] || returnRequest.status,
      class: statusClass[returnRequest.status] || 'return-status-default'
    };
  };

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={handleBack}
            title="Quay lại"
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h1 className="order-history-title">
            <i className="fas fa-shopping-bag"></i> Lịch Sử Đơn Hàng
          </h1>
        </div>
        <div className="order-filters">
          <select 
            className="filter-select" 
            value={statusFilter} 
            onChange={handleStatusFilterChange}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipped">Đang giao</option>
            <option value="delivered">Đã giao</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-shopping-cart"></i>
          <h3>Chưa có đơn hàng nào</h3>
          <p>Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!</p>
        </div>
      ) : (
        <>
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div>
                  <div className="order-id">#{order._id}</div>
                  <div className="order-date">{formatDate(order.createdAt)}</div>
                </div>
                <div className={`order-status ${getStatusClass(order.status)}`}>
                  {getStatusText(order.status)}
                </div>
              </div>

              <div className="order-info">
                <div className="order-info-item">
                  <div className="order-info-label">Số lượng sản phẩm</div>
                  <div className="order-info-value">{order.itemCount} sản phẩm</div>
                </div>
                <div className="order-info-item">
                  <div className="order-info-label">Địa chỉ giao hàng</div>
                  <div className="order-info-value">
                    {order.addressId ? 
                      `${order.addressId.street}, ${order.addressId.city}` : 
                      'Chưa có thông tin'
                    }
                  </div>
                </div>
                <div className="order-info-item">
                  <div className="order-info-label">Tổng tiền</div>
                  <div className="order-info-value order-total">
                    {formatCurrency(order.totalPrice)}
                  </div>
                </div>
              </div>

              {/* Return Request Status */}
              {order.returnRequest?.hasReturnRequest && (
                <div className="return-request-info">
                  <div className="return-request-label">
                    <i className="fas fa-undo"></i> Trạng thái hoàn trả:
                  </div>
                  <div className={`return-request-status ${getReturnRequestInfo(order.returnRequest)?.class}`}>
                    {getReturnRequestInfo(order.returnRequest)?.text}
                  </div>
                </div>
              )}

              <div className="order-actions">
                <button 
                  className="btn-view-details"
                  onClick={() => handleViewDetails(order._id)}
                >
                  <i className="fas fa-eye"></i> Xem chi tiết
                </button>
                {canReturn(order) && (
                  <button 
                    className="btn-return"
                    onClick={(e) => handleReturnRequest(order._id, e)}
                  >
                    <i className="fas fa-undo"></i> Hoàn trả
                  </button>
                )}
                {order.returnRequest?.hasReturnRequest && !canReturn(order) && (
                  <button 
                    className="btn-return"
                    disabled
                    title={`Đã có yêu cầu hoàn trả: ${getReturnRequestInfo(order.returnRequest)?.text}`}
                  >
                    <i className="fas fa-undo"></i> Đã yêu cầu hoàn trả
                  </button>
                )}
              </div>
            </div>
          ))}

          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i> Trước
              </button>
              
              <div className="pagination-info">
                Trang {currentPage} / {totalPages} ({totalOrders} đơn hàng)
              </div>
              
              <button 
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default OrderHistoryScreen; 