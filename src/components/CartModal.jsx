import React, { useState } from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onRemoveItem, 
  onClearCart, 
  onCheckout,
  onSelectCourse,
  courses = []
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  if (!isOpen) return null;

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalOriginalPrice = Math.round(totalPrice * 1.5); // Ưu đãi giảm giá 33%

  const handleCheckoutClick = async () => {
    if (cartItems.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      await onCheckout();
      onClose();
    } catch (err) {
      console.error('Lỗi thanh toán giỏ hàng:', err);
    } finally {
      setIsCheckingOut(false);
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

  // Tìm thông tin chi tiết khóa học (như ảnh thumbnail)
  const getCourseThumbnail = (courseId) => {
    const found = courses.find(c => c.id === courseId);
    return found?.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=300&q=80';
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
            <span className="badge badge-bestseller">
              <ShoppingCart size={13} style={{ display: 'inline', marginRight: 4 }} /> Giỏ hàng khóa học
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              Giỏ hàng của bạn ({cartItems.length} khóa học)
            </h2>
            <p className="detail-sub">
              Dữ liệu giỏ hàng được đồng bộ và lưu trữ trực tiếp trong CSDL PostgreSQL.
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f7f9fa', borderRadius: 8 }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f2f3f5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#6a6f73' }}>
                <ShoppingCart size={36} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1c1d1f', marginBottom: 8 }}>
                Giỏ hàng của bạn đang trống
              </h3>
              <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 440, margin: '0 auto 24px' }}>
                Khám phá các khóa học trực tuyến chất lượng cao và thêm vào giỏ hàng để bắt đầu hành trình học tập.
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
            <div>
              {/* Promotion Notice */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fcf8ff', border: '1px solid #d1a8f9', borderRadius: 8, padding: '12px 18px', marginBottom: 20, color: '#6b149b', fontSize: '0.9rem' }}>
                <Sparkles size={18} />
                <span>Bạn đang được áp dụng ưu đãi giảm giá trực tiếp từ hệ thống EduTutor!</span>
              </div>

              {/* Course Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                {cartItems.map((item) => (
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

                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                          {formatVND(item.price)}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#8c8c8c', textDecoration: 'line-through' }}>
                          {formatVND(Math.round(item.price * 1.5))}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.courseId)}
                        disabled={removingId === item.courseId}
                        title="Xóa khóa học này khỏi giỏ hàng"
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
                ))}
              </div>

              {/* Order Summary Box */}
              <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.95rem', color: '#6a6f73' }}>Tạm tính ({cartItems.length} khóa học):</span>
                  <span style={{ fontSize: '1.05rem', color: '#6a6f73', textDecoration: 'line-through' }}>
                    {formatVND(totalOriginalPrice)}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1c1d1f' }}>Tổng thanh toán:</span>
                    <div style={{ fontSize: '0.8rem', color: '#0d6832', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <CheckCircle2 size={14} /> Tiết kiệm {formatVND(totalOriginalPrice - totalPrice)} (33%)
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a435f0', fontFamily: 'Outfit, sans-serif' }}>
                    {formatVND(totalPrice)}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem', color: '#0d6832', marginBottom: 20 }}>
                  <ShieldCheck size={18} />
                  <span>Bảo đảm hoàn tiền 100% trong 7 ngày nếu không hài lòng với chất lượng bài giảng.</span>
                </div>

                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <button 
                    className="btn btn-primary btn-lg"
                    onClick={handleCheckoutClick}
                    disabled={isCheckingOut}
                    style={{ flex: 1, minWidth: 200, padding: '14px 24px', fontSize: '1rem', fontWeight: 700 }}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 8 }} />
                        Đang tiến hành đăng ký...
                      </>
                    ) : (
                      <>
                        Thanh toán & Ghi danh tất cả <ArrowRight size={18} style={{ display: 'inline', marginLeft: 6 }} />
                      </>
                    )}
                  </button>

                  <button 
                    className="btn btn-outline"
                    onClick={onClearCart}
                    disabled={isCheckingOut}
                    style={{ padding: '14px 20px', fontSize: '0.9rem', color: '#6a6f73' }}
                  >
                    Xóa sạch giỏ
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

