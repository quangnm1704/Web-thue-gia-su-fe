import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  FileText,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Clock,
  Send,
  ShieldCheck,
  BookOpen,
  Video,
  Trash2,
  UserCheck,
  Loader2
} from 'lucide-react';
import { tutorApplicationApi } from '../services/api';

export default function TutorApplicationModal({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onOpenAdmin
}) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingApp, setExistingApp] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form Fields matching Database & DTO
  const [bio, setBio] = useState('');
  const [subjectsCanTeach, setSubjectsCanTeach] = useState('');
  const [cvUrl, setCvUrl] = useState('');
  const [testSubmission, setTestSubmission] = useState('');

  // Fetch my application whenever modal opens
  useEffect(() => {
    if (isOpen && currentUser && currentUser.role === 'STUDENT') {
      loadMyApplication();
    } else {
      setExistingApp(null);
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentUser]);

  const loadMyApplication = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const app = await tutorApplicationApi.getMyApplication();
      setExistingApp(app || null);
    } catch (err) {
      // 404 or no application found
      setExistingApp(null);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!bio.trim()) {
      setErrorMsg('Vui lòng nhập giới thiệu bản thân và kinh nghiệm giảng dạy.');
      return;
    }
    if (!subjectsCanTeach.trim()) {
      setErrorMsg('Vui lòng nhập các môn học bạn có thể giảng dạy.');
      return;
    }
    if (!cvUrl.trim()) {
      setErrorMsg('Vui lòng cung cấp link CV hoặc hồ sơ năng lực của bạn.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await tutorApplicationApi.createApplication({
        bio: bio.trim(),
        subjectsCanTeach: subjectsCanTeach.trim(),
        cvUrl: cvUrl.trim(),
        testSubmission: testSubmission.trim() || ''
      });
      setSuccessMsg('Nộp hồ sơ ứng tuyển thành công! Hồ sơ đã được chuyển đến Ban quản trị (Admin) để xét duyệt.');
      setExistingApp(res);
      // Reset form
      setBio('');
      setSubjectsCanTeach('');
      setCvUrl('');
      setTestSubmission('');
    } catch (err) {
      setErrorMsg(err.data?.message || err.message || 'Không thể gửi hồ sơ ứng tuyển. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn ứng tuyển gia sư hiện tại không?')) {
      return;
    }
    try {
      await tutorApplicationApi.deleteMyApplication();
      alert('Đã hủy đơn ứng tuyển thành công.');
      setExistingApp(null);
    } catch (err) {
      alert('Lỗi hủy đơn: ' + (err.data?.message || err.message));
    }
  };

  return (
      <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1200 }}>
        <div
          className="ud-detail-modal-card animate-fade-in"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: 680, width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: 0 }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 10
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: '#f5f3ff',
                color: '#a435f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                  Đăng Ký Trở Thành Gia Sư & Giảng Viên
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Nền tảng kiểm định hồ sơ, bảo mật và chỉ được xét duyệt bởi Quản trị viên (Admin)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4 }}
            >
              <X size={22} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '24px' }}>
            {/* Case 1: Chưa đăng nhập */}
            {!currentUser && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <AlertCircle size={34} />
                </div>
                <h4 style={{ fontSize: '1.15rem', color: '#1e293b', marginBottom: 8 }}>
                  Yêu cầu tài khoản Học viên
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Để đảm bảo tính xác thực, bạn cần đăng nhập tài khoản học viên trên hệ thống EduTutor trước khi điền thông tin và nộp hồ sơ ứng tuyển làm Gia sư.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => { onClose(); onOpenAuth('login'); }}
                  >
                    Đăng nhập tài khoản
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => { onClose(); onOpenAuth('register'); }}
                  >
                    Đăng ký tài khoản mới
                  </button>
                </div>
              </div>
            )}

            {/* Case 2: Đã là Gia sư */}
            {currentUser && currentUser.role === 'TUTOR' && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle size={36} />
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#15803d', marginBottom: 8 }}>
                  Bạn đã là Gia sư chính thức trên EduTutor!
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Tài khoản <strong>{currentUser.displayName}</strong> của bạn đã có đầy đủ quyền giảng dạy, mở khóa học online và nhận học viên kèm 1-1.
                </p>
                <button className="btn btn-primary" onClick={onClose}>
                  Đóng thông báo
                </button>
              </div>
            )}

            {/* Case 3: Là Admin */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <ShieldCheck size={36} />
                </div>
                <h4 style={{ fontSize: '1.2rem', color: '#5b21b6', marginBottom: 8 }}>
                  Tài khoản Quản trị viên (Admin)
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', maxWidth: 480, margin: '0 auto 20px', lineHeight: 1.5 }}>
                  Bạn đang đăng nhập với tư cách Admin. Bạn có toàn quyền xem xét hồ sơ năng lực, bằng cấp và duyệt các đơn ứng tuyển gia sư của học viên.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => { onClose(); if (onOpenAdmin) onOpenAdmin(); }}
                  >
                    Mở Bảng Quản Trị Admin Duyệt Đơn
                  </button>
                  <button className="btn btn-outline" onClick={onClose}>
                    Đóng
                  </button>
                </div>
              </div>
            )}

            {/* Case 4: Là Học sinh (STUDENT) */}
            {currentUser && currentUser.role === 'STUDENT' && (
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 10px', color: '#a435f0' }} />
                    <p style={{ color: '#64748b' }}>Đang kiểm tra trạng thái hồ sơ ứng tuyển của bạn...</p>
                  </div>
                ) : existingApp ? (
                  /* Sub-case 4A: Đã có hồ sơ */
                  <div>
                    {/* Status Banner */}
                    <div style={{
                      padding: '16px 20px',
                      borderRadius: 10,
                      marginBottom: 24,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      background: existingApp.status === 'APPROVED' ? '#f0fdf4' : (existingApp.status === 'REJECTED' ? '#fef2f2' : '#fffbeb'),
                      border: `1px solid ${existingApp.status === 'APPROVED' ? '#bbf7d0' : (existingApp.status === 'REJECTED' ? '#fecaca' : '#fde68a')}`
                    }}>
                      {existingApp.status === 'APPROVED' ? (
                        <CheckCircle size={28} color="#16a34a" />
                      ) : existingApp.status === 'REJECTED' ? (
                        <AlertCircle size={28} color="#dc2626" />
                      ) : (
                        <Clock size={28} color="#d97706" />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: existingApp.status === 'APPROVED' ? '#166534' : (existingApp.status === 'REJECTED' ? '#991b1b' : '#92400e') }}>
                            Trạng thái đơn: {existingApp.status === 'APPROVED' ? 'ĐÃ ĐƯỢC DUYỆT' : (existingApp.status === 'REJECTED' ? 'TỪ CHỐI / CẦN BỔ SUNG' : 'ĐANG CHỜ ADMIN XÉT DUYỆT (PENDING)')}
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#475569' }}>
                          {existingApp.status === 'APPROVED'
                            ? 'Chúc mừng bạn! Hồ sơ đã được duyệt. Vui lòng đăng nhập lại để cập nhật quyền Gia sư.'
                            : existingApp.status === 'REJECTED'
                              ? `Ghi chú từ Ban quản trị: ${existingApp.adminNote || 'Chưa đạt yêu cầu thẩm định chuyên môn.'}`
                              : 'Hồ sơ của bạn đã được gửi an toàn lên hệ thống và chỉ Admin mới có quyền xem để xét duyệt.'}
                        </p>
                      </div>
                    </div>

                    {/* Application Details Card */}
                    <div style={{ background: '#f8fafc', borderRadius: 10, padding: '20px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ margin: '0 0 16px', fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #e2e8f0', paddingBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={18} color="#a435f0" /> Chi tiết hồ sơ đã nộp
                      </h4>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ fontWeight: 600, color: '#475569' }}>Ứng viên: </span>
                          <span style={{ color: '#0f172a', fontWeight: 500 }}>{currentUser.displayName} ({currentUser.email})</span>
                        </div>

                        {existingApp.subjectsCanTeach && (
                          <div>
                            <span style={{ fontWeight: 600, color: '#475569' }}>Môn học có thể dạy: </span>
                            <span style={{ color: '#0f172a' }}>{existingApp.subjectsCanTeach}</span>
                          </div>
                        )}

                        {existingApp.bio && (
                          <div>
                            <span style={{ fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>Giới thiệu & Kinh nghiệm: </span>
                            <div style={{ background: '#fff', padding: '10px 14px', borderRadius: 6, border: '1px solid #e2e8f0', color: '#334155', whiteSpace: 'pre-line' }}>
                              {existingApp.bio}
                            </div>
                          </div>
                        )}

                        <div>
                          <span style={{ fontWeight: 600, color: '#475569' }}>Link CV / Hồ sơ năng lực: </span>
                          <a
                            href={existingApp.cvUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#a435f0', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                          >
                            {existingApp.cvUrl} <ExternalLink size={14} />
                          </a>
                        </div>

                        {existingApp.testSubmission && (
                          <div>
                            <span style={{ fontWeight: 600, color: '#475569' }}>Link Video / Bài kiểm tra: </span>
                            <a
                              href={existingApp.testSubmission}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              {existingApp.testSubmission} <ExternalLink size={14} />
                            </a>
                          </div>
                        )}

                        {existingApp.createdAt && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>
                            Thời gian nộp: {new Date(existingApp.createdAt).toLocaleString('vi-VN')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions for Existing Application */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
                      {existingApp.status === 'PENDING' && (
                        <button
                          onClick={handleDeleteApplication}
                          style={{
                            background: 'none',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            padding: '8px 16px',
                            borderRadius: 6,
                            fontSize: '0.86rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                          }}
                        >
                          <Trash2 size={15} /> Hủy đơn ứng tuyển
                        </button>
                      )}
                      {existingApp.status === 'REJECTED' && (
                        <button
                          onClick={() => setExistingApp(null)}
                          className="btn btn-primary"
                        >
                          Nộp lại hồ sơ mới
                        </button>
                      )}
                      <button className="btn btn-outline" onClick={onClose} style={{ marginLeft: 'auto' }}>
                        Đóng
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Sub-case 4B: Form điền thông tin ứng tuyển */
                  <form onSubmit={handleSubmit}>
                    {/* Privacy Notice */}
                    <div style={{
                      padding: '12px 16px',
                      borderRadius: 8,
                      background: '#f5f3ff',
                      border: '1px solid #ddd6fe',
                      marginBottom: 20,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: '0.85rem',
                      color: '#6b21a8'
                    }}>
                      <ShieldCheck size={20} color="#7c3aed" style={{ flexShrink: 0 }} />
                      <span>
                        <strong>Quyền riêng tư:</strong> Hồ sơ và CV của bạn được mã hóa an toàn và <strong>CHỈ Admin</strong> mới có quyền truy cập để duyệt hồ sơ gia sư.
                      </span>
                    </div>

                    {errorMsg && (
                      <div style={{ padding: '10px 14px', borderRadius: 6, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.86rem', marginBottom: 16 }}>
                        {errorMsg}
                      </div>
                    )}

                    {successMsg && (
                      <div style={{ padding: '10px 14px', borderRadius: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: '0.86rem', marginBottom: 16 }}>
                        {successMsg}
                      </div>
                    )}

                    {/* Field: User Name & Email */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                          Họ và tên ứng viên
                        </label>
                        <input
                          type="text"
                          value={currentUser.displayName || ''}
                          readOnly
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                          Email liên hệ
                        </label>
                        <input
                          type="text"
                          value={currentUser.email || ''}
                          readOnly
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#64748b' }}
                        />
                      </div>
                    </div>

                    {/* Field: Subjects can teach */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Các môn học có thể giảng dạy <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Toán THPT (10-12), Luyện thi Chuyên, Lập trình Java Web, IELTS Speaking..."
                        value={subjectsCanTeach}
                        onChange={(e) => setSubjectsCanTeach(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                        Điền các môn hoặc cấp học bạn tự tin có chuyên môn và kinh nghiệm truyền đạt tốt nhất.
                      </span>
                    </div>

                    {/* Field: Bio & Teaching Experience */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Giới thiệu bản thân & Kinh nghiệm sư phạm <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Mô tả học vấn (trường ĐH, chuyên ngành), bằng cấp/chứng chỉ, số năm kinh nghiệm dạy kèm, thành tích học sinh từng kèm hoặc phương pháp giảng dạy..."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontFamily: 'inherit' }}
                      />
                    </div>

                    {/* Field: CV URL */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Link CV / Hồ sơ năng lực (Google Drive, LinkedIn, PDF...) <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://drive.google.com/file/d/... hoặc link portfolio/CV trực tuyến"
                        value={cvUrl}
                        onChange={(e) => setCvUrl(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                        Lưu ý: Nếu dùng Google Drive, vui lòng bật quyền chia sẻ "Bất kỳ ai có đường liên kết đều có thể xem".
                      </span>
                    </div>

                    {/* Field: Test Submission / Video Demo */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        Link Video dạy thử hoặc Bài kiểm tra năng lực (Tùy chọn)
                      </label>
                      <input
                        type="url"
                        placeholder="https://youtube.com/watch?... hoặc link Drive video giảng thử 5-10 phút"
                        value={testSubmission}
                        onChange={(e) => setTestSubmission(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: 4, display: 'block' }}>
                        Cung cấp video dạy thử hoặc bài giải mẫu sẽ giúp hồ sơ của bạn được Admin duyệt ưu tiên nhanh hơn.
                      </span>
                    </div>

                    {/* Form Actions */}
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={onClose}
                        disabled={submitting}
                      >
                        Hủy bỏ
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px' }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" /> Đang gửi hồ sơ...
                          </>
                        ) : (
                          <>
                            <Send size={16} /> Nộp hồ sơ ứng tuyển Gia sư
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      );
}

