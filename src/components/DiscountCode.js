import React, { useState, useEffect } from 'react';
import { FiTag } from 'react-icons/fi';
import apiInterceptor from '../services/apiInterceptor';

const DiscountCode = ({ onApplyDiscount, productId }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscountList, setShowDiscountList] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // Dùng để hiển thị lỗi ngay trên UI

  // Fetch available discount codes for the product
  useEffect(() => {
    // Không fetch nếu không có productId
    if (!productId) {
      setAvailableDiscounts([]);
      return;
    }

    const fetchDiscounts = async () => {
      setIsLoading(true);
      setError('');
      try {
        // ✅ SỬA LẠI: Dùng apiInterceptor và đúng đường dẫn
        const { data } = await apiInterceptor.get(`/coupons/product/${productId}`);
        setAvailableDiscounts(data || []);
      } catch (err) {
        console.error('Error fetching discount codes:', err);
        // Có thể không cần báo lỗi cho người dùng ở bước này
        setAvailableDiscounts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscounts();
  }, [productId]);

  const handleApplyDiscount = async () => {
    if (!discountCode) return;

    setIsLoading(true);
    setError('');
    setSelectedDiscount(null);

    try {
      // ✅ SỬA LẠI: Dùng apiInterceptor và đúng đường dẫn
      const { data } = await apiInterceptor.post('/coupons/apply', {
        productId,
        code: discountCode,
      });

      if (data.success) {
        setSelectedDiscount(data.discount); // Lưu lại thông tin mã đã áp dụng
        onApplyDiscount(data.discount); // Gọi hàm callback của component cha
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      setError(errorMessage); // Hiển thị lỗi trên UI thay vì alert
      onApplyDiscount(null); // Reset mã giảm giá ở component cha nếu thất bại
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDiscount = (discount) => {
    setDiscountCode(discount.code);
    setShowDiscountList(false);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <FiTag className="text-gray-600" />
        <span className="text-sm font-medium">Mã giảm giá</span>
      </div>
      
      <div className="mt-2 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Nhập mã"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            onFocus={() => setShowDiscountList(true)}
            onBlur={() => setTimeout(() => setShowDiscountList(false), 200)} // Thêm delay để kịp click
          />
          
          {showDiscountList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
              {/* ... JSX hiển thị danh sách mã giảm giá ... */}
            </div>
          )}
        </div>
        
        <button
          onClick={handleApplyDiscount}
          disabled={isLoading || !discountCode}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? '...' : 'Áp dụng'}
        </button>
      </div>

      {/* ✅ HIỂN THỊ LỖI HOẶC THÀNH CÔNG TRỰC TIẾP */}
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
      {selectedDiscount && !error && (
        <div className="mt-2 text-sm text-green-600">
          Đã áp dụng mã: {selectedDiscount.code} (-{selectedDiscount.discountPercent}%)
        </div>
      )}
    </div>
  );
};

export default DiscountCode;