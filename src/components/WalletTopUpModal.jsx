import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wallet, 
  PlusCircle, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  ShieldCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { walletApi, mockPaymentApi } from '../services/api';

export default function WalletTopUpModal({
  isOpen,
  onClose,
  currentUser = null,
  onWalletUpdated = null
}) {
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(500000);
  const [customAmount, setCustomAmount] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const PRESETS = [100000, 200000, 500000, 1000000, 2000000, 5000000];

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const fetchWallet = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const data = await walletApi.getWalletByUserId(currentUser.id);
      setWallet(data);
      if (onWalletUpdated) onWalletUpdated(data);
    } catch (err) {
      console.warn('Lỗi lấy thông tin ví:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      setSuccessMessage('');
      setErrorMsg('');
      fetchWallet();
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const currentAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleDeposit = async () => {
    if (currentAmount < 50000) {
      setErrorMsg('Số tiền nạp tối thiểu là 50.000 ₫');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMessage('');

    try {
      // 1. Tạo yêu cầu nạp tiền (POST /wallet/deposits)
      const depRes = await walletApi.createDeposit(currentAmount);
      const refCode = depRes?.referenceCode;
      if (!refCode) {
        throw new Error('Không nhận được mã tham chiếu giao dịch từ máy chủ.');
      }

      // 2. Giả lập thanh toán qua cổng ngân hàng (POST /mock-payments/{refCode}/success)
      await mockPaymentApi.simulateSuccess(refCode);

      // 3. Xác nhận giao dịch để cộng tiền vào ví (POST /wallet/deposits/{refCode}/confirm)
      const confirmRes = await walletApi.confirmDeposit(refCode);

      // 4. Cập nhật lại số dư ví
      await fetchWallet();

      setSuccessMessage(`Đã nạp thành công ${formatVND(currentAmount)} vào ví EduTutor!`);
      setCustomAmount('');
    } catch (err) {
      console.error('Lỗi khi nạp tiền:', err);
      setErrorMsg('Nạp tiền thất bại: ' + (err.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 580, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 24px', background: '#1c1d1f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={22} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Ví Tiền EduTutor & Nạp Số Dư
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
                Quản lý số dư khả dụng và tài khoản ký quỹ học phí
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

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMessage && (
            <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#16a34a" /> <span>{successMessage}</span>
            </div>
          )}

          {/* Current Balance Display Card */}
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: 12, 
            padding: '20px 24px', 
            color: '#fff',
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                Tài khoản: {currentUser?.displayName || currentUser?.username}
              </span>
              <button 
                onClick={fetchWallet} 
                disabled={isLoading}
                title="Cập nhật số dư"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem' }}
              >
                <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} /> Làm mới
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                  Số dư khả dụng:
                </span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>
                  {formatVND(wallet?.availableBalance || 0)}
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: 2 }}>
                  Sẵn sàng chi tiêu & đăng ký
                </span>
              </div>

              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 16 }}>
                <span style={{ fontSize: '0.82rem', color: '#cbd5e1', display: 'block', marginBottom: 4 }}>
                  Đang giữ Ký quỹ (Escrow):
                </span>
                <strong style={{ fontSize: '1.5rem', fontWeight: 800, color: '#a78bfa' }}>
                  {formatVND(wallet?.holdingBalance || 0)}
                </strong>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8', display: 'block', marginTop: 2 }}>
                  Được bảo đảm an toàn
                </span>
              </div>
            </div>
          </div>

          {/* Top-up amount selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1c1d1f', marginBottom: 10 }}>
              Chọn số tiền nạp:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {PRESETS.map((amt) => {
                const isSelected = !customAmount && selectedAmount === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelectedAmount(amt);
                      setCustomAmount('');
                    }}
                    style={{
                      padding: '12px 8px',
                      borderRadius: 8,
                      border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : '#fff',
                      color: isSelected ? '#1d4ed8' : '#1c1d1f',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      fontSize: '0.92rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {formatVND(amt)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom amount input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: 6 }}>
              Hoặc nhập số tiền tùy chọn (VNĐ):
            </label>
            <input 
              type="number"
              placeholder="Ví dụ: 350000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Payment Gateway info */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: 8, 
            padding: '14px 16px', 
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 12
          }}>
            <CreditCard size={24} color="#2563eb" />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: '0.88rem', color: '#1c1d1f', display: 'block' }}>
                Cổng thanh toán EduTutor Pay (Thử nghiệm tự động)
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Mô phỏng nạp tiền tức thì qua Mock Gateway - Không cần thẻ thực tế
              </span>
            </div>
            <span className="badge" style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.74rem' }}>
              Miễn phí GD
            </span>
          </div>

          {/* Action Button */}
          <button
            type="button"
            className="btn btn-primary btn-block btn-lg"
            onClick={handleDeposit}
            disabled={isSubmitting || currentAmount <= 0}
            style={{ 
              padding: '14px', 
              fontSize: '1rem', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#2563eb',
              borderColor: '#2563eb'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Đang xử lý nạp tiền...
              </>
            ) : (
              <>
                <PlusCircle size={20} />
                Tiến hành Nạp {formatVND(currentAmount)} vào ví
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
