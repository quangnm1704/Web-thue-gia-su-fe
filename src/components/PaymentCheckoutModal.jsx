import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Sparkles,
  Clock,
  CreditCard,
  PlusCircle,
  Video,
  Calendar
} from 'lucide-react';
import { walletApi, paymentApi, mockPaymentApi } from '../services/api';

export default function PaymentCheckoutModal({
  isOpen,
  onClose,
  type = 'course', // 'course' | 'booking'
  item = null,     // Course object or Booking/Package object
  enrollmentId = null,
  bookingId = null,
  amount = 0,
  currentUser = null,
  onSuccess = null,
  onOpenTopUp = null
}) {
  const [wallet, setWallet] = useState(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isQuickToppingUp, setIsQuickToppingUp] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Fetch student wallet whenever modal opens
  useEffect(() => {
    if (!isOpen || !currentUser?.id) {
      setPaymentSuccess(null);
      setErrorMsg('');
      return;
    }

    async function fetchWallet() {
      setIsLoadingWallet(true);
      setErrorMsg('');
      try {
        const w = await walletApi.getWalletByUserId(currentUser.id);
        setWallet(w);
      } catch (err) {
        console.warn('Lỗi lấy ví người dùng:', err);
        // Fallback wallet if new user doesn't have wallet loaded yet
        setWallet({
          availableBalance: 0,
          holdingBalance: 0
        });
      } finally {
        setIsLoadingWallet(false);
      }
    }

    fetchWallet();
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const isOption1Booking = type === 'booking' && (
    item?.isOption1 ||
    item?.name?.includes('Môi Giới') ||
    item?.packageName?.includes('Môi Giới') ||
    item?.platformFeePercent === 100
  );

  const totalAmount = amount || (type === 'course' ? item?.price : item?.totalPrice) || 0;
  const availableBalance = wallet?.availableBalance || 0;
  const holdingBalance = wallet?.holdingBalance || 0;
  const isBalanceSufficient = availableBalance >= totalAmount;
  const missingAmount = Math.max(0, totalAmount - availableBalance);

  // Quick 1-click top-up right inside checkout
  const handleQuickTopUp = async () => {
    if (!currentUser) return;
    setIsQuickToppingUp(true);
    setErrorMsg('');
    try {
      // Top up missing amount rounded up to nearest 50k or minimum 100k
      const topUpAmount = Math.max(100000, Math.ceil(missingAmount / 50000) * 50000);

      // 1. Initiate deposit
      const depRes = await walletApi.createDeposit(topUpAmount);
      if (!depRes?.referenceCode) throw new Error('Không thể khởi tạo giao dịch nạp tiền');

      // 2. Simulate gateway payment success
      await mockPaymentApi.simulateSuccess(depRes.referenceCode);

      // 3. Confirm deposit
      await walletApi.confirmDeposit(depRes.referenceCode);

      // 4. Refresh wallet
      const updated = await walletApi.getWalletByUserId(currentUser.id);
      setWallet(updated);
    } catch (err) {
      console.error('Lỗi nạp tiền nhanh:', err);
      setErrorMsg('Không thể nạp tiền: ' + (err.data?.message || err.message));
    } finally {
      setIsQuickToppingUp(false);
    }
  };

  // Execute payment
  const handleConfirmPayment = async () => {
    if (!isBalanceSufficient) {
      setErrorMsg(`Số dư khả dụng không đủ. Cần nạp thêm ${formatVND(missingAmount)}.`);
      return;
    }

    setIsPaying(true);
    setErrorMsg('');
    try {
      let result = null;
      if (type === 'course') {
        const idToPay = enrollmentId || item?.enrollmentId || item?.id;
        if (!idToPay) throw new Error('Không tìm thấy thông tin đơn ghi danh (Enrollment ID).');
        result = await paymentApi.payForEnrollment(idToPay);
      } else {
        const idToPay = bookingId || item?.bookingId || item?.id;
        if (!idToPay) throw new Error('Không tìm thấy thông tin đơn đặt lịch (Booking ID).');
        result = await paymentApi.payForBooking(idToPay);
      }

      setPaymentSuccess(result);

      // Refresh wallet balance after payment
      if (currentUser?.id) {
        try {
          const updatedWallet = await walletApi.getWalletByUserId(currentUser.id);
          setWallet(updatedWallet);
        } catch (e) {
          // ignore
        }
      }

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Lỗi thanh toán:', err);
      setErrorMsg('Thanh toán thất bại: ' + (err.data?.message || err.message));
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 640, padding: 0, overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ padding: '20px 28px', background: '#1c1d1f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(164, 53, 240, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={22} color="#a435f0" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                {type === 'course'
                  ? 'Thanh toán Khóa học Online (Video quay sẵn)'
                  : (isOption1Booking
                    ? 'Thanh toán Phí Môi Giới Kết Nối'
                    : 'Ký quỹ Học phí Gia sư 1-1')}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
                {type === 'course'
                  ? 'Sở hữu trọn đời toàn bộ video bài giảng & tài liệu học tập'
                  : (isOption1Booking
                    ? 'Thu phí môi giới 1 lần duy nhất • Mở khóa liên hệ gia sư để tự dạy ngoài'
                    : 'Hệ thống Ký quỹ Escrow bảo đảm an toàn 100% học phí')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', maxHeight: '75vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 18 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {paymentSuccess ? (
            /* ================= Success State ================= */
            <div style={{ textAlign: 'center', padding: '20px 8px' }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <CheckCircle2 size={44} />
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1c1d1f', marginBottom: 8 }}>
                Thanh toán thành công!
              </h3>

                <p style={{ color: '#6a6f73', fontSize: '0.95rem', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  {type === 'course'
                  ? 'Khóa học của bạn đã được kích hoạt thành công! Toàn bộ video bài giảng quay sẵn chất lượng cao đã sẵn sàng để bạn học ngay.'
                  : (isOption1Booking
                  ? 'Đã thanh toán phí môi giới thành công! Thông tin liên hệ (SĐT, Zalo) của Gia sư đã được mở khóa để hai bên tự do sắp xếp lịch dạy ngoài.'
                      : 'Tiền học phí đã được giữ an toàn trong ví Ký quỹ EduTutor. Phòng học Google Meet 1-1 đã sẵn sàng để bạn và gia sư bắt đầu!')}
                </p>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '16px 20px',
                  maxWidth: 420,
                  margin: '0 auto 24px',
                  textAlign: 'left',
                  fontSize: '0.88rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Mã giao dịch:</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{paymentSuccess.referenceCode || paymentSuccess.transactionId || 'TXN-SUCCESS'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#64748b' }}>Số tiền đã thanh toán:</span>
                    <strong style={{ color: '#a435f0' }}>{formatVND(paymentSuccess.amount || totalAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Số dư ví còn lại:</span>
                    <strong>{formatVND(paymentSuccess.availableBalance ?? wallet?.availableBalance)}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={onClose}
                    style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                  >
                    {type === 'course' ? 'Xem video bài giảng' : 'Đã hiểu & Đóng'}
                  </button>
                </div>
            </div>
          ) : (
            /* ================= Checkout & Payment Form ================= */
            <>
              {/* Item Summary Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '16px',
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                marginBottom: 20
              }}>
                {type === 'course' ? (
                  <img
                    src={item?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=160&q=80'}
                    alt={item?.title}
                    style={{ width: 88, height: 60, borderRadius: 6, objectFit: 'cover' }}
                  />
                ) : (
                  <img
                    src={item?.tutor?.avatar || item?.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=160&q=80'}
                    alt="Tutor"
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a435f0' }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="badge badge-bestseller" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                      {type === 'course'
                        ? 'Khóa học Online (Video)'
                        : (isOption1Booking ? '🎯 Gói Môi Giới Ngoài' : '💻 Gia sư 1-1 Trực Tuyến')}
                    </span>
                  </div>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1c1d1f', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {type === 'course' ? item?.title : (item?.name || item?.package?.name || (isOption1Booking ? 'Phí dịch vụ môi giới gia sư' : 'Gói dạy kèm trực tuyến 1-1'))}
                  </h4>
                  <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#6a6f73' }}>
                    {type === 'course'
                      ? `Giảng viên: ${item?.instructor || 'Gia sư EduTutor'}`
                      : `Gia sư: ${item?.tutor?.name || item?.tutorName || 'ThS. Đặng Thị Bích Thủy'}`}
                  </p>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.78rem', color: '#6a6f73', display: 'block' }}>
                    {isOption1Booking ? 'Phí môi giới' : 'Học phí'}
                  </span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a435f0' }}>
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Escrow / Guarantee Box */}
              <div style={{
                background: isOption1Booking ? '#fdf4ff' : '#f5f3ff',
                border: isOption1Booking ? '1px solid #f5d0fe' : '1px solid #ddd6fe',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 20,
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start'
              }}>
                  <ShieldCheck size={22} color={isOption1Booking ? '#a435f0' : '#7c3aed'} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{ fontSize: '0.84rem', lineHeight: 1.45, color: isOption1Booking ? '#701a75' : '#4c1d95' }}>
                    <strong>{isOption1Booking ? 'Cam kết Dịch vụ Môi giới:' : (type === 'course' ? 'Cam kết Khóa học Video:' : 'Cơ chế Ký quỹ An toàn (Escrow):')}</strong>{' '}
                    {type === 'course'
                    ? 'Học phí được tiếp nhận an toàn. Bạn sở hữu trọn bộ video bài giảng quay sẵn trọn đời và được hoàn tiền trong 7 ngày nếu không hài lòng.'
                    : (isOption1Booking
                    ? 'EduTutor thu phí dịch vụ môi giới một lần. Thông tin liên hệ gia sư được mở khóa ngay và hỗ trợ bảo hành đổi gia sư nếu không phù hợp.'
                        : 'Học phí được giữ an toàn trong ví Ký quỹ EduTutor và CHỈ giải ngân cho gia sư sau khi bạn xác nhận hoàn thành các buổi học qua Google Meet.')}
                  </div>
                </div>

                {/* Wallet Information & Balance Card */}
                <div style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  padding: '18px 20px',
                  marginBottom: 22,
                  background: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Wallet size={18} color="#2563eb" />
                      </div>
                      <div>
                        <strong style={{ fontSize: '0.95rem', color: '#1c1d1f' }}>Ví EduTutor (Tài khoản học viên)</strong>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Thanh toán nội bộ tức thì - Không mất phí giao dịch</div>
                      </div>
                    </div>

                    <span className="badge" style={{ background: '#dbeafe', color: '#1e40af', fontSize: '0.75rem' }}>
                      Mặc định
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 12,
                    background: '#f8fafc',
                    padding: '12px 14px',
                    borderRadius: 6,
                    border: '1px solid #f1f5f9'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>Số dư khả dụng:</span>
                      <strong style={{ fontSize: '1.05rem', color: availableBalance >= totalAmount ? '#16a34a' : '#dc2626' }}>
                        {formatVND(availableBalance)}
                      </strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block' }}>Đang giữ ký quỹ:</span>
                      <strong style={{ fontSize: '1.05rem', color: '#64748b' }}>
                        {formatVND(holdingBalance)}
                      </strong>
                    </div>
                  </div>

                  {/* Balance status alert */}
                  {!isBalanceSufficient ? (
                    <div style={{
                      marginTop: 14,
                      padding: '12px 14px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 6,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.84rem', color: '#b91c1c', display: 'block', fontWeight: 600 }}>
                          Số dư không đủ để thanh toán
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#7f1d1d' }}>
                          Bạn cần thêm ít nhất <strong>{formatVND(missingAmount)}</strong>.
                        </span>
                      </div>

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={handleQuickTopUp}
                        disabled={isQuickToppingUp}
                        style={{
                          borderColor: '#dc2626',
                          color: '#dc2626',
                          fontSize: '0.82rem',
                          padding: '6px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        {isQuickToppingUp ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Đang nạp...
                          </>
                        ) : (
                          <>
                            <PlusCircle size={14} />
                            Nạp nhanh {formatVND(Math.max(100000, Math.ceil(missingAmount / 50000) * 50000))}
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, color: '#16a34a', fontSize: '0.82rem' }}>
                      <CheckCircle2 size={16} />
                      <span>Số dư khả dụng đủ điều kiện để thực hiện thanh toán này.</span>
                    </div>
                  )}
                </div>

                {/* Payment Actions */}
                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    className="btn btn-outline"
                    onClick={onClose}
                    style={{ flex: 1, padding: '12px 18px', fontSize: '0.95rem' }}
                  >
                    Hủy bỏ
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={handleConfirmPayment}
                    disabled={!isBalanceSufficient || isPaying || isLoadingWallet}
                    style={{
                      flex: 2,
                      padding: '12px 18px',
                      fontSize: '0.95rem',
                      opacity: !isBalanceSufficient ? 0.6 : 1,
                      cursor: !isBalanceSufficient ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isPaying ? (
                      <>
                        <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 8 }} />
                        Đang xử lý giao dịch...
                      </>
                    ) : (
                    isOption1Booking
                    ? `Thanh toán Phí Môi Giới (${formatVND(totalAmount)})`
                    : (type === 'course'
                    ? `Xác nhận Mua Khóa Học (${formatVND(totalAmount)})`
                    : `Xác nhận Ký Quỹ Học Phí (${formatVND(totalAmount)})`)
                  )}
                  </button>
                </div>

                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <span style={{ fontSize: '0.78rem', color: '#6a6f73' }}>
                    🔒 Mã hóa bảo mật SSL 256-bit • Tiền được bảo vệ bởi Quỹ tín thác EduTutor
                  </span>
                </div>
              </>
          )}
            </div>
        </div>
      </div>
      );
}
