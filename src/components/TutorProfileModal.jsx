import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Sparkles,
  Plus
} from 'lucide-react';
import { tutorProfileApi } from '../services/api';

export default function TutorProfileModal({
  isOpen,
  onClose,
  currentUser,
  onProfileUpdated
}) {
  const [subjects, setSubjects] = useState('');
  const [schedule, setSchedule] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const commonSubjects = [
    'Toán THPT',
    'Toán THCS',
    'Vật Lý 10-12',
    'Hóa Học THPT',
    'Tiếng Anh / IELTS',
    'Ngữ Văn',
    'Lập Trình Python',
    'Lập Trình Web Fullstack',
    'Luyện Thi Vào 10'
  ];

  const commonTimeslots = [
    'Tối T2, T4, T6 (19:30 - 21:30)',
    'Tối T3, T5, T7 (19:00 - 21:00)',
    'Sáng Thứ 7, Chủ Nhật (08:30 - 11:30)',
    'Chiều Thứ 7, Chủ Nhật (14:00 - 17:00)',
    'Các buổi tối trong tuần',
    'Linh hoạt theo thỏa thuận học viên'
  ];

  useEffect(() => {
    if (isOpen && currentUser) {
      setSuccessMsg('');
      setErrorMsg('');
      fetchProfile();
    }
  }, [isOpen, currentUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await tutorProfileApi.getMyProfile();
      if (data) {
        setSubjects(data.subjectsCanTeach || '');
        setSchedule(data.availableSchedule || '');
        setBio(data.bio || '');
      }
    } catch (err) {
      console.warn('Chưa có profile hoặc lỗi lấy profile:', err.message);
      // Giữ giá trị mặc định nếu lần đầu mở
      if (!subjects) setSubjects('Toán 10-12, Luyện thi THPT Quốc Gia');
      if (!schedule) setSchedule('Tối Thứ 2, 4, 6 (19:30 - 21:30) & Sáng Chủ Nhật (08:30 - 11:30)');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = (sub) => {
    if (!subjects.includes(sub)) {
      setSubjects(prev => prev ? `${prev}, ${sub}` : sub);
    }
  };

  const handleAddTimeslot = (slot) => {
    if (!schedule.includes(slot)) {
      setSchedule(prev => prev ? `${prev}; ${slot}` : slot);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!subjects.trim()) {
      setErrorMsg('Vui lòng nhập ít nhất 1 môn học bạn có thể dạy!');
      return;
    }
    if (!schedule.trim()) {
      setErrorMsg('Vui lòng nhập lịch rảnh để học sinh có thể theo dõi và lựa chọn!');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await tutorProfileApi.updateMyProfile({
        subjectsCanTeach: subjects.trim(),
        availableSchedule: schedule.trim(),
        bio: bio.trim()
      });
      setSuccessMsg('Đã lưu thành công môn dạy và lịch rảnh! Học sinh hiện đã có thể xem lịch của bạn.');
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => {
        setSuccessMsg('');
      }, 4000);
    } catch (err) {
      setErrorMsg('Không thể lưu hồ sơ: ' + (err.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 740, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">Cổng Quản Lý Gia Sư</span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              📋 Đăng Môn Học & Lịch Rảnh Dạy Kèm
            </h2>
            <p className="detail-sub">
              Cung cấp các môn bạn nhận dạy và khung giờ rảnh trong tuần để học sinh dễ dàng tìm kiếm, lựa chọn và đặt lịch.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 32px' }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ marginBottom: 16 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '12px 16px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle2 size={18} color="#16a34a" /> <span>{successMsg}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p>Đang tải thông tin hồ sơ gia sư từ hệ thống...</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              {/* 1. Môn học nhận dạy */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  <BookOpen size={16} color="#a435f0" /> Các môn nhận dạy kèm (*):
                </label>
                <input
                  type="text"
                  required
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="Ví dụ: Toán 10-12, Ôn thi THPT Quốc Gia, Tiếng Anh Giao Tiếp..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box'
                  }}
                />
                
                {/* Gợi ý chọn nhanh môn học */}
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 5 }}>
                    💡 Bấm để thêm nhanh môn học:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {commonSubjects.map((sub, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddSubject(sub)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: 20,
                          padding: '3px 10px',
                          fontSize: '0.78rem',
                          color: '#334155',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={12} /> {sub}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Lịch rảnh trong tuần */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  <Clock size={16} color="#16a34a" /> Khung giờ & Lịch rảnh trong tuần (*):
                </label>
                <textarea
                  rows={3}
                  required
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
                  placeholder="Ví dụ: Tối T2, T4, T6 (19:30 - 21:30); Sáng Chủ Nhật (08:30 - 11:30)..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Gợi ý chọn nhanh khung giờ */}
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginBottom: 5 }}>
                    💡 Bấm để thêm nhanh khung giờ rảnh:
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {commonTimeslots.map((slot, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleAddTimeslot(slot)}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          borderRadius: 20,
                          padding: '3px 10px',
                          fontSize: '0.78rem',
                          color: '#166534',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4
                        }}
                      >
                        <Plus size={12} /> {slot}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Giới thiệu bản thân & Phương pháp */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Giới thiệu phương pháp giảng dạy & cam kết:
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Mô tả ngắn về kinh nghiệm, chứng chỉ, phong cách dạy để học sinh và phụ huynh tin tưởng..."
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.9rem',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: '#475569'
                  }}
                >
                  Đóng
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 24px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#a435f0',
                    color: '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 4px rgba(164, 53, 240, 0.3)'
                  }}
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Lưu Môn Học & Lịch Rảnh
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
