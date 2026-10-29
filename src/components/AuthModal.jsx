import React, { useState } from 'react';
import { X, GraduationCap, Lock, Mail, User, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { authApi, getRoleFromToken } from '../services/api';

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [role, setRole] = useState('STUDENT'); // 'STUDENT' | 'TUTOR'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      if (mode === 'login') {
        // 1. Đăng nhập qua BE: POST /auth/login với displayName hoặc email
        const loginRes = await authApi.login(displayName || email, password);
        const token = loginRes?.accessToken || loginRes?.token || authApi.getToken();
        const tokenRole = getRoleFromToken(token);
        
        // 2. Lấy thông tin user
        let userInfo = null;
        try {
          userInfo = await authApi.getMyInfo();
        } catch (err) {
          console.warn('Không thể gọi getMyInfo:', err);
        }

        if (!userInfo) {
          userInfo = {
            displayName: displayName || email,
            email: (displayName && displayName.includes('@')) ? displayName : (email || ''),
            role: tokenRole || role || 'STUDENT'
          };
        } else if (tokenRole) {
          userInfo.role = tokenRole;
        }

        setSuccessMessage('Đăng nhập thành công!');
        if (onLoginSuccess) {
          onLoginSuccess(userInfo);
        }
        setTimeout(() => {
          onClose();
        }, 800);
      } else {
        // Đăng ký qua BE: POST /users
        if (password.length < 8) {
          setErrorMessage('Mật khẩu phải có tối thiểu 8 ký tự (theo quy định của Backend).');
          setLoading(false);
          return;
        }

        await authApi.register({
          email: email,
          password: password,
          displayName: displayName,
          role: role
        });

        setSuccessMessage('Đăng ký tài khoản thành công! Vui lòng kiểm tra email để xác thực.');
        setTimeout(() => {
          setMode('login');
          setSuccessMessage('');
        }, 2000);
      }
    } catch (err) {
      console.error('Lỗi API Backend:', err);
      const serverMsg = err.data?.message || err.message || 'Lỗi kết nối Backend';
      setErrorMessage(`Backend báo lỗi: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div className="ud-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="ud-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="ud-modal-header">
          <div className="modal-logo">
            <GraduationCap size={32} />
          </div>
          <h3>{mode === 'login' ? 'Đăng nhập tài khoản EduTutor' : 'Tạo tài khoản mới'}</h3>
          <p className="modal-sub">
            {mode === 'login' 
              ? 'Đăng nhập để kết nối với Gia sư và Khóa học' 
              : 'Gia nhập cộng đồng học viên & gia sư chuyên nghiệp'}
          </p>
        </div>

        {/* Thông báo lỗi hoặc thành công */}
        {errorMessage && (
          <div className="auth-alert error">
            <AlertCircle size={16} /> <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} /> <span>{successMessage}</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="ud-auth-tabs">
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Đăng nhập
          </button>
          <button 
            type="button"
            className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
          >
            Đăng ký
          </button>
        </div>

        {mode === 'register' && (
          <div className="ud-role-selector">
            <label className="role-label">Bạn tham gia với vai trò:</label>
            <div className="role-options">
              <button 
                type="button" 
                className={`role-option-btn ${role === 'STUDENT' ? 'selected' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                🎓 Học viên
              </button>
              <button 
                type="button" 
                className={`role-option-btn ${role === 'TUTOR' ? 'selected' : ''}`}
                onClick={() => setRole('TUTOR')}
              >
                👨‍🏫 Gia sư
              </button>
            </div>
          </div>
        )}

        <form className="ud-auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{mode === 'login' ? 'Tên hiển thị hoặc Email' : 'Họ và tên hiển thị'}</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                placeholder="Ví dụ: admin@gmail.com hoặc user001" 
                required 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="form-group">
              <label>Địa chỉ Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="name@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Tối thiểu 8 ký tự" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {mode === 'login' && (
            <div style={{ fontSize: '0.78rem', color: '#475569', background: '#f8fafc', padding: '10px 12px', borderRadius: 6, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>💡 Tài khoản kiểm thử:</div>
              <div>• <strong>Admin (Quản trị):</strong> <code style={{ color: '#dc2626' }}>admin@gmail.com</code> / <code>12345678</code></div>
              <div>• <strong>Gia sư:</strong> <code style={{ color: '#7c3aed' }}>user001</code> / <code>12345678</code></div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Đang gửi Backend...' : (mode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản')}
          </button>
        </form>
      </div>
    </div>
  );
}
