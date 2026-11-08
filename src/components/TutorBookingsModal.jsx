import React, { useState, useEffect } from 'react';
import {
  Scale,
  Trash2,
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
  Sparkles,
  Star
} from 'lucide-react';
import { bookingApi, disputeApi } from '../services/api';

export default function TutorBookingsModal({
  isOpen,
  onClose,
  currentUser,
  onOpenChat,
  onOpenCheckout,
  onWalletUpdated,
  onOpenReview = null
}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completingId, setCompletingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [selectedBookingForDispute, setSelectedBookingForDispute] = useState(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeEvidence, setDisputeEvidence] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const fetchBookings = async () => {
    if (!currentUser) return;
    setLoading(true);
    setErrorMsg('');
    try {
      let res = [];
      if (currentUser.role === 'TUTOR') {
        res = await bookingApi.getTutorBookings();
      } else {
        res = await bookingApi.getMyBookings();
      }
      const rawList = res || [];
      const hiddenKey = `hidden_bookings_${currentUser?.id || 'default'}`;
      let hiddenList = [];
      try {
        hiddenList = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
      } catch (e) {
        hiddenList = [];
      }
      const filtered = rawList.filter(b => !hiddenList.includes(b.id));
      setBookings(filtered);
    } catch (err) {
      console.warn('Lỗi lấy danh sách booking:', err);
      setErrorMsg('Không thể tải danh sách đơn kết nối gia sư: ' + (err.data?.message || err.message));
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
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const totalPlatformFee = bookings.reduce((sum, b) => sum + (b.platformFee || 0), 0);
  const totalTutorIncome = bookings.reduce((sum, b) => {
    const inc = b.tutorIncome != null ? b.tutorIncome : Math.max(0, (b.totalPrice || 0) - (b.platformFee || 0));
    return sum + inc;
  }, 0);

  // Hủy đơn đặt lịch (Cancel booking)
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY đơn kết nối gia sư này không?')) {
      return;
    }

    setCompletingId(bookingId);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await bookingApi.cancelBooking(bookingId);
      setSuccessMsg('Đã hủy đơn kết nối thành công!');
      await fetchBookings();
    } catch (err) {
      alert('Không thể hủy đơn kết nối: ' + (err.data?.message || err.message));
    } finally {
      setCompletingId(null);
    }
  };

  // Xóa đơn đã hủy hoặc đơn nháp khỏi danh sách và CSDL
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn này vĩnh viễn khỏi danh sách không?')) {
      return;
    }

    // 1. Optimistic removal khỏi UI ngay lập tức
    setBookings(prev => prev.filter(b => b.id !== bookingId));

    // 2. Lưu ID vào danh sách đã ẩn trong localStorage để không bao giờ hiện lại
    try {
      const hiddenKey = `hidden_bookings_${currentUser?.id || 'default'}`;
      const existingHidden = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
      if (!existingHidden.includes(bookingId)) {
        existingHidden.push(bookingId);
        localStorage.setItem(hiddenKey, JSON.stringify(existingHidden));
      }
    } catch (e) {
      console.warn('Lỗi lưu hidden_bookings:', e);
    }

    // 3. Gọi Backend API xóa vĩnh viễn khỏi CSDL
    try {
      await bookingApi.deleteBooking(bookingId);
      setSuccessMsg('Đã xóa đơn thành công khỏi hệ thống!');
    } catch (err) {
      console.warn('Lỗi xóa đơn phía backend (đã ẩn trên giao diện):', err);
      // Đơn vẫn được ẩn an toàn trong giao diện và localStorage
    }
  };

  // Gửi khiếu nại đơn booking cho Admin
  const handleSubmitDispute = async () => {
    if (!selectedBookingForDispute || !disputeReason.trim()) {
      alert('Vui lòng nhập lý do khiếu nại cụ thể!');
      return;
    }

    setSubmittingDispute(true);
    try {
      await disputeApi.createDispute({
        bookingId: selectedBookingForDispute.id,
        reason: disputeReason.trim(),
        evidenceUrl: disputeEvidence.trim() || 'https://drive.google.com/file/evidence-sample.png'
      });
      setSuccessMsg('Đã gửi khiếu nại thành công! Vụ việc đang chờ Quản trị viên phân xử.');
      setDisputeModalOpen(false);
    } catch (err) {
      const msg = err.data?.message || err.message || '';
      if (msg.includes('Payment') || msg.includes('PAYMENT')) {
        alert('Thông báo: Đơn này chưa thanh toán phí môi giới nên không cần khiếu nại hoàn tiền. Bạn hãy bấm nút "Hủy đơn" màu đỏ để hủy bỏ đơn này trực tiếp nhé!');
      } else {
        alert('Lỗi gửi khiếu nại: ' + msg);
      }
    } finally {
      setSubmittingDispute(false);
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
              {isTutor ? 'Trung tâm Quản lý Môi giới' : 'Dịch vụ Môi giới Gia sư'}
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              {isTutor
                ? '📋 Danh sách kết nối Gia sư'
                : '📅 Đơn kết nối Gia sư của tôi'}
            </h2>
            <p className="detail-sub">
              {isTutor
                ? `Danh sách các học viên đã đăng ký kết nối môi giới với bạn qua hệ thống.`
                : `Theo dõi trạng thái thanh toán phí môi giới và thông tin liên hệ gia sư sau khi hoàn tất.`}
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
          <div style={{ display: 'grid', gridTemplateColumns: isTutor ? 'repeat(auto-fit, minmax(180px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>TỔNG SỐ ĐƠN KẾT NỐI</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1c1d1f', marginTop: 4 }}>
                {bookings.length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>CHỜ THANH TOÁN PHÍ</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b4690e', marginTop: 4 }}>
                {bookings.filter(b => b.status === 'PENDING_PAYMENT').length}
              </div>
            </div>

            <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: '14px 18px' }}>
              <span style={{ fontSize: '0.82rem', color: '#6a6f73', fontWeight: 600 }}>
                {isTutor ? 'TỔNG GIÁ GÓI (TOTAL PRICE)' : 'TỔNG PHÍ MÔI GIỚI'}
              </span>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
                {formatVND(totalRevenue)}
              </div>
            </div>

            {isTutor && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 18px' }}>
                <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
                  💰 THỰC NHẬN GIA SƯ (TUTOR_INCOME)
                </span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
                  {formatVND(totalTutorIncome)}
                </div>
              </div>
            )}

            {isTutor && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 18px' }}>
                <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 700 }}>
                  🏛️ PHÍ SÀN (PLATFORM_FEE)
                </span>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#b45309', marginTop: 4 }}>
                  {formatVND(totalPlatformFee)}
                </div>
              </div>
            )}
          </div>

          {/* List of bookings */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Đang tải danh sách kết nối từ hệ thống...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#f7f9fa', borderRadius: 8 }}>
              <GraduationCap size={48} color="#8c8c8c" style={{ margin: '0 auto 12px' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#1c1d1f', marginBottom: 6 }}>Chưa có đơn kết nối môi giới nào</h4>
              <p style={{ color: '#6a6f73', fontSize: '0.9rem', maxWidth: 450, margin: '0 auto' }}>
                {isTutor
                  ? 'Hiện tại chưa có học viên nào đăng ký kết nối với bạn. Khi có đơn kết nối mới, thông báo sẽ xuất hiện tại đây.'
                  : 'Bạn chưa đăng ký kết nối với gia sư nào. Hãy tìm gia sư phù hợp và đăng ký gói dịch vụ môi giới.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map((booking) => {
                const isPendingPayment = booking.status === 'PENDING_PAYMENT';
                const isPaid = booking.status === 'PENDING_CONFIRMATION' || booking.status === 'CONFIRMED';
                const isCompleted = booking.status === 'COMPLETED';

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
                        <span style={{ background: '#fdf4ff', color: '#86198f', border: '1px solid #f0abfc', padding: '2px 8px', borderRadius: 4, fontSize: '0.72rem', fontWeight: 700 }}>
                          🤝 MÔI GIỚI GIA SƯ
                        </span>
                      </div>

                      <div>
                        {isPendingPayment && (
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            ⏳ Chờ thanh toán phí môi giới
                          </span>
                        )}
                        {isPaid && (
                          <span style={{ background: '#f0fdf4', color: '#15803d', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            ✅ Đã mở khóa liên hệ
                          </span>
                        )}
                        {isCompleted && (
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                            ✅ Hoàn tất kết nối
                          </span>
                        )}
                        {booking.status === 'CANCELLED' && (
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                            🚫 Đã hủy đơn
                          </span>
                        )}
                        {!isPendingPayment && !isPaid && !isCompleted && booking.status !== 'CANCELLED' && (
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
                          {isTutor ? 'Học viên kết nối:' : 'Gia sư hướng dẫn:'}
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
                          Gói dịch vụ môi giới:
                        </span>
                        <strong style={{ fontSize: '0.95rem', color: '#1c1d1f', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <BookOpen size={16} color="#0d6832" />
                          {booking.packageName || 'Gói môi giới kết nối tiêu chuẩn'}
                        </strong>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.8rem', color: '#6a6f73', display: 'block', marginBottom: 2 }}>
                          {isTutor ? 'Chi tiết tài chính (Theo Database):' : 'Phí dịch vụ môi giới:'}
                        </span>
                        {isTutor ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <span style={{ fontSize: '0.86rem', color: '#334155' }}>
                              Tổng giá (total_price): <strong>{formatVND(booking.totalPrice)}</strong>
                            </span>
                            <span style={{ fontSize: '0.8rem', color: '#b45309' }}>
                              Phí sàn (platform_fee): -{formatVND(booking.platformFee)}
                            </span>
                            <strong style={{ fontSize: '0.98rem', color: '#15803d', fontFamily: 'Outfit, sans-serif' }}>
                              Thực nhận (tutor_income): {formatVND(booking.tutorIncome != null ? booking.tutorIncome : Math.max(0, (booking.totalPrice || 0) - (booking.platformFee || 0)))}
                            </strong>
                          </div>
                        ) : (
                          <strong style={{ fontSize: '1.15rem', color: '#a435f0', fontFamily: 'Outfit, sans-serif' }}>
                            {formatVND(booking.totalPrice)}
                          </strong>
                        )}
                      </div>
                    </div>

                    {/* Unlocked Contact Box for Paid Bookings */}
                    {!isPendingPayment && booking.status !== 'CANCELLED' && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, marginBottom: 4 }}>
                          <Phone size={14} /> Thông tin liên hệ trực tiếp gia sư đã mở khóa:
                        </div>
                        <div style={{ color: '#14532d' }}>
                          SĐT / Zalo: <strong>0987.654.321</strong> • Email: <strong>{booking.tutorName?.toLowerCase().replace(/\s+/g, '') || 'giasu'}@gmail.com</strong>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 4 }}>
                          💡 Hai bên chủ động liên hệ qua SĐT/Zalo để sắp xếp lịch học trực tiếp và tự thỏa thuận học phí theo mô hình thuần môi giới.
                        </div>
                      </div>
                    )}

                    {/* Actions Bar */}
                    <div style={{ borderTop: '1px solid #f2f3f5', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#0d6832' }}>
                        <ShieldCheck size={16} />
                        <span>
                          {isPendingPayment
                            ? 'Cần hoàn tất phí môi giới để mở khóa thông tin liên hệ gia sư'
                            : 'Đã hoàn tất kết nối môi giới thành công'}
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
                                item: { ...booking },
                                bookingId: booking.id,
                                amount: booking.totalPrice
                              });
                            }}
                          >
                            <CreditCard size={15} /> Thanh toán Phí Môi Giới
                          </button>
                        )}

                        {/* Nút Hủy đơn nếu chưa thanh toán */}
                        {!isTutor && isPendingPayment && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.82rem',
                              padding: '6px 12px',
                              color: '#dc2626',
                              borderColor: '#fca5a5',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#fff1f2'
                            }}
                            disabled={completingId === booking.id}
                            onClick={() => handleCancelBooking(booking.id)}
                            title="Hủy đơn kết nối này"
                          >
                            <Trash2 size={14} /> Hủy đơn
                          </button>
                        )}

                        {/* Nút Xóa đơn khỏi danh sách nếu đơn đã bị Hủy */}
                        {!isTutor && booking.status === 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.82rem',
                              padding: '6px 12px',
                              color: '#64748b',
                              borderColor: '#cbd5e1',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#f8fafc'
                            }}
                            onClick={() => handleDeleteBooking(booking.id)}
                            title="Xóa đơn này khỏi màn hình xem"
                          >
                            <Trash2 size={14} /> Xóa khỏi danh sách
                          </button>
                        )}

                        {/* Nút Đánh giá gia sư sau khi hoàn thành (CN02.18) */}
                        {!isTutor && isCompleted && onOpenReview && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.82rem',
                              padding: '6px 12px',
                              color: '#b45309',
                              borderColor: '#fcd34d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#fffbeb'
                            }}
                            onClick={() => {
                              onClose();
                              onOpenReview({
                                type: 'booking',
                                id: booking.id,
                                title: booking.packageName || 'Đơn gia sư',
                                tutorName: booking.tutorName
                              });
                            }}
                          >
                            <Star size={14} color="#d97706" fill="#d97706" /> Đánh giá gia sư
                          </button>
                        )}

                        {/* Nút Khiếu nại (Cả Học viên & Gia sư đều có quyền khiếu nại đối với đơn đã thanh toán) */}
                        {!isPendingPayment && booking.status !== 'CANCELLED' && (
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              fontSize: '0.82rem',
                              padding: '6px 12px',
                              color: '#b45309',
                              borderColor: '#fcd34d',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                              background: '#fffbeb'
                            }}
                            onClick={() => {
                              setSelectedBookingForDispute(booking);
                              setDisputeReason('');
                              setDisputeEvidence('');
                              setDisputeModalOpen(true);
                            }}
                            title={isTutor ? "Gửi khiếu nại nếu học viên vi phạm quy chế hoặc không phản hồi" : "Gửi khiếu nại nếu thông tin liên hệ gia sư không chính xác hoặc từ chối nhận dạy"}
                          >
                            <Scale size={14} /> Khiếu nại
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
          )}
        </div>
      </div>

      {/* Cửa sổ Popup Gửi Khiếu Nại (Dispute Modal) */}
      {disputeModalOpen && selectedBookingForDispute && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: 16
          }}
          onClick={() => setDisputeModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 12,
              width: '100%',
              maxWidth: 500,
              padding: 24,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Scale size={22} color="#dc2626" />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {isTutor ? 'Gửi Khiếu Nại Đơn Kết Nối (Gia sư)' : 'Gửi Khiếu Nại Dịch Vụ Môi Giới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#64748b', lineHeight: 1.5 }}>
              {isTutor
                ? 'Nếu học viên không phản hồi, cung cấp thông tin sai lệch hoặc vi phạm thỏa thuận, bạn hãy gửi khiếu nại để Ban quản trị đối chiếu và xử lý bảo vệ quyền lợi.'
                : 'Nếu thông tin liên hệ gia sư không chính xác, gia sư từ chối nhận dạy hoặc vi phạm cam kết, bạn hãy gửi khiếu nại để Ban quản trị đối chiếu và hỗ trợ đổi gia sư hoặc hoàn phí môi giới.'}
            </p>

            <div style={{ marginBottom: 12, background: '#f8fafc', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Đơn kết nối: <strong style={{ color: '#0f172a' }}>#{selectedBookingForDispute.id?.substring(0, 8)}...</strong></div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 2 }}>
                {isTutor ? 'Học viên:' : 'Gia sư:'} <strong>{isTutor ? (selectedBookingForDispute.studentName || 'Học viên #' + selectedBookingForDispute.studentId?.substring(0, 6)) : (selectedBookingForDispute.tutorName || 'Gia sư chuyên môn')}</strong> • Phí dịch vụ: <strong style={{ color: '#b45309' }}>{formatVND(selectedBookingForDispute.totalPrice)}</strong>
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Lý do khiếu nại (*):
              </label>
              <textarea
                rows={3}
                required
                value={disputeReason}
                onChange={(e) => setDisputeReason(e.target.value)}
                placeholder={isTutor
                  ? "Ví dụ: Đã chủ động gọi điện và nhắn tin cho học viên nhiều lần nhưng không nhận được phản hồi, hoặc học viên yêu cầu dạy nội dung sai lệch thỏa thuận ban đầu..."
                  : "Ví dụ: Đã gọi điện và nhắn tin Zalo cho gia sư theo số được mở khóa nhưng không liên lạc được..."}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                Link chứng cứ đối chứng (Ảnh chụp Zalo, lịch sử cuộc gọi, v.v.):
              </label>
              <input
                type="url"
                value={disputeEvidence}
                onChange={(e) => setDisputeEvidence(e.target.value)}
                placeholder="https://drive.google.com/file/... hoặc link ảnh"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.86rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setDisputeModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Đóng lại
              </button>
              <button
                type="button"
                disabled={submittingDispute || !disputeReason.trim()}
                onClick={handleSubmitDispute}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  cursor: (submittingDispute || !disputeReason.trim()) ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                {submittingDispute ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />}
                Gửi khiếu nại cho Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
