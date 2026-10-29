import React, { useState, useEffect } from 'react';
import { 
  X, 
  GraduationCap, 
  User, 
  Calendar, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Mail, 
  Phone,
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { bookingApi } from '../services/api';

export default function TutorBookingsModal({ isOpen, onClose, currentUser, onOpenChat }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  useEffect(() => {
    if (!isOpen || !currentUser) return;

    async function fetchBookings() {
      setLoading(true);
      setErrorMsg('');
      try {
        if (currentUser.role === 'TUTOR') {
          const res = await bookingApi.getTutorBookings();
          setBookings(res || []);
        } else {
          // Nếu là học viên mở xem đơn đã đặt
          const res = await bookingApi.getMyBookings();
          setBookings(res || []);
        }
      } catch (err) {
        console.warn('Lỗi lấy danh sách booking:', err);
        setErrorMsg('Không thể tải danh sách đơn đặt lịch: ' + (err.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }

    fetchBookings();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const isTutor = currentUser?.role === 'TUTOR';
  const totalRevenue = bookings.reduce((sum, b) => sum + (isTutor ? (b.tutorIncome || 0) : (b.totalPrice || 0)), 0);

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
              {isTutor ? 'Trung tâm Gia sư EduTutor' : 'Lịch học cá nhân'}
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              {isTutor 
                ? '📋 Yêu cầu đặt lịch thuê Gia sư 1-1' 
                : '🎓 Đơn thuê Gia sư 1-1 của tôi'}
            </h2>
            <p className="detail-sub">
              {isTutor 
                ? `Danh sách các yêu cầu học viên đăng ký học kèm 1-1 với gia sư ${currentUser?.displayName || 'user001'}`
                : `Theo dõi tiến độ các gói gia sư bạn đã đặt lịch`}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>TỔNG SỐ YÊU CẦU</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1d1f', marginTop: 4 }}>
                {bookings.length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>CHỜ THANH TOÁN / XÁC NHẬN</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b4690e', marginTop: 4 }}>
                {bookings.filter(b => b.status === 'PENDING_PAYMENT' || b.status === 'PENDING').length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>
                {isTutor ? 'THU NHẬP DỰ KIẾN' : 'TỔNG HỌC PHÍ'}
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0d6832', marginTop: 4 }}>
                {formatVND(totalRevenue)}
              </div>
            </div>
          </div>

          {/* List of bookings */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Đang tải danh sách đặt lịch từ hệ thống...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f7f9fa', borderRadius: 8 }}>
              <GraduationCap size={48} color="#8c8c8c" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#1c1d1f', marginBottom: 6 }}>Chưa có yêu cầu đặt lịch nào</h4>
              <p style={{ color: '#6a6f73', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto' }}>
                {isTutor 
                  ? 'Hiện tại chưa có học viên nào gửi yêu cầu thuê gia sư. Khi có học viên đăng ký, thông báo và thông tin chi tiết sẽ xuất hiện tại đây.'
                  : 'Bạn chưa đặt lịch với gia sư nào. Hãy chọn một gia sư phù hợp trên trang chủ và bấm Đặt lịch.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((booking) => (
                <div 
                  key={booking.id}
                  style={{
                    border: '1px solid #e4e8eb',
                    borderRadius: 8,
                    padding: 20,
                    background: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Top Bar of Card */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: '0.82rem', fontFamily: 'monospace', background: '#f2f3f5', padding: '3px 8px', borderRadius: 4, color: '#444' }}>
                        #{booking.id.substring(0, 8)}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: '#6a6f73' }}>
                        {new Date(booking.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    <div>
                      {booking.status === 'PENDING_PAYMENT' ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          ⏳ Chờ thanh toán / Ký quỹ
                        </span>
                      ) : (
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                          ✓ {booking.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                        {isTutor ? 'Học viên đăng ký:' : 'Gia sư hướng dẫn:'}
                      </span>
                      <strong style={{ fontSize: '1rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <User size={16} color="#a435f0" />
                        {isTutor 
                          ? (booking.studentName || 'Học viên (ID: ' + booking.studentId.substring(0, 8) + '...)')
                          : 'Gia sư user001'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                        Gói dịch vụ thuê kèm:
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <BookOpen size={16} color="#0d6832" />
                        {booking.packageName || 'Gói gia sư 1-1 trực tuyến'}
                      </strong>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                        {isTutor ? 'Thu nhập thực nhận:' : 'Tổng chi phí:'}
                      </span>
                      <strong style={{ fontSize: '1.15rem', color: '#a435f0', fontFamily: 'Outfit, sans-serif' }}>
                        {formatVND(isTutor ? booking.tutorIncome : booking.totalPrice)}
                      </strong>
                      {isTutor && (
                        <div style={{ fontSize: '0.75rem', color: '#6a6f73' }}>
                          (Học phí gốc: {formatVND(booking.totalPrice)} - Phí sàn: {formatVND(booking.platformFee)})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Note */}
                  <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#0d6832' }}>
                      <ShieldCheck size={16} />
                      <span>Quỹ học phí được EduTutor bảo đảm thanh toán 100%</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn btn-outline" 
                        style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                        onClick={() => alert(`Thông tin đơn #${booking.id}:\n- Học viên: ${booking.studentName || 'Ngô Minh Quang'}\n- Gói học: ${booking.packageName}\n- Trạng thái: ${booking.status}`)}
                      >
                        Chi tiết đơn
                      </button>

                      {isTutor && (
                        <button 
                          className="btn btn-primary" 
                          style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                          onClick={() => {
                            onClose();
                            if (onOpenChat) onOpenChat({ id: booking.studentId, displayName: booking.studentName });
                          }}
                        >
                          💬 Nhắn tin học viên
                        </button>
                      )}
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

