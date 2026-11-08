import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Video, ExternalLink, Edit2, Trash2, Loader2, RefreshCw, X, Save } from 'lucide-react';
import { adminApi, courseApi, lessonApi } from '../services/api';

export default function AdminLessonsTab() {
  const [lessons, setLessons] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', mediaUrl: '', meetingUrl: '' });

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getCourses();
      if (Array.isArray(data)) setCourses(data);
    } catch (err) {
      console.warn('Lỗi tải khóa học:', err);
    }
  };

  const fetchLessons = async (cId = selectedCourseId, kw = keyword) => {
    setLoading(true);
    try {
      const data = await adminApi.getLessons({
        courseId: cId || undefined,
        keyword: kw || undefined
      });
      setLessons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Lỗi tải bài học admin:', err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchLessons();
  }, []);

  const handleOpenEdit = (lesson) => {
    setEditingLesson(lesson);
    setEditForm({
      title: lesson.title || '',
      mediaUrl: lesson.mediaUrl || '',
      meetingUrl: lesson.meetingUrl || ''
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;
    setProcessingId(editingLesson.id);
    try {
      const res = await lessonApi.update(editingLesson.id, editForm);
      setLessons(prev => prev.map(l => l.id === editingLesson.id ? { ...l, ...(res || {}), ...editForm } : l));
      setEditModalOpen(false);
      setEditingLesson(null);
    } catch (err) {
      alert('Lỗi cập nhật bài học: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (lessonId, title) => {
    if (!window.confirm(`Xác nhận XÓA bài học "${title}"? Thao tác này không thể hoàn tác.`)) {
      return;
    }
    setProcessingId(lessonId);
    try {
      await lessonApi.delete(lessonId);
      setLessons(prev => prev.filter(l => l.id !== lessonId));
    } catch (err) {
      alert('Lỗi xóa bài học: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BookOpen size={24} color="#2563eb" />
            Quản Lý Bài Học Khóa Học (CN06.03)
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Tra cứu, kiểm duyệt nội dung bài giảng, tài liệu video và link phòng học Google Meet trên toàn hệ thống.
          </p>
        </div>

        <button
          onClick={() => fetchLessons(selectedCourseId, keyword)}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#fff',
            color: '#475569',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm mới ({lessons.length})</span>
        </button>
      </div>

      {/* Filter Bar (LessonAdminFrm: cboCourse, txtTitle, btnSearch) */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 18, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '1 1 260px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Khóa học (cboCourse)
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => {
              setSelectedCourseId(e.target.value);
              fetchLessons(e.target.value, keyword);
            }}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="">-- Tất cả các khóa học --</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.subject || 'Chung'})</option>
            ))}
          </select>
        </div>

        <div style={{ flex: '1 1 320px' }}>
          <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Tiêu đề bài học (txtTitle)
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              placeholder="Nhập tiêu đề bài học cần tra cứu..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') fetchLessons(selectedCourseId, keyword); }}
              style={{ flex: 1, padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
            />
            <button
              onClick={() => fetchLessons(selectedCourseId, keyword)}
              style={{ padding: '9px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Search size={14} />
              <span>Tìm</span>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang tải bài học...</div>
        </div>
      ) : lessons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
          <BookOpen size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>Không tìm thấy bài học nào</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
            Hãy chọn một khóa học khác hoặc tìm kiếm với từ khóa tiêu đề khác.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Tiêu đề bài học</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Khóa học</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Video & Học liệu</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Phòng học Meet</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{l.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {l.id}</div>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', fontWeight: 600 }}>
                    {l.courseTitle || l.courseId}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {l.mediaUrl ? (
                      <a
                        href={l.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2563eb', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}
                      >
                        <Video size={13} />
                        <span>Xem Video</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa có video</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    {l.meetingUrl ? (
                      <a
                        href={l.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600, fontSize: '0.82rem', textDecoration: 'none' }}
                      >
                        <Video size={13} />
                        <span>Vào Google Meet</span>
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Chưa có link Meet</span>
                    )}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleOpenEdit(l)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #cbd5e1',
                          backgroundColor: '#fff',
                          color: '#334155',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Edit2 size={12} />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDelete(l.id, l.title)}
                        disabled={processingId === l.id}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: '1px solid #fca5a5',
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {processingId === l.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        <span>Xóa</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL SỬA BÀI HỌC (LessonAdminFrm: txtTitle, txtMediaUrl, txtMeetingUrl, btnSave) */}
      {editModalOpen && editingLesson && (
        <div className="ud-modal-backdrop" onClick={() => setEditModalOpen(false)} style={{ zIndex: 1300 }}>
          <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 520, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit2 size={18} color="#2563eb" /> Chỉnh Sửa Bài Học
              </h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Tiêu đề bài học *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Link Video bài giảng (YouTube / Drive / MP4)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={editForm.mediaUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, mediaUrl: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Link phòng học trực tuyến (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={editForm.meetingUrl}
                  onChange={(e) => setEditForm(prev => ({ ...prev, meetingUrl: e.target.value }))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={processingId === editingLesson.id || !editForm.title.trim()}
                  style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {processingId === editingLesson.id ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Lưu Thay Đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

