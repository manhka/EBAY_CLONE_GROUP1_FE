import { useEffect, useState } from "react";
import { FiStar } from "react-icons/fi";
import apiInterceptor from "../services/apiInterceptor";

export default function ReviewSection({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await apiInterceptor.get(`/reviews/product/${productId}`);
      setReviews(data.reviews || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setMessage("Failed to load reviews. Please try again.");
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
      setMessage("Please provide both a rating and a comment.");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");
      await apiInterceptor.post(`/reviews`, {
        productId,
        rating,
        comment,
      });
      setRating(0);
      setComment("");
      setMessage("Review submitted successfully!");
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      setMessage(
        error.response?.data?.message || "Failed to submit review. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  return (
    <div className="mt-6 p-4 bg-white rounded-lg shadow-md font-sans">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
        <span className="text-xl font-bold text-gray-800">Customer Reviews</span>
        <span className="text-yellow-500 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <FiStar
              key={i}
              className={`text-lg ${
                i < Math.round(avgRating) ? "fill-yellow-500" : "text-gray-300"
              }`}
            />
          ))}
        </span>
        <span className="text-sm text-gray-600">
          ({reviews.length} reviews)
        </span>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-500 mt-2">
          No reviews yet. Be the first to review!
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((review) => (
            <li
              key={review._id}
              className="border border-gray-200 p-4 rounded-lg bg-gray-50 relative shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FiStar
                          key={i}
                          className={`text-base ${
                            i < review.rating ? "fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-1">
                    {review.user?.username || "Anonymous User"}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-800 leading-relaxed">
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      )}

      {message && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            message.includes("success")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      {currentUser ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Write a Review
          </h3>
          <div className="flex gap-1 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i + 1)}
                className={`text-2xl cursor-pointer transition-colors duration-200 ease-in-out ${
                  i < rating
                    ? "text-yellow-500"
                    : "text-gray-300 hover:text-yellow-400"
                }`}
                aria-label={`Rate ${i + 1} stars`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="Share your thoughts on this product..."
            className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <p className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-sm">
          Please sign in to leave a review.
        </p>
      )}
    </div>
  );
}
