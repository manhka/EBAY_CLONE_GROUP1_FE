// ví dụ: src/layouts/FilterBar.js

import React, { useState } from 'react';
import { FiFilter, FiChevronDown, FiGrid, FiList, FiRefreshCw, FiX, FiArrowRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';

export default function FilterBar({
    resultsCount,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    keyword
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const [showFilters, setShowFilters] = useState(false);
    // Hàm để xóa bộ lọc tên bằng cách cập nhật lại URL
    const handleRemoveKeyword = () => {
        const params = new URLSearchParams(location.search);
        params.delete('query');
        navigate(`${location.pathname}?${params.toString()}`);
    };
    // State tạm thời cho ô input giá, chỉ cập nhật khi nhấn Apply
    const [tempMinPrice, setTempMinPrice] = useState(priceRange[0] === 0 ? '' : priceRange[0]);
    const [tempMaxPrice, setTempMaxPrice] = useState(priceRange[1] === 1000 ? '' : priceRange[1]);

    const handleApplyPriceFilter = () => {
        // Chỉ cập nhật nếu có giá trị, nếu không thì giữ lại giá trị cũ
        const newMin = tempMinPrice !== '' ? Number(tempMinPrice) : 0;
        const newMax = tempMaxPrice !== '' ? Number(tempMaxPrice) : 1000;
        setPriceRange([newMin, newMax]);
    };

    const handleResetFilters = () => {
        setSortBy('featured');
        setPriceRange([0, 1000]);
        setTempMinPrice(0);
        setTempMaxPrice(1000);
        // Gọi các hàm reset khác nếu có
    };

    const isPriceFilterActive = priceRange[0] !== 0 || priceRange[1] !== 1000;
    const isKeywordFilterActive = keyword && keyword.trim() !== '';
    const anyFilterActive = isPriceFilterActive || isKeywordFilterActive;

    const PriceInput = ({ label, value, onChange }) => {
        return (
            <div className="relative border border-gray-400 rounded-lg px-3 pt-1 pb-2 mb-2 ml-1 w-full focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                <label className="absolute top-1 text-[10px] text-gray-500">{label}</label>
                <div className="flex items-center">
                    <span className="text-gray-700 mt-2">$</span>
                    <input
                        type="number"
                        value={value}
                        onChange={onChange}
                        placeholder="0"
                        className="w-fullpl-1 font-bold text-base bg-transparent border-0 p-0 mt-2 focus:ring-0 focus:outline-none"
                    />
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
                {/* Left side: Filter & View options */}
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <button onClick={() => setShowFilters(!showFilters)} className="flex items-center font-medium text-gray-700">
                        <FiFilter className="mr-2" /> Filters
                        <FiChevronDown className={`ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                    </button>
                    <div className="flex border rounded-md">
                        <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><FiGrid /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 border-l ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}><FiList /></button>
                    </div>
                </div>

                {/* Right side: Sort options */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Sort by:</span>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded-md p-1.5 text-sm">
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                    </select>
                    <button onClick={handleResetFilters} className="text-blue-600 hover:underline text-sm p-1.5"><FiRefreshCw /></button>
                </div>
            </div>

            {/* --- HIỂN THỊ CÁC BỘ LỌC ĐANG ÁP DỤNG --- */}
            {anyFilterActive && (
                <div className='flex items-center flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200'>
                    <span className="text-sm font-semibold">Active Filters:</span>

                    {isPriceFilterActive && (
                        <div className="flex items-center gap-1 bg-gray-200 text-gray-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
                            <span>${priceRange[0]} to ${priceRange[1]}</span>
                            <button onClick={() => setPriceRange([0, 1000])} className="ml-1 text-gray-500 hover:text-black">
                                <FiX size={16} />
                            </button>
                        </div>
                    )}

                    {isKeywordFilterActive && (
                        <div className="flex items-center gap-1 bg-gray-200 text-gray-800 text-sm font-medium pl-3 pr-1 py-1 rounded-full">
                            <span>"{keyword}"</span>
                            <button onClick={handleRemoveKeyword} className="ml-1 text-gray-500 hover:text-black">
                                <FiX size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- BỘ LỌC MỞ RỘNG --- */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <h3 className="font-medium mb-2">Price</h3>

                                    {/* === PHẦN NHẬP GIÁ ĐÃ SỬA LẠI === */}
                                    <div className="flex items-center gap-2">
                                        <PriceInput
                                            label="Min"
                                            value={tempMinPrice}
                                            onChange={e => setTempMinPrice(e.target.value)}
                                        />
                                        <span className='text-gray-500'>to</span>
                                        <PriceInput
                                            label="Max"
                                            value={tempMaxPrice}
                                            onChange={e => setTempMaxPrice(e.target.value)}
                                        />
                                        <button
                                            onClick={handleApplyPriceFilter}
                                            className="bg-gray-200 hover:bg-gray-300 rounded-full w-9 h-9 flex-shrink-0 flex items-center justify-center"
                                            aria-label="Apply price range"
                                        >
                                            <FiArrowRight size={18} />
                                        </button>
                                    </div>

                                </div>
                                {/* Thêm các bộ lọc khác ở đây */}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}