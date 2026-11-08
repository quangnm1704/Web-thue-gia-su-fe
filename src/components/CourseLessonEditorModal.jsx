import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  PlusCircle,
  Video,
  Link,
  Calendar,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  ChevronRight,
  ExternalLink,
  Layers
} from 'lucide-react';
import { courseApi, lessonApi } from '../services/api';

export default function CourseLessonEditorModal({
  isOpen,
  onClose,
  currentUser,
  onCoursesUpdated = null
}) {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form mode: 'none' | 'add' | 'edit'
  const [lessonFormMode, setLessonFormMode] = useState('none');
  const [editingLessonId, setEditingLessonId] = useState(null);

  // Lesson form state
  const [title, setTitle] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);
  const [mediaUrl, setMediaUrl] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [startsAt, setStartsAt] = useState('');

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3000);
  };

  const fetchTutorCourses = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const res = await courseApi.getByTutorId(currentUser.id);
      const list = Array.isArray(res) ? res : (res?.result || []);
      setCourses(list);
      if (list.length > 0 && !selectedCourse) {
        setSelectedCourse(list[0]);
      }
    } catch (err) {
      console.warn('Lỗi tải khóa học của gia sư:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLessons = async (courseId) => {
    if (!courseId) return;
    try {
      const res = await lessonApi.getByCourse(courseId);
      const list = Array.isArray(res) ? res : (res?.result || []);
      setLessons(list);
    } catch (err) {
      console.warn('Lỗi tải bài học:', err);
      setLessons([]);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchTutorCourses();
    }
  }, [isOpen, currentUser?.id]);

  useEffect(() => {
    if (selectedCourse?.id) {
      fetchLessons(selectedCourse.id);
      setLessonFormMode('none');
      setEditingLessonId(null);
    }
  }, [selectedCourse?.id]);

  if (!isOpen) return null;

  const handleOpenAddLesson = () => {
    setTitle('');
    setLessonOrder((lessons.length || 0) + 1);
    setMediaUrl('');
    setMeetingUrl('');
    setStartsAt('');
    setEditingLessonId(null);
    setLessonFormMode('add');
    setErrorMsg('');
  };

  const handleOpenEditLesson = (lesson) => {
    setTitle(lesson.title || '');
    setLessonOrder(lesson.lessonOrder || 1);
    setMediaUrl(lesson.mediaUrl || '');
    setMeetingUrl(lesson.meetingUrl || '');
    setStartsAt(lesson.startsAt ? new Date(lesson.startsAt).toISOString().slice(0, 16) : '');
    setEditingLessonId(lesson.id);
    setLessonFormMode('edit');
    setErrorMsg('');
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài học.');
      return;
    }

    if (!selectedCourse?.id) {
      setErrorMsg('Chưa chọn khóa học.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (lessonFormMode === 'add') {
        const payload = {
          title: title.trim(),
          lessonOrder: parseInt(lessonOrder, 10) || 1,
          mediaUrl: mediaUrl.trim() || null,
          meetingUrl: meetingUrl.trim() || null,
          startsAt: startsAt ? new Date(startsAt).toISOString() : null
        };

        await lessonApi.create(selectedCourse.id, payload);
        showToast('Đã thêm bài học mới thành công!');
      } else {
        const payload = {
          title: title.trim(),
          mediaUrl: mediaUrl.trim() || null,
          meetingUrl: meetingUrl.trim() || null
        };

        await lessonApi.update(editingLessonId, payload);
        showToast('Đã cập nhật bài học thành công!');
      }

      setLessonFormMode('none');
      setEditingLessonId(null);
      await fetchLessons(selectedCourse.id);
      if (onCoursesUpdated) onCoursesUpdated();
    } catch (err) {
      console.error('Lỗi lưu bài học:', err);
      setErrorMsg('Lỗi: ' + (err.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài học này?')) return;
    try {
      await lessonApi.delete(lessonId);
      showToast('Đã xóa bài học.');
      await fetchLessons(selectedCourse.id);
    } catch (err) {
      alert('Không thể xóa bài học: ' + (err.data?.message || err.message));
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 960, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e1e24 0%, #2b1055 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(164, 53, 240, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={24} color="#c084fc" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Quản Lý Khóa Học & Bài Học (CN04.02)
                </h3>
                <span style={{ background: '#7c3aed', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                  CourseEditorFrm
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                Thêm bài học, tải link video học liệu & phòng học trực tuyến cho học viên
              </p>
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body: 2-column layout */}
        <div style={{ display: 'flex', minHeight: 460, maxHeight: '78vh' }}>
          
          {/* Left Column: List of Tutor's Courses */}
          <div style={{ width: 300, borderRight: '1px solid #e2e8f0', background: '#f8fafc', padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                Khóa học của bạn ({courses.length})
              </span>
            </div>

            {courses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                Chưa có khóa học nào. Hãy đăng ký lớp dạy mới ở mục "Đăng ký thêm lớp dạy".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {courses.map((c) => {
                  const isSel = selectedCourse?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourse(c)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: isSel ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                        background: isSel ? '#f5f3ff' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <strong style={{ fontSize: '0.88rem', color: isSel ? '#6b21a8' : '#0f172a', display: 'block', marginBottom: 4 }}>
                        {c.title}
                      </strong>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                        <span>Môn: {c.subject || c.category || 'Học tập'}</span>
                        <strong style={{ color: '#059669' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(c.price || 0)}
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Lessons list & Lesson Editor Form */}
          <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', background: '#fff' }}>
            {notification && (
              <div className="auth-alert success" style={{ marginBottom: 16, backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '10px 14px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}>
                <CheckCircle2 size={16} color="#16a34a" /> <span>{notification}</span>
              </div>
            )}

            {errorMsg && (
              <div className="auth-alert error" style={{ marginBottom: 16, fontSize: '0.85rem' }}>
                <AlertCircle size={16} /> <span>{errorMsg}</span>
              </div>
            )}

            {selectedCourse ? (
              <div>
                {/* Header of selected course */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 18 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {selectedCourse.title}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                      Tổng số bài học: <strong>{lessons.length}</strong> bài
                    </span>
                  </div>

                  {lessonFormMode === 'none' && (
                    <button
                      type="button"
                      onClick={handleOpenAddLesson}
                      style={{
                        padding: '8px 14px',
                        background: '#7c3aed',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <PlusCircle size={16} /> Thêm bài học mới
                    </button>
                  )}
                </div>

                {/* Form Add / Edit Lesson */}
                {lessonFormMode !== 'none' && (
                  <form onSubmit={handleSaveLesson} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 18, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <strong style={{ fontSize: '0.95rem', color: '#6b21a8' }}>
                        {lessonFormMode === 'add' ? '+ Thêm Bài Học Mới Vào Khóa' : '✎ Chỉnh Sửa Bài Học'}
                      </strong>
                      <button
                        type="button"
                        onClick={() => setLessonFormMode('none')}
                        style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                          Tiêu đề bài học: *
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Bài 1 - Phương pháp giải phương trình bậc hai"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                          Thứ tự bài:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={lessonOrder}
                          onChange={(e) => setLessonOrder(e.target.value)}
                          disabled={lessonFormMode === 'edit'}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                          Link Video / Học liệu (YouTube, Google Drive):
                        </label>
                        <input
                          type="url"
                          placeholder="https://youtube.com/watch?v=..."
                          value={mediaUrl}
                          onChange={(e) => setMediaUrl(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                          Link Phòng học Google Meet / Zoom:
                        </label>
                        <input
                          type="url"
                          placeholder="https://meet.google.com/abc-xyz"
                          value={meetingUrl}
                          onChange={(e) => setMeetingUrl(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>
                    </div>

                    {lessonFormMode === 'add' && (
                      <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#334155', marginBottom: 4 }}>
                          Thời gian bắt đầu buổi học (nếu dạy trực tuyến):
                        </label>
                        <input
                          type="datetime-local"
                          value={startsAt}
                          onChange={(e) => setStartsAt(e.target.value)}
                          style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                        />
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => setLessonFormMode('none')}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#7c3aed', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                      >
                        {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Lưu bài học
                      </button>
                    </div>
                  </form>
                )}

                {/* Lessons list display */}
                {lessons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#94a3b8' }}>
                    <Layers size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>Khóa học này chưa có bài học nào.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Bấm nút "Thêm bài học mới" phía trên để tạo bài giảng cho học viên.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {lessons.map((l, idx) => (
                      <div
                        key={l.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          border: '1px solid #e2e8f0',
                          borderRadius: 8,
                          background: '#fff'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: '#eff6ff',
                            color: '#2563eb',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {idx + 1}
                          </span>
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: '#0f172a', display: 'block' }}>
                              {l.title}
                            </strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, fontSize: '0.78rem', color: '#64748b' }}>
                              {l.mediaUrl && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#dc2626' }}>
                                  <Video size={13} /> Video học liệu
                                </span>
                              )}
                              {l.meetingUrl && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#16a34a' }}>
                                  <ExternalLink size={13} /> Phòng Meet
                                </span>
                              )}
                              {l.startsAt && (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Clock size={13} /> {new Date(l.startsAt).toLocaleString('vi-VN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditLesson(l)}
                            style={{ background: '#f1f5f9', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
                            title="Sửa bài học"
                          >
                            <Edit2 size={13} /> Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteLesson(l.id)}
                            style={{ background: '#fee2e2', border: 'none', padding: '6px 10px', borderRadius: 4, cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem' }}
                            title="Xóa bài học"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                Vui lòng chọn một khóa học từ danh sách bên trái để quản lý bài học.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
