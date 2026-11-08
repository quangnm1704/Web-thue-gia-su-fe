import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  GraduationCap,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { reviewApi } from '../services/api';

export default function ReviewModal({
  isOpen,
  onClose,
  targetItem, // { type: 'booking' | 'enrollment', id, tutorName, title }
  onReviewSubmitted = null
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Vui lòng viết một vài dòng nhận xét đánh giá.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        rating: rating,
        comment: comment.trim(),
        bookingId: targetItem.type === 'booking' ? targetItem.id : null,
        enrollmentId: targetItem.type === 'enrollment' ? targetItem.id : null
      };

      await reviewApi.create(payload);
      setSuccessMsg('Cảm ơn bạn! Đánh giá đã được ghi nhận và cập nhật vào hồ sơ gia sư.');
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setComment('');
      }, 1500);
    } catch (err) {
      console.error('Lỗi gửi đánh giá:', err);
      setErrorMsg('Không thể gửi đánh giá: ' + (err.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 520, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={20} color="#eab308" fill="#eab308" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Đánh Giá Dịch Vụ & Gia Sư (CN02.18)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                ServiceFeedbackFrm — Đánh giá chất lượng giảng dạy
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
              <CheckCircle2 size={16} color="#16a34a" /> <span>{successMsg}</span>
            </div>
          )}

          {/* Target Service Card */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 20
          }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 }}>
              {targetItem.type === 'booking' ? 'Hợp đồng gia sư 1-1:' : 'Khóa học đã hoàn thành:'}
            </span>
            <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block' }}>
              {targetItem.title || 'Dịch vụ giảng dạy'}
            </strong>
            {targetItem.tutorName && (
              <span style={{ fontSize: '0.82rem', color: '#7c3aed', fontWeight: 600, display: 'block', marginTop: 2 }}>
                Gia sư: {targetItem.tutorName}
              </span>
            )}
          </div>

          {/* Star Rating Picker */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: 10 }}>
              Bạn chấm điểm buổi học mấy sao?
            </label>
            <div style={{ display: 'inline-flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      transition: 'transform 0.15s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <Star
                      size={32}
                      color="#eab308"
                      fill={isFilled ? '#eab308' : 'none'}
                    />
                  </button>
                );
              })}
            </div>
            <span style={{ display: 'block', fontSize: '0.85rem', color: '#eab308', fontWeight: 800, marginTop: 6 }}>
              {rating === 5 ? '⭐⭐⭐⭐⭐ Xuất sắc (5/5)' :
               rating === 4 ? '⭐⭐⭐⭐ Rất tốt (4/5)' :
               rating === 3 ? '⭐⭐⭐ Bình thường (3/5)' :
               rating === 2 ? '⭐⭐ Cần cải thiện (2/5)' : '⭐ Kém (1/5)'}
            </span>
          </div>

          {/* Comment input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Nhận xét chi tiết về gia sư & buổi học:
            </label>
            <textarea
              rows={4}
              placeholder="Chia sẻ trải nghiệm học tập của bạn: gia sư giảng bài có dễ hiểu không, thời gian đúng hẹn không, sự nhiệt tình..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !comment.trim()}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: '#eab308',
              color: '#000',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Đang gửi đánh giá...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Gửi Đánh Giá Ngay
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
