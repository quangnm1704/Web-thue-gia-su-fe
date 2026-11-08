import React, { useState, useEffect } from 'react';
import { Star, RefreshCw, Loader2, Trash2, Search, Filter } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterRating, setFilterRating] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi tải đánh giá admin:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA / GỠ đánh giá này khỏi hệ thống? Điểm trung bình của gia sư sẽ được tự động tính toán lại.')) {
      return;
    }
    setProcessingId(reviewId);
    try {
      await adminApi.deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
    } catch (err) {
      alert('Lỗi khi xóa đánh giá: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const filteredReviews = reviews.filter(r => {
    const matchesRating = filterRating === 'ALL' || r.rating === Number(filterRating);
    const kw = searchKeyword.toLowerCase().trim();
    const matchesSearch = !kw ||
      (r.reviewerName || '').toLowerCase().includes(kw) ||
      (r.tutorName || '').toLowerCase().includes(kw) ||
      (r.comment || '').toLowerCase().includes(kw) ||
      (r.bookingId || '').toLowerCase().includes(kw) ||
      (r.enrollmentId || '').toLowerCase().includes(kw);
    return matchesRating && matchesSearch;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Star size={24} color="#eab308" />
            Quản Lý Đánh Giá & Phản Hồi (CN06.09)
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Kiểm duyệt nhận xét, xếp hạng sao của học viên đối với Gia sư và Khóa học; xử lý gỡ bỏ đánh giá vi phạm.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới ({reviews.length})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 14, marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ width: 200 }}>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="ALL">-- Tất cả số sao --</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
            <option value="4">⭐⭐⭐⭐ (4 sao)</option>
            <option value="3">⭐⭐⭐ (3 sao)</option>
            <option value="2">⭐⭐ (2 sao)</option>
            <option value="1">⭐ (1 sao)</option>
          </select>
        </div>

        <div style={{ flex: '1 1 250px', position: 'relative' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Tìm theo tên học viên, gia sư, hoặc nội dung nhận xét..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải danh sách đánh giá...</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
          <Star size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>Không có đánh giá nào phù hợp</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
            Chưa có phản hồi nào được ghi nhận hoặc không khớp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Học viên đánh giá</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Gia sư nhận</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Xếp hạng</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Nội dung nhận xét</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Thời gian</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map(rev => (
                <tr key={rev.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{rev.reviewerName || 'Học viên'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {rev.reviewerId?.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#7c3aed' }}>{rev.tutorName || 'Gia sư'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {rev.tutorId?.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= (rev.rating || 5) ? '#eab308' : '#e2e8f0'}
                          color={star <= (rev.rating || 5) ? '#eab308' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', maxWidth: 350 }}>
                    <div style={{ color: '#334155', fontStyle: rev.comment ? 'normal' : 'italic' }}>
                      {rev.comment || 'Không có nhận xét văn bản'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>
                      {rev.bookingId ? `Booking kèm riêng: #${rev.bookingId.slice(0, 8)}` : `Khóa học: #${rev.enrollmentId?.slice(0, 8)}`}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.82rem' }}>
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      disabled={processingId === rev.id}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '5px 10px',
                        borderRadius: 6,
                        border: '1px solid #fca5a5',
                        backgroundColor: '#fee2e2',
                        color: '#b91c1c',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        cursor: 'pointer'
                      }}
                      title="Gỡ đánh giá vi phạm quy chuẩn"
                    >
                      {processingId === rev.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      <span>Gỡ đánh giá</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
