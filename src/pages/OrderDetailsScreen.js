import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OrderService from '../services/OrderService';
import '../assets/css/OrderHistoryStyle.css';

const OrderDetailsScreen = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch order details
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await OrderService.getOrderDetails(orderId);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải thông tin đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      
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
      
      setError('Không thể tải thông tin đơn hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

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

  if (loading) {
    return (
      <div className="order-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-container">
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/order-history')}
        >
          <i className="fas fa-arrow-left"></i> Quay lại danh sách
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-history-container">
        <div className="no-orders">
          <i className="fas fa-search"></i>
          <h3>Không tìm thấy đơn hàng</h3>
          <p>Đơn hàng bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      {/* Header */}
      <div className="order-history-header">
        <div>
          <button 
            className="btn btn-outline-primary me-3"
            onClick={() => navigate('/order-history')}
          >
            <i className="fas fa-arrow-left"></i> Quay lại
          </button>
          <h1 className="order-history-title d-inline">
            Chi Tiết Đơn Hàng #{order._id}
          </h1>
        </div>
        <div className={`order-status ${getStatusClass(order.status)}`}>
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Order Info */}
      <div className="order-card">
        <div className="order-header">
          <div>
            <div className="order-date">Ngày đặt: {formatDate(order.createdAt)}</div>
            {order.updatedAt !== order.createdAt && (
              <div className="order-date">Cập nhật: {formatDate(order.updatedAt)}</div>
            )}
          </div>
          <div className="order-total">
            Tổng tiền: {formatCurrency(order.totalPrice)}
          </div>
        </div>

        {/* Shipping Address */}
        {order.addressId && (
          <div className="mb-4">
            <h5><i className="fas fa-map-marker-alt"></i> Địa chỉ giao hàng</h5>
            <div className="p-3 bg-light rounded">
              <p className="mb-1"><strong>{order.addressId.fullName}</strong></p>
              <p className="mb-1">{order.addressId.street}</p>
              <p className="mb-1">{order.addressId.city}, {order.addressId.state}</p>
              <p className="mb-1">{order.addressId.country} {order.addressId.zipCode}</p>
              {order.addressId.phone && (
                <p className="mb-0">SĐT: {order.addressId.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="mb-4">
          <h5><i className="fas fa-shopping-cart"></i> Sản phẩm đã đặt</h5>
          {order.items && order.items.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Sản phẩm</th>
                    <th>Giá</th>
                    <th>Số lượng</th>
                    <th>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img 
                              src={item.product.images[0]} 
                              alt={item.product?.title || 'Product'} 
                              className="me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/50x50?text=No+Image';
                              }}
                            />
                          ) : (
                            <div 
                              className="me-3 d-flex align-items-center justify-content-center"
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                backgroundColor: '#f8f9fa',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px'
                              }}
                            >
                              <i className="fas fa-image text-muted"></i>
                            </div>
                          )}
                          <div>
                            <div className="fw-bold">{item.product?.title || 'Sản phẩm không xác định'}</div>
                            {item.product?.description && (
                              <small className="text-muted">
                                {item.product.description.length > 50 
                                  ? `${item.product.description.substring(0, 50)}...` 
                                  : item.product.description
                                }
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(item.unitPrice || 0)}</td>
                      <td>{item.quantity || 0}</td>
                      <td className="fw-bold">{formatCurrency((item.unitPrice || 0) * (item.quantity || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted">Không có thông tin sản phẩm</p>
          )}
        </div>

        {/* Shipping Info */}
        {order.shippingInfo && (
          <div className="mb-4">
            <h5><i className="fas fa-truck"></i> Thông tin vận chuyển</h5>
            <div className="p-3 bg-light rounded">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Phương thức:</strong> {order.shippingInfo.method}</p>
                  <p><strong>Phí vận chuyển:</strong> {formatCurrency(order.shippingInfo.cost)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Thời gian dự kiến:</strong> {order.shippingInfo.estimatedDelivery}</p>
                  {order.shippingInfo.trackingNumber && (
                    <p><strong>Mã vận đơn:</strong> {order.shippingInfo.trackingNumber}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="order-info">
          <div className="order-info-item">
            <div className="order-info-label">Tổng sản phẩm</div>
            <div className="order-info-value">{order.items?.length || 0} sản phẩm</div>
          </div>
          <div className="order-info-item">
            <div className="order-info-label">Phí vận chuyển</div>
            <div className="order-info-value">
              {order.shippingInfo ? formatCurrency(order.shippingInfo.cost) : 'Miễn phí'}
            </div>
          </div>
          <div className="order-info-item">
            <div className="order-info-label">Tổng thanh toán</div>
            <div className="order-info-value order-total">
              {formatCurrency(order.totalPrice)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsScreen; 