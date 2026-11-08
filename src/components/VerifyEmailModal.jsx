import React, { useState, useEffect } from 'react';
import {
  X,
  MailCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';
import { authApi } from '../services/api';

export default function VerifyEmailModal({
  isOpen,
  onClose,
  initialToken = '',
  onOpenLogin = null
}) {
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
      handleAutoVerify(initialToken);
    }
  }, [initialToken]);

  const handleAutoVerify = async (tok) => {
    if (!tok) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      await authApi.verifyEmail(tok);
      setIsSuccess(true);
    } catch (err) {
      console.warn('Lỗi xác thực email:', err);
      setErrorMsg('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMsg('Vui lòng nhập mã hoặc dán liên kết xác thực.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      let cleanToken = token.trim();
      // Nếu người dùng dán cả URL: lấy query param 'token'
      if (cleanToken.includes('token=')) {
        const urlParams = new URLSearchParams(cleanToken.split('?')[1] || cleanToken);
        cleanToken = urlParams.get('token') || cleanToken;
      }

      await authApi.verifyEmail(cleanToken);
      setIsSuccess(true);
    } catch (err) {
      console.error('Lỗi xác thực email:', err);
      setErrorMsg('Xác minh thất bại: ' + (err.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn (quá 15 phút).'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1300 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 480, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e1e24 0%, #1e3a8a 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MailCheck size={22} color="#60a5fa" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                Xác Thực Email Tài Khoản (CN01.03)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#cbd5e1' }}>
                VerifyEmailFrm — Kích hoạt tài khoản EduTutor
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <CheckCircle2 size={36} color="#16a34a" />
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#166534', margin: '0 0 8px' }}>
                Xác Thực Email Thành Công!
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 20px' }}>
                Tài khoản của bạn đã được kích hoạt đầy đủ quyền hạn. Bạn có thể đăng nhập để bắt đầu trải nghiệm học tập và thuê gia sư.
              </p>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenLogin) onOpenLogin();
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                Đăng nhập ngay <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleManualVerify}>
              {errorMsg && (
                <div className="auth-alert error" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
                  <AlertCircle size={16} /> <span>{errorMsg}</span>
                </div>
              )}

              <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px' }}>
                Hệ thống đã gửi một liên kết xác thực đến hộp thư email của bạn. Vui lòng nhấp vào liên kết trong email hoặc dán mã xác minh token vào ô bên dưới:
              </p>

              <div style={{ marginBottom: 18 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Mã Token hoặc Liên kết xác thực:
                </label>
                <input
                  type="text"
                  placeholder="Dán mã token hoặc link xác minh..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !token.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#2563eb',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Đang xác minh mã...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Xác Nhận Kích Hoạt Tài Khoản
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

