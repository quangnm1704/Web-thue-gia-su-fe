import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  Link as LinkIcon,
  Image,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Sparkles
} from 'lucide-react';
import { userApi } from '../services/api';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'
];

export default function UserProfileModal({ isOpen, onClose, currentUser, onUserUpdated }) {
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [zaloLink, setZaloLink] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setDisplayName(currentUser.displayName || currentUser.name || '');
      setPhone(currentUser.phone || '');
      setZaloLink(currentUser.zaloLink || '');
      setAvatarUrl(currentUser.avatarUrl || currentUser.avatar || '');
      setSuccessMsg('');
      setErrorMsg('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg('Vui lòng nhập tên hiển thị!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        displayName: displayName.trim(),
        phone: phone.trim(),
        zaloLink: zaloLink.trim(),
        avatarUrl: avatarUrl.trim()
      };

      const res = await userApi.updateProfile(currentUser.id, payload);
      setSuccessMsg('Cập nhật hồ sơ tài khoản thành công!');

      const updatedUser = {
        ...currentUser,
        displayName: displayName.trim(),
        phone: phone.trim(),
        zaloLink: zaloLink.trim(),
        avatarUrl: avatarUrl.trim(),
        avatar: avatarUrl.trim()
      };

      if (onUserUpdated) {
        onUserUpdated(updatedUser);
      }
    } catch (err) {
      setErrorMsg('Lỗi cập nhật hồ sơ: ' + (err.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 580, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose} title="Đóng">
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 30px 18px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller" style={{ background: '#4f46e5' }}>
              <User size={13} style={{ display: 'inline', marginRight: 4 }} /> Hồ Sơ Cá Nhân
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.45rem', marginTop: 8 }}>
              Quản Lý Tài Khoản Của Tôi
            </h2>
            <p className="detail-sub" style={{ fontSize: '0.86rem' }}>
              Cập nhật thông tin định danh, số điện thoại liên hệ và ảnh đại diện hiển thị trên hệ thống EduTutor.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 30px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {successMsg && (
            <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#059669" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={18} color="#dc2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Avatar Preview & Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <img
              src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
              alt="Avatar"
              style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1', flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: 6 }}>
                Chọn ảnh đại diện nhanh:
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`preset-${idx}`}
                    onClick={() => setAvatarUrl(preset)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: avatarUrl === preset ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      transform: avatarUrl === preset ? 'scale(1.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title="Bấm để chọn ảnh này"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Email (Readonly) */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Mail size={15} /> Địa chỉ Email (Định danh tài khoản):
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', color: '#64748b', fontSize: '0.9rem' }}>
              <span style={{ flex: 1 }}>{currentUser?.email || currentUser?.username}</span>
              <span style={{ fontSize: '0.72rem', background: '#e0e7ff', color: '#4338ca', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                {currentUser?.role === 'TUTOR' ? 'Gia sư' : (currentUser?.role === 'ADMIN' ? 'Admin' : 'Học viên')}
              </span>
            </div>
          </div>

          {/* Display Name */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <User size={15} color="#4f46e5" /> Tên hiển thị công khai: *
            </label>
            <input
              type="text"
              className="ud-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="VD: Nguyễn An, Thu Trang..."
              required
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
            />
          </div>

          {/* Phone */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Phone size={15} color="#059669" /> Số điện thoại liên hệ:
            </label>
            <input
              type="tel"
              className="ud-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="VD: 0912345678"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
            />
          </div>

          {/* Zalo Link */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <LinkIcon size={15} color="#2563eb" /> Liên kết Zalo / Mạng xã hội:
            </label>
            <input
              type="url"
              className="ud-input"
              value={zaloLink}
              onChange={(e) => setZaloLink(e.target.value)}
              placeholder="VD: https://zalo.me/0912345678"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label style={{ fontSize: '0.84rem', fontWeight: 700, color: '#334155', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Image size={15} color="#8b5cf6" /> Hoặc dán link ảnh đại diện (URL):
            </label>
            <input
              type="url"
              className="ud-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.92rem' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 10, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ padding: '9px 18px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 24px',
                borderRadius: 6,
                border: 'none',
                background: '#4f46e5',
                color: '#ffffff',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

