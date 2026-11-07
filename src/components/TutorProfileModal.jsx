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
  Plus,
  PlusCircle,
  DollarSign
} from 'lucide-react';
import { tutorProfileApi, courseApi } from '../services/api';

export default function TutorProfileModal({
  isOpen,
  onClose,
  currentUser,
  initialTab = 'profile', // 'profile' | 'create-class'
  onProfileUpdated,
  onCourseCreated
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile' | 'create-class'

  // Tab 1: Profile state
  const [subjects, setSubjects] = useState('');
  const [schedule, setSchedule] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Tab 2: Create class/course state
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState('350000');
  const [creatingCourse, setCreatingCourse] = useState(false);

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
      setActiveTab(initialTab);
      fetchProfile();
    }
  }, [isOpen, currentUser, initialTab]);

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

  // Lưu môn dạy & Lịch rảnh
  const handleSaveProfile = async (e) => {
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
      setSuccessMsg('Đã lưu thành công môn dạy và lịch rảnh! Học sinh hiện đã thấy thông tin trên trang chủ.');
      if (onProfileUpdated) onProfileUpdated();
    } catch (err) {
      setErrorMsg('Không thể lưu hồ sơ: ' + (err.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  // Mở lớp / Tạo khóa học mới
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseTitle.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề lớp học / khóa học!');
      return;
    }

    const priceNum = parseInt(coursePrice, 10);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg('Vui lòng nhập mức học phí hợp lệ!');
      return;
    }

    setCreatingCourse(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await courseApi.createCourse({
        title: courseTitle.trim(),
        price: priceNum,
        platformFeePercent: 10
      });
      setSuccessMsg(`🎉 Đã đăng thành công lớp dạy / khóa học mới: "${courseTitle.trim()}"! Lớp đã được thêm vào hệ thống.`);
      setCourseTitle('');
      if (onCourseCreated) onCourseCreated();
    } catch (err) {
      setErrorMsg('Lỗi tạo lớp học: ' + (err.data?.message || err.message));
    } finally {
      setCreatingCourse(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 760, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Header */}
        <div className="detail-modal-hero" style={{ padding: '24px 32px 16px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">Trung Tâm Giảng Dạy & Lớp Học</span>
            <h2 className="detail-title" style={{ fontSize: '1.6rem', marginTop: 8 }}>
              {activeTab === 'profile' ? '📋 Đăng Môn Nhận Dạy & Lịch Rảnh' : '🎓 Đăng Ký Thêm Lớp Dạy / Khóa Học Mới'}
            </h2>
            <p className="detail-sub">
              Dành riêng cho Gia sư: Quản lý môn học, lịch rảnh dạy kèm 1-1 và mở các lớp giảng dạy mới trên hệ thống.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 32px' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('profile'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: activeTab === 'profile' ? '#a435f0' : '#64748b',
              borderBottom: activeTab === 'profile' ? '3px solid #a435f0' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Calendar size={16} /> 1. Đăng Môn & Lịch Rảnh Dạy Kèm
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('create-class'); setErrorMsg(''); setSuccessMsg(''); }}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.92rem',
              color: activeTab === 'create-class' ? '#a435f0' : '#64748b',
              borderBottom: activeTab === 'create-class' ? '3px solid #a435f0' : '3px solid transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <PlusCircle size={16} /> 2. Mở Lớp Dạy / Khóa Học Mới
          </button>
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
              <p>Đang tải dữ liệu hồ sơ gia sư từ hệ thống...</p>
            </div>
          ) : activeTab === 'profile' ? (
            /* ================= TAB 1: PROFILE & SCHEDULE ================= */
            <form onSubmit={handleSaveProfile}>
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
                  Giới thiệu phương pháp giảng dạy & kinh nghiệm:
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
          ) : (
            /* ================= TAB 2: CREATE NEW CLASS / COURSE ================= */
            <form onSubmit={handleCreateCourse}>
              <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#6d28d9', fontWeight: 700, fontSize: '0.95rem' }}>
                  <Sparkles size={18} /> Mở Lớp Học / Khóa Học Trực Tuyến Mới
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#5b21b6', lineHeight: 1.5 }}>
                  Khóa học sau khi tạo sẽ xuất hiện ngay trên trang chủ để học viên có thể tìm kiếm, thêm vào giỏ hàng và thanh toán ghi danh học tập.
                </p>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                  Tiêu đề lớp học / khóa học (*):
                </label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  placeholder="Ví dụ: Lớp Luyện Thi Toán 12 Cấp Tốc - Chuyên Đề Hàm Số & Tích Phân"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.92rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Học phí niêm yết (VNĐ) (*):
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    value={coursePrice}
                    onChange={(e) => setCoursePrice(e.target.value)}
                    placeholder="350000"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #cbd5e1',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                    Ví dụ: 350.000 đ
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    Phí nền tảng (Platform Fee):
                  </label>
                  <input
                    type="text"
                    disabled
                    value="10% (Theo quy chuẩn sàn)"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 6,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      color: '#64748b',
                      fontSize: '0.92rem',
                      boxSizing: 'border-box'
                    }}
                  />
                  <span style={{ fontSize: '0.78rem', color: '#15803d', marginTop: 4, display: 'block' }}>
                    Gia sư thực nhận: 90% học phí khi học sinh ghi danh
                  </span>
                </div>
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
                  disabled={creatingCourse}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 6,
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    cursor: creatingCourse ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  {creatingCourse ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                  Xác Nhận Mở Lớp Học
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
