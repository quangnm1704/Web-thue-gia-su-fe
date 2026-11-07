import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
  Check,
  ChevronRight,
  Loader2,
  Lock,
  Unlock,
  FileText,
  DollarSign,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { conversationApi, brokeragePackageApi, bookingApi } from '../services/api';

export default function BookTutorModal({
  tutor,
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onOpenChat,
  onOpenCheckout
}) {
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isAgreeing, setIsAgreeing] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const defaultBrokeragePackages = [
    {
      id: '33333333-aaaa-bbbb-cccc-000000000010',
      name: '[Gói Môi Giới] Phí Kết Nối Môi Giới Tiêu Chuẩn',
      price: 150000,
      platformFeePercent: 100,
      description: 'Mở khóa ngay SĐT, Zalo và địa chỉ gia sư. Hai bên chủ động liên hệ và sắp xếp lịch học trực tiếp.'
    },
    {
      id: '33333333-aaaa-bbbb-cccc-000000000020',
      name: '[Gói Môi Giới] Phí Kết Nối Môi Giới VIP (Bảo hành đổi gia sư)',
      price: 300000,
      platformFeePercent: 100,
      description: 'Mở khóa liên hệ + Bảo hành đổi gia sư miễn phí trong 30 ngày nếu không phù hợp.'
    }
  ];

  useEffect(() => {
    if (!isOpen || !tutor) {
      setBookingSuccess(null);
      setErrorMsg('');
      setAgreedTerms(false);
      return;
    }

    if (!currentUser) return;

    setAgreedTerms(false);

    async function loadData() {
      setLoading(true);
      setErrorMsg('');
      try {
        // 1. Tạo hoặc lấy hội thoại trực tiếp với gia sư
        let conv = null;
        try {
          conv = await conversationApi.createDirect(tutor.id);
          setConversation(conv);
        } catch (e) {
          console.warn('Lỗi kết nối hội thoại:', e.message);
        }

        // 2. Lấy các gói dịch vụ môi giới của gia sư từ backend
        try {
          const pkgs = await brokeragePackageApi.getPackagesByTutor(tutor.id);
          // Lọc chỉ lấy các gói môi giới kết nối (loại bỏ các gói trực tuyến cũ nếu có)
          const validBrokeragePkgs = (pkgs || []).filter(
            p => !p.name.includes('Trực Tuyến') && !p.name.includes('Meet')
          );

          if (validBrokeragePkgs.length > 0) {
            setPackages(validBrokeragePkgs);
            setSelectedPackage(validBrokeragePkgs[0]);
          } else {
            setPackages(defaultBrokeragePackages);
            setSelectedPackage(defaultBrokeragePackages[0]);
          }
        } catch (e) {
          console.warn('Lỗi tải gói dịch vụ:', e.message);
          setPackages(defaultBrokeragePackages);
          setSelectedPackage(defaultBrokeragePackages[0]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, tutor, currentUser]);

  if (!isOpen || !tutor) return null;

  // Người dùng tick hoặc bỏ tick đồng ý điều khoản
  const handleToggleAgree = async () => {
    if (isAgreeing) return;

    if (!agreedTerms) {
      setIsAgreeing(true);
      setErrorMsg('');
      try {
        if (conversation?.id && conversation.status !== 'AGREED') {
          const updated = await conversationApi.agreeAsStudent(conversation.id);
          setConversation(updated);
        }
        setAgreedTerms(true);
      } catch (err) {
        console.warn('Ghi nhận thỏa thuận:', err.message);
        setAgreedTerms(true);
      } finally {
        setIsAgreeing(false);
      }
    } else {
      setAgreedTerms(false);
    }
  };

  // Tạo Booking môi giới
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Vui lòng tick đồng ý với quy chế dịch vụ môi giới ở Bước 1 trước khi đặt lịch.');
      return;
    }

    if (!selectedPackage?.id) {
      setErrorMsg('Vui lòng chọn một gói dịch vụ môi giới.');
      return;
    }

    setIsBooking(true);
    setErrorMsg('');
    try {
      const res = await bookingApi.createBooking(selectedPackage.id);
      setBookingSuccess(res);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Lỗi đăng ký gói môi giới';
      setErrorMsg('Không thể đăng ký: ' + msg);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">Dịch vụ Môi giới Gia sư</span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              Đăng ký Dịch vụ Môi giới & Kết nối Gia sư cùng {tutor.name}
            </h2>
            <p className="detail-sub">{tutor.title} • {tutor.degree}</p>

            <div className="detail-instructor-author" style={{ marginTop: 12 }}>
              <img src={tutor.avatar} alt={tutor.name} className="author-img" />
              <div>
                <span>Gia sư: <strong>{tutor.name}</strong></span>
                <p className="author-role-sub">⭐ {tutor.rating} ({tutor.reviews || 120} đánh giá) • {tutor.students || 200} học sinh</p>
              </div>
            </div>

            {/* Môn dạy & Lịch rảnh */}
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tutor.subjects && tutor.subjects.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Môn nhận dạy:</span>
                  {tutor.subjects.map((sub, i) => (
                    <span key={i} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: '0.78rem', fontWeight: 600 }}>
                      {sub}
                    </span>
                  ))}
                </div>
              )}
              {tutor.availableSchedule && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#86efac' }}>
                  <Clock size={14} color="#86efac" />
                  <span><strong>Lịch rảnh:</strong> {tutor.availableSchedule}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px 32px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {bookingSuccess ? (
            /* ================= Success State ================= */
            <div style={{ textAlign: 'center', padding: '24px 10px' }} className="animate-fade-in">
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#e6f7f2', color: '#0d6832', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c1d1f', marginBottom: 8 }}>
                Đăng ký Gói Môi Giới Kết Nối Thành Công!
              </h3>
              <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
                Hệ thống đã ghi nhận đơn môi giới kết nối với gia sư <strong>{tutor.name}</strong>. Sau khi hoàn tất thanh toán phí môi giới, bạn có thể liên hệ trực tiếp gia sư qua SĐT/Zalo bên dưới để chủ động trao đổi lịch học và học phí.
              </p>

              {/* Unlocked Contact Box */}
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: 8,
                padding: '16px 20px',
                maxWidth: 520,
                margin: '0 auto 20px',
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 700, marginBottom: 10, fontSize: '0.95rem' }}>
                  <Sparkles size={18} color="#16a34a" /> Thông tin liên hệ trực tiếp của Gia sư {tutor.name}:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Phone size={15} color="#0d6832" />
                    <span>SĐT / Zalo: <strong>0987.654.321</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Mail size={15} color="#0d6832" />
                    <span>Email: <strong>{tutor.name?.toLowerCase().replace(/\s+/g, '')}@gmail.com</strong></span>
                  </div>
                </div>
                <p style={{ margin: '10px 0 0', fontSize: '0.8rem', color: '#15803d' }}>
                  💡 Hai bên tự do sắp xếp địa điểm học (tại nhà hoặc quán café) và tự thỏa thuận học phí trực tiếp mà không qua trung gian.
                </p>
              </div>

              {/* Booking Summary Box */}
              <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: 18, maxWidth: 520, margin: '0 auto 24px', textAlign: 'left', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Mã kết nối:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{bookingSuccess.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Gói dịch vụ môi giới:</span>
                  <strong>{selectedPackage?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Phí dịch vụ môi giới:</span>
                  <strong style={{ color: '#a435f0' }}>{formatVND(bookingSuccess.totalPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6a6f73' }}>Trạng thái:</span>
                  <span className="badge badge-bestseller" style={{ textTransform: 'uppercase' }}>
                    {bookingSuccess.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    if (onOpenCheckout) {
                      onOpenCheckout({
                        type: 'booking',
                        item: { ...selectedPackage, tutor, totalPrice: bookingSuccess.totalPrice },
                        bookingId: bookingSuccess.id,
                        amount: bookingSuccess.totalPrice
                      });
                    }
                  }}
                  style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}
                >
                  <CreditCard size={18} /> Thanh toán Phí Môi Giới ngay
                </button>
                <button className="btn btn-outline" onClick={onClose} style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                  Thanh toán sau
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* ================= BƯỚC 1: Thỏa thuận điều kiện môi giới ================= */}
              <div
                style={{
                  border: agreedTerms ? '2px solid #0d6832' : '1px solid #e4e8eb',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 20,
                  background: agreedTerms ? '#f8fdfb' : '#ffffff',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: agreedTerms ? '#0d6832' : '#2d2f31',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      1
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1c1d1f' }}>
                      Quy chế Dịch vụ Môi giới & Kết nối Gia sư
                    </h4>
                  </div>
                  {agreedTerms ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0d6832', background: '#e6f7f2', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                      <CheckCircle2 size={15} /> Đã đồng ý quy chế
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b4690e', background: '#fef3c7', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600 }}>
                      <AlertCircle size={15} /> Chưa xác nhận quy chế
                    </span>
                  )}
                </div>

                {/* Brokerage Explanation Box */}
                <div style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', borderRadius: 8, padding: 14, marginBottom: 14, fontSize: '0.88rem' }}>
                  <strong style={{ color: '#86198f', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    🎯 Mô hình Thuần Môi Giới Kết Nối:
                  </strong>
                  <div style={{ color: '#701a75', lineHeight: 1.5 }}>
                    • EduTutor là trung gian kiểm định bằng cấp, chuyên môn và giới thiệu gia sư chất lượng cao.<br />
                    • Học sinh chỉ thanh toán <strong>một lần duy nhất phí dịch vụ môi giới kết nối</strong>.<br />
                    • Ngay sau khi thanh toán, hệ thống sẽ mở khóa đầy đủ SĐT, Zalo và Email của gia sư.<br />
                    • Hai bên chủ động hẹn gặp, kiểm tra phương pháp giảng dạy và tự do thỏa thuận lịch học trực tiếp.
                  </div>
                </div>

                {/* Checkbox agree */}
                <div
                  onClick={handleToggleAgree}
                  style={{
                    border: agreedTerms ? '2px solid #0d6832' : '2px dashed #b4690e',
                    background: agreedTerms ? '#f0fdf4' : '#fffbeb',
                    borderRadius: 8,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: agreedTerms ? '0 1px 3px rgba(13, 104, 50, 0.1)' : 'none'
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      cursor: 'pointer',
                      margin: 0,
                      flex: 1,
                      userSelect: 'none'
                    }}
                  >
                    <input
                      type="checkbox"
                      id="agreeTermsCheckbox"
                      checked={agreedTerms}
                      onChange={(e) => { e.stopPropagation(); handleToggleAgree(); }}
                      disabled={isAgreeing}
                      style={{ width: 20, height: 20, accentColor: '#0d6832', cursor: 'pointer', flexShrink: 0 }}
                    />
                    <div>
                      <span style={{ fontSize: '0.93rem', fontWeight: 700, color: agreedTerms ? '#0d6832' : '#92400e', display: 'block' }}>
                        Tôi đã đọc, hiểu rõ và đồng ý với quy chế dịch vụ môi giới kết nối gia sư
                      </span>
                      <span style={{ fontSize: '0.8rem', color: agreedTerms ? '#166534' : '#b45309' }}>
                        {agreedTerms
                          ? '✓ Đã xác nhận quy chế. Bước 2 đã được mở khóa để chọn gói môi giới.'
                          : '👉 Bạn cần tick vào ô này để mở khóa chọn gói dịch vụ ở Bước 2.'}
                      </span>
                    </div>
                  </label>
                  {isAgreeing ? (
                    <Loader2 size={18} className="animate-spin" color="#0d6832" />
                  ) : agreedTerms ? (
                    <Unlock size={18} color="#0d6832" />
                  ) : (
                    <Lock size={18} color="#b4690e" />
                  )}
                </div>

                <div style={{ marginTop: 10, textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={() => { onClose(); if (onOpenChat) onOpenChat(tutor); }}
                    style={{ background: 'none', border: 'none', color: '#a435f0', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    💬 Nhắn tin trao đổi trước với {tutor.name} qua tin nhắn
                  </button>
                </div>
              </div>

              {/* ================= BƯỚC 2: Chọn Gói dịch vụ môi giới ================= */}
              <div
                style={{
                  border: '1px solid #e4e8eb',
                  borderRadius: 8,
                  padding: 20,
                  marginBottom: 20,
                  background: !agreedTerms ? '#f9fafb' : '#ffffff',
                  opacity: !agreedTerms ? 0.45 : 1,
                  pointerEvents: !agreedTerms ? 'none' : 'auto',
                  transition: 'opacity 0.25s ease, filter 0.25s ease',
                  filter: !agreedTerms ? 'grayscale(0.4)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      backgroundColor: agreedTerms ? '#2d2f31' : '#8c8c8c',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700
                    }}>
                      {agreedTerms ? '2' : <Lock size={14} />}
                    </span>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: !agreedTerms ? '#6a6f73' : '#1c1d1f' }}>
                      Chọn Gói Dịch Vụ Môi Giới Kết Nối {!agreedTerms && '(Đang khóa - Yêu cầu hoàn thành Bước 1)'}
                    </h4>
                  </div>
                  {agreedTerms ? (
                    <span style={{ color: '#0d6832', fontSize: '0.8rem', fontWeight: 600 }}>
                      🔓 Đã mở khóa
                    </span>
                  ) : (
                    <span style={{ color: '#b4690e', fontSize: '0.8rem', fontWeight: 600 }}>
                      🔒 Đang khóa
                    </span>
                  )}
                </div>

                {/* Package list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {packages.map((pkg) => (
                    <label
                      key={pkg.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '14px 18px',
                        borderRadius: 6,
                        border: selectedPackage?.id === pkg.id && agreedTerms
                          ? '2px solid #a435f0'
                          : '1px solid #e4e8eb',
                        background: selectedPackage?.id === pkg.id && agreedTerms
                          ? '#fcf8ff'
                          : '#ffffff',
                        cursor: agreedTerms ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <input
                          type="radio"
                          name="brokeragePackage"
                          checked={selectedPackage?.id === pkg.id}
                          onChange={() => agreedTerms && setSelectedPackage(pkg)}
                          disabled={!agreedTerms}
                          style={{ accentColor: '#a435f0', cursor: 'pointer' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#1c1d1f' }}>{pkg.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6a6f73', marginTop: 2 }}>
                            {pkg.description || 'Phí môi giới kết nối gia sư • Mở khóa SĐT/Zalo • Tự do sắp xếp lịch dạy trực tiếp'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                          {formatVND(pkg.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* ================= BƯỚC 3: Tổng kết & Chốt đặt lịch ================= */}
              <div
                style={{
                  background: '#f7f9fa',
                  borderRadius: 8,
                  padding: 20,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 16,
                  border: '1px solid #e4e8eb'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.85rem', color: '#6a6f73' }}>
                    Phí dịch vụ môi giới kết nối:
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                    {formatVND(selectedPackage?.price || 0)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#0d6832' }}>
                    ✓ Thu phí môi giới 1 lần duy nhất • Mở khóa liên hệ gia sư ngay sau khi thanh toán
                  </span>
                </div>

                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !agreedTerms || !selectedPackage}
                  style={{
                    opacity: !agreedTerms ? 0.5 : 1,
                    cursor: !agreedTerms ? 'not-allowed' : 'pointer',
                    backgroundColor: '#a435f0',
                    borderColor: '#a435f0'
                  }}
                  title={!agreedTerms ? 'Bạn cần tick đồng ý quy chế ở Bước 1 trước' : 'Đăng ký gói môi giới'}
                >
                  {isBooking ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                      Đang xử lý đăng ký...
                    </>
                  ) : (
                    'Xác nhận & Đăng ký Gói Môi Giới'
                  )}
                </button>
              </div>

              {!agreedTerms && (
                <p style={{ fontSize: '0.82rem', color: '#b4690e', marginTop: 10, textAlign: 'right', fontWeight: 600 }}>
                  ⚠️ Vui lòng tick chọn "Tôi đã đọc, hiểu rõ và đồng ý..." ở Bước 1 để mở khóa chọn Gói môi giới.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
