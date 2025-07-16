import React, { useState, useEffect } from 'react';
import { FiTag } from 'react-icons/fi';
import apiInterceptor from '../services/apiInterceptor';

const DiscountCode = ({ onApplyDiscount, productId }) => {
  const [discountCode, setDiscountCode] = useState('');
  const [showDiscountList, setShowDiscountList] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [availableDiscounts, setAvailableDiscounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
      const { data } = await apiInterceptor.post('/coupons/apply', {
        productId,
        code: discountCode,
      });

      if (data.success) {
        setSelectedDiscount(data.discount);
        onApplyDiscount(data.discount);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
      setError(errorMessage);
      onApplyDiscount(null);
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
            onBlur={() => setTimeout(() => setShowDiscountList(false), 200)}
          />

          {showDiscountList && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
              {availableDiscounts.length > 0 ? (
                availableDiscounts.map((discount) => (
                  <div
                    key={discount.code}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectDiscount(discount)}
                  >
                    <div className="font-medium text-[#0053A0]">{discount.code}</div>
                    <div className="text-sm text-gray-600">{discount.description}</div>
                    <div className="text-xs text-gray-500">
                      Giảm {discount.discountPercent}% - Hết hạn: {new Date(discount.endDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-sm text-gray-500">Không có mã giảm giá nào</div>
              )}
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