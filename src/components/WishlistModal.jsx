import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  ShoppingCart, 
  BookOpen, 
  Loader2, 
  ArrowRight
} from 'lucide-react';

export default function WishlistModal({ 
  isOpen, 
  onClose, 
  wishlistItems = [], 
  onRemoveItem, 
  onAddToCart,
  onSelectCourse,
  courses = []
}) {
  const [movingId, setMovingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  if (!isOpen) return null;

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getCourseThumbnail = (courseId) => {
    const found = courses.find(c => c.id === courseId);
    return found?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80';
  };

  const handleMoveToCart = async (item) => {
    setMovingId(item.courseId);
    try {
      const found = courses.find(c => c.id === item.courseId);
      if (found && onAddToCart) {
        await onAddToCart(found);
      }
    } finally {
      setMovingId(null);
    }
  };

  const handleRemove = async (courseId) => {
    setRemovingId(courseId);
    try {
      await onRemoveItem(courseId);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller" style={{ background: '#fdf2f8', color: '#db2777', border: '1px solid #fbcfe8' }}>
              <Heart size={13} fill="#db2777" style={{ display: 'inline', marginRight: 4 }} /> Khóa học yêu thích
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              Danh sách yêu thích của bạn ({wishlistItems.length} khóa học)
            </h2>
            <p className="detail-sub">
              Lưu giữ các khóa học bạn quan tâm để dễ dàng theo dõi và đăng ký sau này.
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f7f9fa', borderRadius: 8 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fdf2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#db2777' }}>
                <Heart size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1d1f', marginBottom: 8 }}>
                Danh sách yêu thích đang trống
              </h3>
              <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 440, margin: '0 auto 24px' }}>
                Bấm vào biểu tượng trái tim trên các thẻ khóa học để lưu lại những khóa học bạn yêu thích.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  onClose();
                  document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ padding: '12px 28px' }}
              >
                Khám phá khóa học ngay
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {wishlistItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e4e8eb',
                    borderRadius: 8,
                    padding: '14px 18px',
                    background: '#ffffff',
                    gap: 16,
                    flexWrap: 'wrap',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                    <img 
                      src={getCourseThumbnail(item.courseId)} 
                      alt={item.courseTitle}
                      style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                    />
                    <div>
                      <h4 
                        style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1c1d1f', cursor: 'pointer', lineHeight: 1.35 }}
                        onClick={() => {
                          const found = courses.find(c => c.id === item.courseId);
                          if (found && onSelectCourse) {
                            onClose();
                            onSelectCourse(found);
                          }
                        }}
                      >
                        {item.courseTitle}
                      </h4>
                      <div style={{ fontSize: '0.82rem', color: '#6a6f73', marginTop: 4 }}>
                        Giảng viên: <strong>{item.tutorName || 'Gia sư EduTutor'}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                      {formatVND(item.price)}
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handleMoveToCart(item)}
                        disabled={movingId === item.courseId}
                        style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.88rem' }}
                      >
                        {movingId === item.courseId ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ShoppingCart size={16} />
                        )}
                        Thêm vào giỏ
                      </button>

                      <button 
                        onClick={() => handleRemove(item.courseId)}
                        disabled={removingId === item.courseId}
                        title="Xóa khỏi danh sách yêu thích"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#b32d0f',
                          cursor: 'pointer',
                          padding: 8,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#fef2f2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        {removingId === item.courseId ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

