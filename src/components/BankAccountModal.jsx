import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Star,
  Building,
  User,
  ShieldCheck
} from 'lucide-react';
import { paymentMethodApi } from '../services/api';

const POPULAR_BANKS = [
  'Vietcombank (VCB)',
  'MB Bank (Ngân hàng Quân đội)',
  'Techcombank (TCB)',
  'BIDV (Đầu tư & Phát triển)',
  'Agribank (Nông nghiệp)',
  'VietinBank (Công thương)',
  'ACB (Á Châu)',
  'VPBank (Việt Nam Thịnh Vượng)',
  'TPBank (Tiên Phong)',
  'VIB (Quốc Tế)',
  'Sacombank (Sài Gòn Thương Tín)'
];

export default function BankAccountModal({ isOpen, onClose, currentUser }) {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [bankName, setBankName] = useState(POPULAR_BANKS[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchBankAccounts();
      setShowAddForm(false);
      setSuccessMsg('');
      setErrorMsg('');
      if (currentUser.displayName) {
        setAccountHolderName(currentUser.displayName.toUpperCase());
      }
    }
  }, [isOpen, currentUser]);

  const fetchBankAccounts = async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const data = await paymentMethodApi.getByUserId(currentUser.id);
      setBankAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi lấy danh sách tài khoản ngân hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await paymentMethodApi.setDefault(id);
      setSuccessMsg('Đã đặt làm tài khoản ngân hàng mặc định thành công!');
      fetchBankAccounts();
    } catch (err) {
      setErrorMsg('Không thể đổi tài khoản mặc định: ' + (err.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?')) return;
    try {
      await paymentMethodApi.delete(id);
      setSuccessMsg('Đã xóa tài khoản ngân hàng thành công!');
      fetchBankAccounts();
    } catch (err) {
      setErrorMsg('Không thể xóa tài khoản: ' + (err.data?.message || err.message));
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      setErrorMsg('Vui lòng nhập số tài khoản ngân hàng!');
      return;
    }
    if (!accountHolderName.trim()) {
      setErrorMsg('Vui lòng nhập họ tên chủ tài khoản!');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await paymentMethodApi.create({
        userId: currentUser.id,
        bankName,
        accountNumber: accountNumber.trim(),
        accountHolderName: accountHolderName.trim().toUpperCase(),
        isDefault
      });

      setSuccessMsg('🎉 Đã thêm thành công tài khoản ngân hàng mới!');
      setAccountNumber('');
      setShowAddForm(false);
      fetchBankAccounts();
    } catch (err) {
      setErrorMsg('Lỗi thêm tài khoản: ' + (err.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose} title="Đóng">
          <X size={22} />
        </button>

        {/* Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 30px 18px', background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller" style={{ background: '#059669' }}>
              <CreditCard size={13} style={{ display: 'inline', marginRight: 4 }} /> Thông Tin Ngân Hàng
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.45rem', marginTop: 8 }}>
              Quản Lý Tài Khoản Ngân Hàng
            </h2>
            <p className="detail-sub" style={{ fontSize: '0.86rem' }}>
              Liên kết tài khoản ngân hàng chính chủ để nạp tiền vào ví hoặc nhận thu nhập rút về nhanh chóng.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 30px' }}>
          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Danh sách tài khoản ({bankAccounts.length})
            </h3>
            {!showAddForm && (
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 6,
                  background: '#047857',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Plus size={15} /> Thêm tài khoản mới
              </button>
            )}
          </div>

          {/* Add Form */}
          {showAddForm && (
            <form onSubmit={handleAddAccount} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 10, padding: '20px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <strong style={{ fontSize: '0.92rem', color: '#047857' }}>➕ Thêm Tài Khoản Ngân Hàng Mới</strong>
                <button type="button" onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Ngân hàng thụ hưởng: *
                  </label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', background: '#ffffff' }}
                  >
                    {POPULAR_BANKS.map((b, i) => (
                      <option key={i} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Số tài khoản ngân hàng: *
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="VD: 1029384756"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 5 }}>
                    Họ và tên chủ tài khoản (Viết hoa không dấu): *
                  </label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value.toUpperCase())}
                    placeholder="VD: NGUYEN VAN A"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem', textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                  <input
                    type="checkbox"
                    id="isDefaultAccount"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="isDefaultAccount" style={{ fontSize: '0.84rem', color: '#475569', cursor: 'pointer' }}>
                    Đặt làm tài khoản ngân hàng mặc định
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: '8px 20px',
                      borderRadius: 6,
                      border: 'none',
                      background: '#047857',
                      color: '#ffffff',
                      fontWeight: 700,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      fontSize: '0.85rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    {submitting && <Loader2 size={15} className="animate-spin" />}
                    <span>{submitting ? 'Đang lưu...' : 'Lưu tài khoản'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Accounts List */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>Đang tải danh sách tài khoản...</p>
            </div>
          ) : bankAccounts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px 20px', background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
              <CreditCard size={36} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
              <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#334155' }}>Chưa có tài khoản ngân hàng nào được liên kết</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Bấm nút "Thêm tài khoản mới" phía trên để lưu thông tin ngân hàng phục vụ rút tiền hoặc nạp tiền.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 18px',
                    borderRadius: 8,
                    border: acc.isDefault ? '2px solid #059669' : '1px solid #e2e8f0',
                    background: acc.isDefault ? '#f0fdf4' : '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: acc.isDefault ? '#d1fae5' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: acc.isDefault ? '#047857' : '#64748b' }}>
                      <Building size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{acc.bankName}</strong>
                        {acc.isDefault && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#059669', color: '#ffffff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                            <Star size={11} fill="#fff" /> Mặc định
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#475569', marginTop: 3 }}>
                        STK: <strong>{acc.accountNumber}</strong> • Chủ TK: <strong>{acc.accountHolderName}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!acc.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(acc.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #cbd5e1',
                          borderRadius: 4,
                          padding: '5px 10px',
                          fontSize: '0.78rem',
                          color: '#475569',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(acc.id)}
                      title="Xóa tài khoản này"
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        borderRadius: 4,
                        padding: '6px',
                        color: '#dc2626',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
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
