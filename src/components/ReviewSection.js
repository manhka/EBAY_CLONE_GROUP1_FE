import { useEffect, useState } from "react";
import { FiStar, FiTrash2 } from "react-icons/fi";
import apiInterceptor from "../services/apiInterceptor";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await apiInterceptor.get(`/reviews/product/${productId}`);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === "") {
      alert("Please provide both rating and comment.");
      return;
    }
    try {
      setSubmitting(true);
      await apiInterceptor.post(`/reviews/`, {
        productId,
        rating,
        comment,
      });
      setRating(0);
      setComment("");
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete your review?")) return;
    try {
      await apiInterceptor.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert(error.response?.data?.message || "Failed to delete review.");
    }
  };

  const avgRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "0.0";

  // Kiểm tra user đã review chưa
  const userReview = reviews.find(
    (r) => r.user?._id === currentUser?._id
  );

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold">Customer Reviews</span>
        <span className="text-yellow-500 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={i < Math.round(avgRating) ? "fill-yellow-500" : ""}
            />
          ))}
        </span>
        <span className="text-sm text-gray-600">
          ({reviews.length} reviews)
        </span>
      </div>

      {reviews.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">No reviews yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="border border-gray-200 p-3 rounded-md relative"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={i < review.rating ? "fill-yellow-500" : ""}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {currentUser?._id === review.user?._id && (
                  <button
                    onClick={() => handleDelete(review._id)}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <FiTrash2 /> Delete
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-800">{review.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {/* Form chỉ hiện nếu chưa có review */}
      {currentUser ? (
        !userReview ? (
          <form onSubmit={handleSubmit} className="mt-6">
            <h3 className="text-base font-semibold mb-2">Write a Review</h3>
            <div className="flex gap-2 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`text-xl ${
                    i < rating ? "text-yellow-500" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Write your review..."
              className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
            <button
              type="submit"
              disabled={submitting}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-sm text-gray-500">
            You have already submitted a review.
          </p>
        )
      ) : (
        <p className="mt-4 text-sm text-gray-500">
          Please sign in to leave a review.
        </p>
      )}
    </div>
  );
}
