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
  DollarSign
} from 'lucide-react';
import { conversationApi, brokeragePackageApi, bookingApi } from '../services/api';

export default function BookTutorModal({ tutor, isOpen, onClose, currentUser, onOpenAuth, onOpenChat }) {
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

  useEffect(() => {
    if (!isOpen || !tutor) {
      setBookingSuccess(null);
      setErrorMsg('');
      setAgreedTerms(false);
      return;
    }

    if (!currentUser) return;

    // Reset lại trạng thái tick đồng ý mỗi khi mở modal để người dùng luôn chủ động xác nhận
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

        // 2. Lấy các gói dịch vụ của gia sư
        try {
          const pkgs = await brokeragePackageApi.getPackagesByTutor(tutor.id);
          if (pkgs && pkgs.length > 0) {
            setPackages(pkgs);
            setSelectedPackage(pkgs[0]);
          } else {
            // Fallback packages nếu backend trả về rỗng
            const fallback = [
              { id: '33333333-aaaa-bbbb-cccc-000000000001', name: 'Gói Học Thử 1-1 Nhanh (3 buổi kèm riêng)', price: 450000, platformFeePercent: 10 },
              { id: '33333333-aaaa-bbbb-cccc-000000000002', name: 'Gói Kèm Chuyên Sâu 1-1 (10 buổi + Hỗ trợ bài tập 24/7)', price: 1400000, platformFeePercent: 10 },
              { id: '33333333-aaaa-bbbb-cccc-000000000003', name: 'Gói Luyện Thi THPT QG Cấp Tốc 1-1 (20 buổi)', price: 2600000, platformFeePercent: 10 }
            ];
            setPackages(fallback);
            setSelectedPackage(fallback[0]);
          }
        } catch (e) {
          console.warn('Lỗi tải gói dịch vụ:', e.message);
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
      // Học sinh tick đồng ý: Gửi cập nhật trạng thái lên backend
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
        // Vẫn kích hoạt đồng ý ở frontend để mở khóa Bước 2
        setAgreedTerms(true);
      } finally {
        setIsAgreeing(false);
      }
    } else {
      // Học sinh bỏ tick: Khóa lại các bước sau
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

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 840 }} onClick={(e) => e.stopPropagation()}>
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">Gia sư dạy kèm 1-1</span>
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
            <div style={{ textAlign: 'center', padding: '30px 10px' }} className="animate-fade-in">
              <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#e6f7f2', color: '#0d6832', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Check size={36} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1c1d1f', marginBottom: 8 }}>
                Đặt lịch thuê Gia sư thành công!
              </h3>
              <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto 20px' }}>
                Đơn đặt lịch của bạn đã được ghi nhận trên hệ thống Backend. Gia sư <strong>{tutor.name}</strong> sẽ liên hệ với bạn qua thông tin tài khoản để sắp xếp buổi học đầu tiên.
              </p>

              <div style={{ background: '#f7f9fa', border: '1px solid #e4e8eb', borderRadius: 8, padding: 18, maxWidth: 480, margin: '0 auto 24px', textAlign: 'left', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Mã đặt lịch:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{bookingSuccess.id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Gói dịch vụ:</span>
                  <strong>{selectedPackage?.name}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: '#6a6f73' }}>Học phí thanh toán:</span>
                  <strong style={{ color: '#a435f0' }}>{formatVND(bookingSuccess.totalPrice)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6a6f73' }}>Trạng thái:</span>
                  <span className="badge badge-bestseller" style={{ textTransform: 'uppercase' }}>
                    {bookingSuccess.status}
                  </span>
                </div>
              </div>

              <button className="btn btn-primary" onClick={onClose} style={{ padding: '12px 32px' }}>
                Hoàn tất
              </button>
            </div>
          ) : (
            <div>
              {/* BƯỚC 1: Thỏa thuận điều kiện */}
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
                      Thương lượng & Thỏa thuận điều kiện thuê gia sư
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

                {/* Các cam kết điều kiện */}
                <div style={{ fontSize: '0.88rem', color: '#555', background: '#f7f9fa', padding: 14, borderRadius: 6, marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Check size={16} color="#0d6832" /> Dạy kèm trực tuyến 1-1 chất lượng cao qua Google Meet.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Check size={16} color="#0d6832" /> Học sinh được linh hoạt chọn và đổi khung giờ học trước 24h.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Check size={16} color="#0d6832" /> Quỹ học phí được EduTutor ký quỹ an toàn và bảo hiểm hoàn tiền 100%.
                  </div>
                </div>

                {/* Nút / Checkbox tick đồng ý điều khoản */}
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
                        Tôi đã đọc, hiểu rõ và đồng ý với tất cả điều khoản thuê gia sư 1-1 ở trên
                      </span>
                      <span style={{ fontSize: '0.8rem', color: agreedTerms ? '#166534' : '#b45309' }}>
                        {agreedTerms 
                          ? '✓ Đã xác nhận điều khoản. Bước 2 và Bước 3 đã được mở khóa.' 
                          : '👉 Bạn cần tick vào ô này để mở khóa chọn gói dịch vụ ở Bước 2 và đặt lịch.'}
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
                    💬 Nhắn tin trực tiếp với {tutor.name} trước khi chốt điều khoản
                  </button>
                </div>
              </div>

              {/* BƯỚC 2: Chọn gói dịch vụ */}
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
                      Chọn gói dịch vụ dạy kèm phù hợp {!agreedTerms && '(Đang khóa - Yêu cầu hoàn thành Bước 1)'}
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

                {!agreedTerms && (
                  <p style={{ fontSize: '0.82rem', color: '#b4690e', margin: '-4px 0 12px 36px', fontWeight: 500 }}>
                    * Vui lòng tick đồng ý điều khoản ở Bước 1 để kích hoạt phần chọn gói này.
                  </p>
                )}

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
                        border: selectedPackage?.id === pkg.id && agreedTerms ? '2px solid #a435f0' : '1px solid #e4e8eb',
                        background: selectedPackage?.id === pkg.id && agreedTerms ? '#fcf8ff' : '#ffffff',
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
                        />
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: '#1c1d1f' }}>{pkg.name}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#6a6f73', marginTop: 2 }}>
                            Kèm 1-1 qua Google Meet • Hỗ trợ chữa bài tập riêng
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                          {formatVND(pkg.price)}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* BƯỚC 3: Tổng kết & Chốt đặt lịch */}
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
                  <span style={{ fontSize: '0.85rem', color: '#6a6f73' }}>Tổng chi phí gói học:</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1c1d1f', fontFamily: 'Outfit, sans-serif' }}>
                    {formatVND(selectedPackage?.price || 0)}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: '#0d6832' }}>
                    ✓ Đã bao gồm phí nền tảng & cam kết bảo hiểm học tập
                  </span>
                </div>

                <button 
                  className="btn btn-primary btn-lg"
                  onClick={handleConfirmBooking}
                  disabled={isBooking || !agreedTerms || !selectedPackage}
                  style={{ 
                    opacity: !agreedTerms ? 0.5 : 1, 
                    cursor: !agreedTerms ? 'not-allowed' : 'pointer' 
                  }}
                  title={!agreedTerms ? 'Bạn cần tick đồng ý điều khoản ở Bước 1 trước' : 'Chốt thuê gia sư'}
                >
                  {isBooking ? (
                    <>
                      <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                      Đang xử lý đặt lịch...
                    </>
                  ) : (
                    'Chốt thuê & Đặt lịch ngay'
                  )}
                </button>
              </div>

              {!agreedTerms && (
                <p style={{ fontSize: '0.82rem', color: '#b4690e', marginTop: 10, textAlign: 'right', fontWeight: 600 }}>
                  ⚠️ Vui lòng tick chọn "Tôi đã đọc, hiểu rõ và đồng ý..." ở Bước 1 để mở khóa đặt lịch.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
