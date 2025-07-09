import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiX } from 'react-icons/fi';

export default function AddedToCartModal({ visible, onClose, product }) {
  if (!visible || !product) {
    return null;
  }

  return (
    // Lớp phủ nền
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose} // Cho phép đóng khi click ra ngoài
    >
      {/* Khung nội dung modal */}
      <div 
        className="bg-white rounded-lg p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()} // Ngăn việc click bên trong làm đóng modal
      >
        {/* Nút đóng (X) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <FiX size={24} />
        </button>

        {/* Phần header */}
        <div className="flex items-center text-green-600 mb-4">
          <FiCheckCircle size={24} className="mr-2" />
          <h2 className="text-xl font-semibold">Added to cart</h2>
        </div>

        {/* Thông tin sản phẩm đã thêm */}
        <div className="flex items-center border-t border-b py-4">
          <img 
            src={product.images?.[0]} 
            alt={product.title} 
            className="w-24 h-24 object-contain mr-4"
          />
          <div className="flex-grow">
            <p className="font-semibold text-gray-800">{product.title}</p>
          </div>
          <p className="text-lg font-bold">
            US ${((product.price || 0) / 100).toFixed(2)}
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link 
            to="/cart" 
            className="flex-1 text-center bg-white text-blue-600 font-bold py-3 rounded-full border-2 border-blue-600 hover:bg-blue-50"
          >
            See in cart
          </Link>
          <Link 
            to="/checkout" 
            className="flex-1 text-center bg-blue-600 text-white font-bold py-3 rounded-full hover:bg-blue-700"
          >
            Checkout 1 item
          </Link>
        </div>

      </div>
    </div>
  );
}