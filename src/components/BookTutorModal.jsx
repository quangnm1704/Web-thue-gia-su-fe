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
  Video,
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
  const [allPackages, setAllPackages] = useState([]);
  const [tutoringOption, setTutoringOption] = useState('OPTION_1'); // 'OPTION_1' | 'OPTION_2'
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

  const defaultOption1Packages = [
    {
      id: '33333333-aaaa-bbbb-cccc-000000000010',
      name: '[Gói Môi Giới Ngoài] Phí Kết Nối Môi Giới Tiêu Chuẩn (Hai bên tự dạy ngoài)',
      price: 150000,
      platformFeePercent: 100,
      description: 'Mở khóa ngay SĐT, Zalo và địa chỉ gia sư. Hai bên tự do sắp xếp lịch dạy và học phí ngoài.'
    },
    {
      id: '33333333-aaaa-bbbb-cccc-000000000020',
      name: '[Gói Môi Giới Ngoài] Phí Kết Nối Môi Giới VIP + Bảo Hành Đổi Gia Sư (Tự dạy ngoài)',
      price: 300000,
      platformFeePercent: 100,
      description: 'Mở khóa liên hệ + Bảo hành đổi gia sư miễn phí trong 30 ngày nếu không phù hợp.'
    }
  ];

  const defaultOption2Packages = [
    {
      id: '33333333-aaaa-bbbb-cccc-000000000001',
      name: '[Gói Trực Tuyến 1-1] 3 Buổi Kèm Riêng Qua Google Meet & Ký Quỹ Escrow',
      price: 450000,
      platformFeePercent: 10,
      description: '3 buổi tương tác trực tuyến 1-1 qua Google Meet. Tiền học phí được giữ trong ví ký quỹ EduTutor.'
    },
    {
      id: '33333333-aaaa-bbbb-cccc-000000000002',
      name: '[Gói Trực Tuyến 1-1] 10 Buổi Kèm Chuyên Sâu Qua Google Meet & Ký Quỹ Escrow',
      price: 1400000,
      platformFeePercent: 10,
      description: '10 buổi kèm 1-1 chuyên sâu theo giáo trình cá nhân hóa + Hỗ trợ chữa bài tập 24/7.'
    },
    {
      id: '33333333-aaaa-bbbb-cccc-000000000003',
      name: '[Gói Trực Tuyến 1-1] 20 Buổi Luyện Thi Cấp Tốc Qua Google Meet & Ký Quỹ Escrow',
      price: 2600000,
      platformFeePercent: 10,
      description: '20 buổi luyện thi cấp tốc cam kết mục tiêu điểm số + Đảm bảo hoàn tiền nếu có tranh chấp.'
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

        // 2. Lấy các gói dịch vụ của gia sư từ backend
        try {
          const pkgs = await brokeragePackageApi.getPackagesByTutor(tutor.id);
          if (pkgs && pkgs.length > 0) {
            setAllPackages(pkgs);
            // Default selected package for Option 1
            const opt1 = pkgs.find(p => p.platformFeePercent === 100 || p.name.includes('Môi Giới')) || pkgs[0];
            setSelectedPackage(opt1);
          } else {
            const combined = [...defaultOption1Packages, ...defaultOption2Packages];
            setAllPackages(combined);
            setSelectedPackage(defaultOption1Packages[0]);
          }
        } catch (e) {
          console.warn('Lỗi tải gói dịch vụ:', e.message);
          const combined = [...defaultOption1Packages, ...defaultOption2Packages];
          setAllPackages(combined);
          setSelectedPackage(defaultOption1Packages[0]);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [isOpen, tutor, currentUser]);

  if (!isOpen || !tutor) return null;

  // Filter packages by current option
  const option1Packages = allPackages.filter(p => p.platformFeePercent === 100 || p.name.includes('Môi Giới'));
  const option2Packages = allPackages.filter(p => p.platformFeePercent < 100 || p.name.includes('Trực Tuyến'));

  const currentOptionPackages = tutoringOption === 'OPTION_1'
    ? (option1Packages.length > 0 ? option1Packages : defaultOption1Packages)
    : (option2Packages.length > 0 ? option2Packages : defaultOption2Packages);

  // Switch option tabs
  const handleSelectOptionTab = (option) => {
    setTutoringOption(option);
    const pkgs = option === 'OPTION_1'
      ? (option1Packages.length > 0 ? option1Packages : defaultOption1Packages)
      : (option2Packages.length > 0 ? option2Packages : defaultOption2Packages);
    if (pkgs.length > 0) {
      setSelectedPackage(pkgs[0]);
    }
  };

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

  // Tạo Booking
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Vui lòng tick đồng ý với điều khoản thỏa thuận ở Bước 1 trước khi đặt lịch.');
      return;
    }

    if (!selectedPackage?.id) {
      setErrorMsg('Vui lòng chọn một gói dịch vụ gia sư.');
      return;
    }

    setIsBooking(true);
    setErrorMsg('');
    try {
      const res = await bookingApi.createBooking(selectedPackage.id);
      setBookingSuccess(res);
    } catch (err) {
      const msg = err.data?.message || err.message || 'Lỗi đặt lịch';
      setErrorMsg('Không thể đặt lịch: ' + msg);
    } finally {
      setIsBooking(false);
    }
  };

  const isOption1 = tutoringOption === 'OPTION_1';

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
        <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 860 }} onClick={(e) => e.stopPropagation()}>
          <button className="ud-modal-close" onClick={onClose}>
            <X size={22} />
          </button>

          {/* Modal Header */}
          <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
            <div className="detail-hero-left">
              <span className="badge badge-bestseller">Thuê Gia sư 1-1 Theo Yêu Cầu</span>
              <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
                Đặt lịch thuê Gia sư cùng {tutor.name}
              </h2>
              <p className="detail-sub">{tutor.title} • {tutor.degree}</p>

              <div className="detail-instructor-author" style={{ marginTop: 12 }}>
                <img src={tutor.avatar} alt={tutor.name} className="author-img" />
                <div>
                  <span>Gia sư: <strong>{tutor.name}</strong></span>
                  <p className="author-role-sub">⭐ {tutor.rating} ({tutor.reviews || 120} đánh giá) • {tutor.students || 200} học sinh</p>
                </div>
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
                    {isOption1 ? 'Đăng ký Gói Môi Giới Ngoài Thành Công!' : 'Đặt Lịch Kèm Trực Tuyến 1-1 Thành Công!'}
                  </h3>
                    <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 540, margin: '0 auto 20px', lineHeight: 1.5 }}>
                      {isOption1 ? (
                        <>
                          Hệ thống đã ghi nhận đơn môi giới kết nối với gia sư <strong>{tutor.name}</strong>. Sau khi thanh toán phí môi giới, bạn có thể liên hệ trực tiếp gia sư qua SĐT/Zalo bên dưới để bắt đầu học.
                        </>
                      ) : (
                        <>
                          Đơn đặt lịch trực tuyến đã được ghi nhận. Học phí sẽ được bảo lưu an toàn trong ví <strong>Ký quỹ Escrow</strong> và chỉ giải ngân sau khi bạn hoàn thành buổi học qua Google Meet.
                        </>
                      )}
                    </p>

                      {/* Unlocked Contact Box for Option 1 */}
                      {isOption1 && (
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
                            💡 Hai bên tự do sắp xếp địa điểm học (tại nhà hoặc quán café) và tự thỏa thuận học phí trực tiếp mà không qua sàn.
                          </p>
                        </div>
                      )}

                      {/* Booking Summary Box */}
                      <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: 18, maxWidth: 520, margin: '0 auto 24px', textAlign: 'left', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: '#6a6f73' }}>Mã đặt lịch:</span>
                          <strong style={{ fontFamily: 'monospace' }}>{bookingSuccess.id}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: '#6a6f73' }}>Gói dịch vụ:</span>
                          <strong>{selectedPackage?.name}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ color: '#6a6f73' }}>{isOption1 ? 'Phí môi giới kết nối:' : 'Học phí ký quỹ trực tuyến:'}</span>
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
                                item: { ...selectedPackage, tutor, totalPrice: bookingSuccess.totalPrice, isOption1 },
                                bookingId: bookingSuccess.id,
                                amount: bookingSuccess.totalPrice
                              });
                            }
                          }}
                          style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}
                        >
                          <CreditCard size={18} /> {isOption1 ? 'Thanh toán Phí Môi Giới ngay' : 'Tiến hành Ký Quỹ Học Phí ngay'}
                        </button>
                        <button className="btn btn-outline" onClick={onClose} style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
                          Thanh toán sau
                        </button>
                      </div>
                    </div>
                    ) : (
                    <div>
                      {/* ================= BƯỚC 1: Thỏa thuận điều kiện ================= */}
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
                              Thương lượng & Thỏa thuận quy chế thuê gia sư (2 Options)
                            </h4>
                          </div>
                          {agreedTerms ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#0d6832', background: '#e6f7f2', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 700 }}>
                              <CheckCircle2 size={15} /> Đã đồng ý điều khoản
                            </span>
                          ) : (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#b4690e', background: '#fef3c7', padding: '4px 12px', borderRadius: 100, fontSize: '0.8rem', fontWeight: 600 }}>
                              <AlertCircle size={15} /> Chưa xác nhận điều khoản
                            </span>
                          )}
                        </div>

                            {/* 2 Models comparison box */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, marginBottom: 14 }}>
                              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: 12, fontSize: '0.85rem' }}>
                                <strong style={{ color: '#92400e', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                  🎯 Option 1: Môi Giới Tự Do (Tự dạy ngoài)
                                </strong>
                                <div style={{ color: '#78350f', lineHeight: 1.45 }}>
                                  • Trung tâm chỉ thu phí kết nối môi giới ban đầu.<br />
                                  • Mở khóa đầy đủ SĐT, Zalo của Gia sư.<br />
                                  • Hai bên tự do sắp xếp lịch dạy và học phí ngoài.
                                </div>
                              </div>

                                <div style={{ background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 8, padding: 12, fontSize: '0.85rem' }}>
                                  <strong style={{ color: '#1e40af', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                    💻 Option 2: Trọn Gói Trực Tuyến (Google Meet & Ký Quỹ)
                                  </strong>
                                  <div style={{ color: '#1e3a8a', lineHeight: 1.45 }}>
                                    • Cung cấp phòng học trực tuyến 1-1 qua Google Meet.<br />
                                    • Học phí được giữ an toàn trong ví Ký quỹ Escrow.<br />
                                    • Chỉ giải ngân cho gia sư sau khi học sinh xác nhận xong.
                                  </div>
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
                                      Tôi đã đọc, hiểu rõ và đồng ý với quy chế thuê gia sư theo 2 Options ở trên
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: agreedTerms ? '#166534' : '#b45309' }}>
                                      {agreedTerms
                                      ? '✓ Đã xác nhận thỏa thuận. Bước 2 đã được mở khóa để chọn hình thức và gói dịch vụ.' 
                          : '👉 Bạn cần tick vào ô này để mở khóa chọn Option và gói dịch vụ ở Bước 2.'}
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

                            {/* ================= BƯỚC 2: Chọn Option & Gói dịch vụ ================= */}
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
                                    Chọn hình thức học & Gói dịch vụ {!agreedTerms && '(Đang khóa - Yêu cầu hoàn thành Bước 1)'}
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

                              {/* Option Tabs Switcher */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectOptionTab('OPTION_1')}
                                  disabled={!agreedTerms}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: 8,
                                    border: tutoringOption === 'OPTION_1' ? '2px solid #a435f0' : '1px solid #d1d5db',
                                    background: tutoringOption === 'OPTION_1' ? '#fcf8ff' : '#ffffff',
                                    cursor: agreedTerms ? 'pointer' : 'not-allowed',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: tutoringOption === 'OPTION_1' ? '#a435f0' : '#f3f4f6',
                                    color: tutoringOption === 'OPTION_1' ? '#fff' : '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <Users size={18} />
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.92rem', color: tutoringOption === 'OPTION_1' ? '#a435f0' : '#1c1d1f', display: 'block' }}>
                                      Option 1: Môi Giới Ngoài
                                    </strong>
                                    <span style={{ fontSize: '0.75rem', color: '#6a6f73' }}>
                                      Thu phí môi giới • Tự do dạy ngoài
                                    </span>
                                  </div>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleSelectOptionTab('OPTION_2')}
                                  disabled={!agreedTerms}
                                  style={{
                                    padding: '12px 14px',
                                    borderRadius: 8,
                                    border: tutoringOption === 'OPTION_2' ? '2px solid #2563eb' : '1px solid #d1d5db',
                                    background: tutoringOption === 'OPTION_2' ? '#eff6ff' : '#ffffff',
                                    cursor: agreedTerms ? 'pointer' : 'not-allowed',
                                    textAlign: 'left',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    transition: 'all 0.2s'
                                  }}
                                >
                                  <div style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    background: tutoringOption === 'OPTION_2' ? '#2563eb' : '#f3f4f6',
                                    color: tutoringOption === 'OPTION_2' ? '#fff' : '#6b7280',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}>
                                    <Video size={18} />
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '0.92rem', color: tutoringOption === 'OPTION_2' ? '#2563eb' : '#1c1d1f', display: 'block' }}>
                                      Option 2: Trực Tuyến 1-1
                                    </strong>
                                    <span style={{ fontSize: '0.75rem', color: '#6a6f73' }}>
                                      Qua Google Meet & Ký Quỹ Escrow
                                    </span>
                                  </div>
                                </button>
                              </div>

                              {/* Subtitle description for the active option */}
                              <div style={{ background: isOption1 ? '#fdf4ff' : '#eff6ff', border: isOption1 ? '1px solid #f5d0fe' : '1px solid #bfdbfe', borderRadius: 6, padding: '10px 14px', marginBottom: 14, fontSize: '0.82rem', color: isOption1 ? '#701a75' : '#1e40af' }}>
                                {isOption1 ? (
                                  <>
                                    💡 <strong>Mô hình Môi giới:</strong> Bạn chỉ cần thanh toán một lần phí dịch vụ kết nối (150.000đ - 300.000đ). Sau đó toàn bộ SĐT/Zalo của gia sư sẽ được mở khóa để hai bên tự do sắp xếp lịch dạy trực tiếp và tự thỏa thuận học phí ngoài mà không bị khấu trừ thêm.
                                  </>
                                ) : (
                                  <>
                                    🛡️ <strong>Mô hình Trực tuyến Ký Quỹ:</strong> EduTutor đồng hành trọn gói: tạo link Google Meet 1-1 cho mỗi buổi học, giữ học phí an toàn trong ví Ký quỹ và chỉ thanh toán cho gia sư sau khi bạn xác nhận hoàn thành buổi học.
                                  </>
                                )}
                              </div>

                              {/* Package list */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  {
                                    currentOptionPackages.map((pkg) => (
                                      <label
                                        key={pkg.id}
                                        style={{
                                          display: 'flex',
                                          justifyContent: 'space-between',
                                          alignItems: 'center',
                                          padding: '14px 18px',
                                          borderRadius: 6,
                                          border: selectedPackage?.id === pkg.id && agreedTerms
                                            ? (isOption1 ? '2px solid #a435f0' : '2px solid #2563eb')
                                            : '1px solid #e4e8eb',
                                          background: selectedPackage?.id === pkg.id && agreedTerms
                                            ? (isOption1 ? '#fcf8ff' : '#eff6ff')
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
                                            style={{ accentColor: isOption1 ? '#a435f0' : '#2563eb', cursor: 'pointer' }}
                                          />
                                          <div>
                                            <strong style={{ fontSize: '0.95rem', color: '#1c1d1f' }}>{pkg.name}</strong>
                                            <div style={{ fontSize: '0.8rem', color: '#6a6f73', marginTop: 2 }}>
                                              {pkg.description || (isOption1
                                                ? 'Phí môi giới kết nối gia sư • Mở khóa SĐT/Zalo • Tự dạy ngoài'
                                                : 'Kèm 1-1 qua Google Meet • Ký quỹ Escrow bảo đảm an toàn 100%')}
                                            </div>
                                          </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                                              {formatVND(pkg.price)}
                                            </span>
                                        </div>
                                      </label>
                                    ))
                                  }
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
                                  {isOption1 ? 'Phí dịch vụ kết nối môi giới:' : 'Tổng học phí ký quỹ trực tuyến:'}
                                </span>
                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                                  {formatVND(selectedPackage?.price || 0)}
                                </div>
                                <span style={{ fontSize: '0.78rem', color: '#0d6832' }}>
                                  {isOption1
                                    ? '✓ Thu phí môi giới 1 lần duy nhất • Mở khóa liên hệ gia sư ngay sau khi thanh toán'
                                    : '✓ Được bảo vệ 100% trong ví Ký quỹ Escrow • Giải ngân sau khi học xong'}
                                </span>
                              </div>

                              <button
                                className="btn btn-primary btn-lg"
                                onClick={handleConfirmBooking}
                                disabled={isBooking || !agreedTerms || !selectedPackage}
                                style={{
                                  opacity: !agreedTerms ? 0.5 : 1,
                    cursor: !agreedTerms ? 'not-allowed' : 'pointer',
                                  backgroundColor: isOption1 ? '#a435f0' : '#2563eb',
                                  borderColor: isOption1 ? '#a435f0' : '#2563eb'
                                }}
                                title={!agreedTerms ? 'Bạn cần tick đồng ý điều khoản ở Bước 1 trước' : 'Chốt đặt lịch'}
                              >
                                {isBooking ? (
                                  <>
                                    <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                                    Đang xử lý đặt lịch...
                                  </>
                                ) : (
                    isOption1 ? 'Xác nhận & Đăng ký Gói Môi Giới' : 'Chốt thuê & Đặt lịch Ký Quỹ Trực Tuyến'
                  )}
                              </button>
                            </div>

                            {!agreedTerms && (
                              <p style={{ fontSize: '0.82rem', color: '#b4690e', marginTop: 10, textAlign: 'right', fontWeight: 600 }}>
                                ⚠️ Vui lòng tick chọn "Tôi đã đọc, hiểu rõ và đồng ý..." ở Bước 1 để mở khóa chọn Option và đặt lịch.
                              </p>
                            )}
                          </div>
          )}
                        </div>
                      </div>
                    </div>
                    );
}
