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
  ShieldCheck,
  CreditCard,
  Check,
  Video,
  Sparkles
} from 'lucide-react';
import { bookingApi } from '../services/api';

export default function TutorBookingsModal({
  isOpen,
  onClose,
  currentUser,
  onOpenChat,
  onOpenCheckout,
  onWalletUpdated
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      if (currentUser.role === 'TUTOR') {
        const res = await bookingApi.getTutorBookings();
        setBookings(res || []);
      } else {
        const res = await bookingApi.getMyBookings();
        setBookings(res || []);
      }
    } catch (err) {
      console.warn('Lỗi lấy danh sách booking:', err);
      setErrorMsg('Không thể tải danh sách đơn đặt lịch: ' + (err.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser) {
      setSuccessMsg('');
      fetchBookings();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const isTutor = currentUser?.role === 'TUTOR';
  const totalRevenue = bookings.reduce((sum, b) => sum + (isTutor ? (b.tutorIncome || 0) : (b.totalPrice || 0)), 0);

  // Student completes booking and releases escrow
  const handleCompleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xác nhận hoàn thành dịch vụ gia sư và giải ngân học phí ký quỹ cho gia sư?')) {
      return;
    }

    setCompletingId(bookingId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingApi.completeBooking(bookingId);
      setSuccessMsg('Đã hoàn tất lịch học & giải ngân học phí thành công cho gia sư!');
      await fetchBookings();
      if (onWalletUpdated) onWalletUpdated();
    } catch (err) {
      console.error('Lỗi khi hoàn thành booking:', err);
      setErrorMsg('Không thể hoàn thành đơn: ' + (err.data?.message || err.message));
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 880, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">
              {isTutor ? 'Trung tâm Quản lý Gia sư' : 'Lịch học 1-1 Cá nhân'}
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              {isTutor
                ? '📋 Yêu cầu đặt lịch thuê Gia sư 1-1'
                : '📅 Đơn thuê Gia sư 1-1 của tôi'}
            </h2>
            <p className="detail-sub">
              {isTutor
                ? `Danh sách các học viên đã đặt lịch kèm với bạn. Tiền ký quỹ được giữ an toàn trên hệ thống.`
                : `Theo dõi tiến độ, thanh toán ký quỹ và giải ngân học phí cho gia sư sau khi hoàn tất.`}
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#16a34a" /> <span>{successMsg}</span>
            </div>
          )}

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>TỔNG SỐ ĐƠN ĐẶT</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1d1f', marginTop: 4 }}>
                {bookings.length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>CHỜ THANH TOÁN / KÝ QUỸ</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b4690e', marginTop: 4 }}>
                {bookings.filter(b => b.status === 'PENDING_PAYMENT').length}
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
                  ? 'Hiện tại chưa có học viên nào gửi yêu cầu thuê gia sư. Khi có học viên đăng ký, thông báo sẽ xuất hiện tại đây.'
                  : 'Bạn chưa đặt lịch với gia sư nào. Hãy tìm gia sư phù hợp và nhắn tin thỏa thuận lịch học.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((booking) => {
                const isPendingPayment = booking.status === 'PENDING_PAYMENT';
                const isEscrowHeld = booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED';
                const isCompleted = booking.status === 'COMPLETED';
                const isOption1 = booking.packageName?.includes('Môi Giới') ||
                  booking.platformFeePercent === 100 ||
                  (booking.totalPrice <= 300000 && booking.platformFee === booking.totalPrice);

                return (
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
                        {isOption1 ? (
                          <span style={{ background: '#fdf4ff', color: '#86198f', border: '1px solid #f0abfc', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                            🎯 OPTION 1: MÔI GIỚI NGOÀI
                          </span>
                        ) : (
                          <span style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #93c5fd', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                            💻 OPTION 2: TRỰC TUYẾN 1-1
                          </span>
                        )}
                      </div>

                      <div>
                        {isPendingPayment && (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            {isOption1 ? '⏳ Chờ thanh toán phí môi giới' : '⏳ Chờ thanh toán ký quỹ'}
                          </span>
                        )}
                        {isEscrowHeld && (
                            <span style={{ background: isOption1 ? '#f0fdf4' : '#dbeafe', color: isOption1 ? '#15803d' : '#1e40af', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                              {isOption1 ? '✅ Đã mở khóa liên hệ' : '🔒 Đã ký quỹ (Đang học)'}
                            </span>
                        )}
                            {isCompleted && (
                              <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                                ✅ Hoàn tất & Đã giải ngân
                              </span>
                            )}
                            {!isPendingPayment && !isEscrowHeld && !isCompleted && (
                              <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                                {booking.status}
                              </span>
                            )}
                          </div>
                    </div>

                      {/* Body Info */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 16 }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isTutor ? 'Học viên liên hệ:' : 'Gia sư hướng dẫn:'}
                          </span>
                          <strong style={{ fontSize: '1rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <User size={16} color="#a435f0" />
                            {isTutor
                              ? (booking.studentName || 'Học viên #' + booking.studentId.substring(0, 6))
                              : (booking.tutorName || 'Gia sư chuyên môn')}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isOption1 ? 'Gói môi giới kết nối:' : 'Gói dạy kèm trực tuyến:'}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <BookOpen size={16} color="#0d6832" />
                            {booking.packageName || 'Gói dịch vụ gia sư'}
                          </strong>
                        </div>

                        <div>
                          <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                            {isOption1 ? 'Phí dịch vụ môi giới:' : (isTutor ? 'Thu nhập gia sư:' : 'Học phí ký quỹ:')}
                          </span>
                          <strong style={{ fontSize: '1.15rem', color: '#a435f0', fontFamily: 'Outfit, sans-serif' }}>
                            {formatVND(isOption1 ? booking.totalPrice : (isTutor ? booking.tutorIncome : booking.totalPrice))}
                          </strong>
                            { isTutor && !isOption1 && (
                              <div style={{ fontSize: '0.75rem', color: '#6a6f73' }}>
                                (Học phí: {formatVND(booking.totalPrice)} - Phí sàn: {formatVND(booking.platformFee)})
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Unlocked Contact Box for Option 1 */}
                      {isOption1 && !isPendingPayment && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                            <Phone size={14} /> Thông tin liên hệ trực tiếp gia sư đã mở khóa:
                          </div>
                          <div style={{ color: '#14532d' }}>
                            SĐT / Zalo: <strong>0987.654.321</strong> • Email: <strong>{booking.tutorName?.toLowerCase().replace(/\s+/g, '') || 'giasu'}@gmail.com</strong>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 4 }}>
                            💡 Hai bên tự do sắp xếp lịch dạy trực tiếp và tự thỏa thuận học phí ngoài theo mô hình thuần môi giới.
                          </div>
                        </div>
                      )}

                      {/* Actions / Escrow Bar */}
                      <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#0d6832' }}>
                          <ShieldCheck size={16} />
                          <span>
                            {isOption1 ? (
                              isPendingPayment
                                ? 'Cần hoàn tất phí môi giới để mở khóa thông tin liên hệ'
                                : 'Đã hoàn tất kết nối môi giới thành công'
                            ) : (
                              isPendingPayment
                                ? 'Cần hoàn tất thanh toán để ký quỹ và giữ lịch gia sư'
                                : (isEscrowHeld
                                  ? 'Học phí được giữ an toàn trong ví Ký quỹ EduTutor'
                                  : 'Giao dịch hoàn tất thành công')
                            )}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {/* Student action to pay if PENDING_PAYMENT */}
                          {!isTutor && isPendingPayment && onOpenCheckout && (
                            <button
                              className="btn btn-primary"
                              style={{ fontSize: '0.85rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 6 }}
                              onClick={() => {
                                onClose();
                                onOpenCheckout({
                                  type: 'booking',
                                  item: { ...booking, isOption1 },
                                  bookingId: booking.id,
                                  amount: booking.totalPrice
                                });
                              }}
                            >
                              <CreditCard size={15} /> {isOption1 ? 'Thanh toán Phí Môi Giới' : 'Thanh toán Ký quỹ ngay'}
                            </button>
                          )}

                            {/* Option 2: Enter Google Meet */ }
                        {!isOption1 && isEscrowHeld && (
                            <a
                              href="https://meet.google.com/edututor-1on1-booking"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline"
                              style={{
                                fontSize: '0.85rem',
                                padding: '7px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                color: '#1a73e8',
                                borderColor: '#1a73e8'
                              }}
                            >
                              <Video size={15} /> Vào Google Meet 1-1
                            </a>
                          )}

                          {/* Student action to complete & release escrow (Option 2 only) */}
                          {!isTutor && !isOption1 && isEscrowHeld && (
                            <button
                              className="btn btn-primary"
                              style={{
                                fontSize: '0.85rem',
                                padding: '7px 16px',
                                backgroundColor: '#16a34a',
                                borderColor: '#16a34a',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6
                              }}
                              onClick={() => handleCompleteBooking(booking.id)}
                              disabled={completingId === booking.id}
                            >
                              {completingId === booking.id ? (
                                <>
                                  <Loader2 size={14} className="animate-spin" /> Đang giải ngân...
                                </>
                              ) : (
                                <>
                                  <Check size={15} /> Xác nhận hoàn tất & Giải ngân
                                </>
                              )}
                            </button>
                          )}

                          {isTutor && (
                            <button
                              className="btn btn-outline"
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
                    );
              })}
                  </div>
                )
              }
        </div>
      </div>
      </div>
      );
}
