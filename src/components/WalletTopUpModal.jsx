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
  RefreshCw,
  Building2,
  Clock,
  History,
  Check,
  ChevronRight
} from 'lucide-react';
import { walletApi, mockPaymentApi, paymentMethodApi, withdrawalApi } from '../services/api';

export default function WalletTopUpModal({
  isOpen,
  onClose,
  currentUser = null,
  onWalletUpdated = null,
  initialTab = 'deposit',
  onOpenBankAccounts = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'deposit' | 'withdraw'
  const [wallet, setWallet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deposit state
  const [selectedAmount, setSelectedAmount] = useState(500000);
  const [customAmount, setCustomAmount] = useState('');

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState('');
  const [manualBankName, setManualBankName] = useState('');
  const [manualAccountNumber, setManualAccountNumber] = useState('');
  const [manualAccountHolder, setManualAccountHolder] = useState(currentUser?.displayName || '');
  const [useManualBank, setUseManualBank] = useState(false);
  const [myWithdrawals, setMyWithdrawals] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

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

  const fetchBankAccounts = async () => {
    if (!currentUser?.id) return;
    try {
      const res = await paymentMethodApi.getByUserId(currentUser.id);
      const accounts = Array.isArray(res) ? res : (res?.result || []);
      setBankAccounts(accounts);
      if (accounts.length > 0) {
        const def = accounts.find(a => a.isDefault) || accounts[0];
        setSelectedBankId(def.id);
        setUseManualBank(false);
      } else {
        setUseManualBank(true);
      }
    } catch (err) {
      console.warn('Lỗi lấy tài khoản ngân hàng:', err);
      setUseManualBank(true);
    }
  };

  const fetchWithdrawalsHistory = async () => {
    try {
      const res = await withdrawalApi.getMyWithdrawals();
      setMyWithdrawals(Array.isArray(res) ? res : (res?.result || []));
    } catch (err) {
      console.warn('Lỗi lấy lịch sử rút tiền:', err);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      setActiveTab(initialTab);
      setSuccessMessage('');
      setErrorMsg('');
      fetchWallet();
      fetchBankAccounts();
      fetchWithdrawalsHistory();
    }
  }, [isOpen, currentUser?.id, initialTab]);

  if (!isOpen) return null;

  const currentDepositAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleDeposit = async () => {
    if (currentDepositAmount < 50000) {
      setErrorMsg('Số tiền nạp tối thiểu là 50.000 ₫');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMessage('');

    try {
      // 1. Tạo yêu cầu nạp tiền (POST /wallet/deposits)
      const depRes = await walletApi.createDeposit(currentDepositAmount);
      const refCode = depRes?.referenceCode;
      if (!refCode) {
        throw new Error('Không nhận được mã tham chiếu giao dịch từ máy chủ.');
      }

      // 2. Giả lập thanh toán qua cổng ngân hàng (POST /mock-payments/{refCode}/success)
      await mockPaymentApi.simulateSuccess(refCode);

      // 3. Xác nhận giao dịch để cộng tiền vào ví (POST /wallet/deposits/{refCode}/confirm)
      await walletApi.confirmDeposit(refCode);

      // 4. Cập nhật lại số dư ví
      await fetchWallet();

      setSuccessMessage(`Đã nạp thành công ${formatVND(currentDepositAmount)} vào ví EduTutor!`);
      setCustomAmount('');
    } catch (err) {
      console.error('Lỗi khi nạp tiền:', err);
      setErrorMsg('Nạp tiền thất bại: ' + (err.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawal = async () => {
    const amountNum = parseInt(withdrawAmount, 10);
    if (!amountNum || amountNum < 50000) {
      setErrorMsg('Số tiền rút tối thiểu là 50.000 ₫');
      return;
    }

    const available = wallet?.availableBalance || 0;
    if (amountNum > available) {
      setErrorMsg(`Số dư khả dụng không đủ. Bạn chỉ có thể rút tối đa ${formatVND(available)}`);
      return;
    }

    let bName = '';
    let aNum = '';
    let aHolder = '';

    if (!useManualBank && selectedBankId) {
      const selected = bankAccounts.find(a => a.id === selectedBankId);
      if (selected) {
        bName = selected.provider;
        aNum = selected.accountNumber;
        aHolder = selected.accountHolder;
      }
    } else {
      bName = manualBankName.trim();
      aNum = manualAccountNumber.trim();
      aHolder = manualAccountHolder.trim().toUpperCase();
    }

    if (!bName || !aNum || !aHolder) {
      setErrorMsg('Vui lòng chọn hoặc điền đầy đủ tên ngân hàng, số tài khoản và tên chủ thẻ.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMessage('');

    try {
      await withdrawalApi.create({
        amount: amountNum,
        bankName: bName,
        accountNumber: aNum,
        accountHolder: aHolder
      });

      await fetchWallet();
      await fetchWithdrawalsHistory();

      setSuccessMessage(`Đã gửi yêu cầu rút ${formatVND(amountNum)} thành công! Hệ thống đang chờ Quản trị viên xét duyệt.`);
      setWithdrawAmount('');
    } catch (err) {
      console.error('Lỗi rút tiền:', err);
      setErrorMsg('Yêu cầu rút tiền thất bại: ' + (err.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 620, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', background: '#1c1d1f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(37, 99, 235, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={22} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
                Ví Tiền EduTutor & Quản Lý Giao Dịch
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#8c8c8c' }}>
                Nạp số dư học phí & Yêu cầu rút thu nhập về tài khoản ngân hàng
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

        {/* Tab switch bar */}
        <div style={{ display: 'flex', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '4px 24px 0' }}>
          <button
            onClick={() => { setActiveTab('deposit'); setErrorMsg(''); setSuccessMessage(''); }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'deposit' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'deposit' ? '#1d4ed8' : '#64748b',
              fontWeight: activeTab === 'deposit' ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <PlusCircle size={16} /> Nạp số dư vào ví
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setErrorMsg(''); setSuccessMessage(''); }}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'none',
              borderBottom: activeTab === 'withdraw' ? '3px solid #16a34a' : '3px solid transparent',
              color: activeTab === 'withdraw' ? '#15803d' : '#64748b',
              fontWeight: activeTab === 'withdraw' ? 700 : 500,
              fontSize: '0.92rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <ArrowUpRight size={16} /> Rút tiền về Ngân hàng (CN04.04)
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', maxHeight: '76vh', overflowY: 'auto' }}>
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
            marginBottom: 20,
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
                  {activeTab === 'withdraw' ? 'Số dư tối đa có thể rút' : 'Sẵn sàng chi tiêu & đăng ký'}
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

          {/* ==================== TAB 1: DEPOSIT ==================== */}
          {activeTab === 'deposit' && (
            <div>
              {/* Top-up amount selection */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1c1d1f', marginBottom: 8 }}>
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
                          padding: '11px 8px',
                          borderRadius: 8,
                          border: isSelected ? '2px solid #2563eb' : '1px solid #e2e8f0',
                          background: isSelected ? '#eff6ff' : '#fff',
                          color: isSelected ? '#1d4ed8' : '#1c1d1f',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          fontSize: '0.9rem',
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
              <div style={{ marginBottom: 18 }}>
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
                padding: '12px 16px', 
                marginBottom: 20,
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

              {/* Deposit Button */}
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={handleDeposit}
                disabled={isSubmitting || currentDepositAmount <= 0}
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
                    Tiến hành Nạp {formatVND(currentDepositAmount)} vào ví
                  </>
                )}
              </button>
            </div>
          )}

          {/* ==================== TAB 2: WITHDRAW ==================== */}
          {activeTab === 'withdraw' && (
            <div>
              {/* Linked Bank Selection */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1c1d1f' }}>
                    Tài khoản ngân hàng nhận tiền:
                  </label>
                  {onOpenBankAccounts && (
                    <button
                      type="button"
                      onClick={onOpenBankAccounts}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
                    >
                      Quản lý tài khoản ngân hàng <ChevronRight size={14} />
                    </button>
                  )}
                </div>

                {bankAccounts.length > 0 && !useManualBank ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                    {bankAccounts.map((acc) => {
                      const isSel = selectedBankId === acc.id;
                      return (
                        <div
                          key={acc.id}
                          onClick={() => setSelectedBankId(acc.id)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 8,
                            border: isSel ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            background: isSel ? '#f0fdf4' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Building2 size={20} color={isSel ? '#16a34a' : '#64748b'} />
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: '#1c1d1f', display: 'block' }}>
                                {acc.provider} - {acc.accountNumber}
                              </strong>
                              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                                Chủ TK: {acc.accountHolder} {acc.isDefault && <span style={{ color: '#16a34a', fontWeight: 600 }}>(Mặc định)</span>}
                              </span>
                            </div>
                          </div>
                          {isSel && <Check size={18} color="#16a34a" />}
                        </div>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setUseManualBank(true)}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', marginTop: 4 }}
                    >
                      + Nhập tài khoản ngân hàng khác
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 14, marginBottom: 12 }}>
                    <div style={{ marginBottom: 10 }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>
                        Tên Ngân hàng:
                      </label>
                      <input 
                        type="text"
                        placeholder="Ví dụ: Vietcombank, Techcombank, MB Bank"
                        value={manualBankName}
                        onChange={(e) => setManualBankName(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>
                          Số tài khoản:
                        </label>
                        <input 
                          type="text"
                          placeholder="Ví dụ: 190367888899"
                          value={manualAccountNumber}
                          onChange={(e) => setManualAccountNumber(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.8rem', color: '#475569', marginBottom: 4 }}>
                          Tên chủ tài khoản:
                        </label>
                        <input 
                          type="text"
                          placeholder="NGUYEN VAN A"
                          value={manualAccountHolder}
                          onChange={(e) => setManualAccountHolder(e.target.value)}
                          style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '0.9rem', textTransform: 'uppercase' }}
                        />
                      </div>
                    </div>
                    {bankAccounts.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setUseManualBank(false)}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', marginTop: 8 }}
                      >
                        ← Chọn từ danh sách tài khoản đã liên kết
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Withdrawal Amount */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1c1d1f' }}>
                    Số tiền muốn rút (VNĐ):
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(String(wallet?.availableBalance || 0))}
                    style={{ background: 'none', border: 'none', color: '#16a34a', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Rút toàn bộ số dư
                  </button>
                </div>
                <input 
                  type="number"
                  placeholder="Tối thiểu 50.000 ₫"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    fontSize: '1rem',
                    fontWeight: 600,
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.76rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                  Số tiền rút sẽ được tạm khóa từ số dư khả dụng và giải ngân ngay sau khi Admin phê duyệt.
                </span>
              </div>

              {/* Submit Withdrawal Button */}
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={handleWithdrawal}
                disabled={isSubmitting || !withdrawAmount || parseInt(withdrawAmount, 10) <= 0}
                style={{ 
                  padding: '14px', 
                  fontSize: '1rem', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  background: '#16a34a',
                  borderColor: '#16a34a'
                }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Đang gửi yêu cầu rút tiền...
                  </>
                ) : (
                  <>
                    <ArrowUpRight size={20} />
                    Gửi yêu cầu Rút {withdrawAmount ? formatVND(parseInt(withdrawAmount, 10)) : ''}
                  </>
                )}
              </button>

              {/* Withdrawal History Toggle */}
              <div style={{ marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  style={{
                    width: '100%',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    color: '#475569',
                    fontSize: '0.88rem',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <History size={16} /> Lịch sử yêu cầu rút tiền ({myWithdrawals.length})
                  </span>
                  <span>{showHistory ? '▲ Thu gọn' : '▼ Xem chi tiết'}</span>
                </button>

                {showHistory && (
                  <div style={{ marginTop: 12 }}>
                    {myWithdrawals.length === 0 ? (
                      <p style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', margin: '16px 0' }}>
                        Chưa có yêu cầu rút tiền nào.
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                        {myWithdrawals.map((w) => (
                          <div 
                            key={w.id}
                            style={{
                              padding: '10px 12px',
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: 6,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.84rem'
                            }}
                          >
                            <div>
                              <strong style={{ color: '#0f172a' }}>{formatVND(w.amount)}</strong>
                              <span style={{ color: '#64748b', display: 'block', fontSize: '0.76rem' }}>
                                {w.bankName} - {w.accountNumber} ({w.accountHolder})
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                background: w.status === 'COMPLETED' ? '#dcfce7' : (w.status === 'REJECTED' ? '#fee2e2' : '#fef3c7'),
                                color: w.status === 'COMPLETED' ? '#15803d' : (w.status === 'REJECTED' ? '#b91c1c' : '#b45309')
                              }}>
                                {w.status === 'COMPLETED' ? 'ĐÃ DUYỆT' : (w.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT')}
                              </span>
                              <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', marginTop: 2 }}>
                                {w.createdAt ? new Date(w.createdAt).toLocaleDateString('vi-VN') : ''}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
