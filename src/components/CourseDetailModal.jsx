import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Star,
  Check,
  Clock,
  BookOpen,
  ShieldCheck,
  Lock,
  Video,
  Play,
  PlayCircle,
  Award,
  Calendar,
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles
} from 'lucide-react';
import { courseApi } from '../services/api';

/**
 * Danh sách video bài giảng chất lượng cao theo từng chuyên ngành
 */
function getSubjectLessons(course) {
  const title = (course?.title || '').toLowerCase();
  const category = (course?.category || '').toLowerCase();

  if (title.includes('toán') || title.includes('toan') || category === 'math') {
    return [
      { id: 'm1', title: 'Bài 1: Khảo sát sự biến thiên & Vẽ đồ thị hàm số 12 (Thầy Nguyễn Phan Tiến)', mediaUrl: 'https://www.youtube.com/embed/C64H0h3qiRc' },
      { id: 'm2', title: 'Bài 2: Phương pháp giải nhanh Hàm số Mũ & Logarithm (Thầy Nguyễn Quốc Chí)', mediaUrl: 'https://www.youtube.com/embed/W_8aEs16RI0' },
      { id: 'm3', title: 'Bài 3: Hình học không gian Oxyz & Kỹ thuật Tọa độ hóa (Toán 12)', mediaUrl: 'https://www.youtube.com/embed/990wEB5yo2k' }
    ];
  } else if (title.includes('tiếng anh') || title.includes('ielts') || title.includes('english') || category === 'english') {
    return [
      { id: 'e1', title: 'Bài 1: Chuẩn hóa 44 âm IPA & Ngữ điệu tiếng Anh (BBC Learning English)', mediaUrl: 'https://www.youtube.com/embed/IOfEQjlKH64' },
      { id: 'e2', title: 'Bài 2: Chiến lược trả lời IELTS Speaking Band 8.0+ Part 1 & 2 (IELTS Advantage)', mediaUrl: 'https://www.youtube.com/embed/nJJyilEPwpk' },
      { id: 'e3', title: 'Bài 3: Bẻ khóa dạng bài IELTS Reading & Kỹ năng Skimming/Scanning', mediaUrl: 'https://www.youtube.com/embed/N0RxRl9allI' }
    ];
  } else if (title.includes('vật lý') || title.includes('vat ly') || category === 'physics') {
    return [
      { id: 'p1', title: 'Bài 1: Tổng ôn chuyên đề Dao động cơ học & Con lắc lò xo 12 (Thầy Phạm Quốc Toản)', mediaUrl: 'https://www.youtube.com/embed/jhtggbrGPn0' },
      { id: 'p2', title: 'Bài 2: Phương pháp giải bài toán Sóng cơ học & Giao thoa sóng', mediaUrl: 'https://www.youtube.com/embed/C64H0h3qiRc' },
      { id: 'p3', title: 'Bài 3: Mạch điện xoay chiều RLC & Kỹ thuật Giản đồ vectơ', mediaUrl: 'https://www.youtube.com/embed/990wEB5yo2k' }
    ];
  } else {
    // Mặc định: IT / Lập trình Java / Spring Boot / React / Python
    return [
      { id: 'it1', title: 'Bài 1: Thiết kế kiến trúc Spring Boot 3 & RESTful API chuẩn quốc tế (Amigoscode)', mediaUrl: 'https://www.youtube.com/embed/9SGDpanrc8U' },
      { id: 'it2', title: 'Bài 2: Lập trình Java Core & Tư duy Hướng đối tượng OOP (Mosh Hamedani)', mediaUrl: 'https://www.youtube.com/embed/eIrMbAQSU34' },
      { id: 'it3', title: 'Bài 3: Xây dựng Giao diện React Vite & Kết nối API Backend Spring Boot', mediaUrl: 'https://www.youtube.com/embed/SqcY0GlETPk' }
    ];
  }
}

function getVideoEmbedUrl(url) {
  if (!url) return 'https://www.youtube.com/embed/9SGDpanrc8U?enablejsapi=1';
  let embedUrl = url;
  if (url.includes('watch?v=')) {
    const id = url.split('watch?v=')[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }
  const separator = embedUrl.includes('?') ? '&' : '?';
  return `${embedUrl}${separator}enablejsapi=1&autoplay=1&origin=${encodeURIComponent(window.location.origin)}`;
}

export default function CourseDetailModal({
  course,
  isOpen,
  onClose,
  onEnroll,
  isEnrolled = false,
  currentUser = null,
  onOpenAuth = null,
  onAddToCart = null,
  onOpenReview = null
}) {
  const [lessons, setLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [activeVideoLesson, setActiveVideoLesson] = useState(null);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState([]);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [autoCompletedAlert, setAutoCompletedAlert] = useState(null);

  const iframeRef = useRef(null);

  // Load lessons & progress whenever modal opens or course changes
  useEffect(() => {
    if (!isOpen || !course?.id) return;

    setLocalEnrolled(isEnrolled);
    setActiveVideoLesson(null);
    setAutoCompletedAlert(null);

    // 1. Tải danh sách bài học đã hoàn thành từ localStorage
    const storageKey = `course_completed_lessons_${currentUser?.id || 'guest'}_${course.id}`;
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedLessonIds(Array.isArray(parsed) ? parsed : []);
      } else {
        setCompletedLessonIds([]);
      }
    } catch (e) {
      setCompletedLessonIds([]);
    }

    // 2. Lấy thông tin tiến độ từ Backend nếu đã đăng nhập và ghi danh
    if ((isEnrolled || localEnrolled) && currentUser) {
      courseApi.getMyEnrollmentByCourse(course.id)
        .then((res) => {
          if (res && res.progressPercent !== undefined && res.progressPercent !== null) {
            setProgressPercent(res.progressPercent);
          }
        })
        .catch((err) => {
          console.warn('Lỗi lấy tiến độ khóa học từ backend:', err);
        });
    }

    // 3. Tải danh sách bài học từ Backend hoặc Fallback theo môn
    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const data = await courseApi.getLessons(course.id);
        const subjectDefaults = getSubjectLessons(course);

        if (data && Array.isArray(data) && data.length > 0) {
          const sanitized = data.map((l, i) => {
            let url = l.mediaUrl;
            if (!url || url.includes('dQw4w9WgXcQ')) {
              url = subjectDefaults[i % subjectDefaults.length].mediaUrl;
            }
            return { ...l, mediaUrl: url };
          });
          setLessons(sanitized);
        } else {
          setLessons(subjectDefaults);
        }
      } catch (err) {
        console.warn('Lấy bài học từ Backend thất bại, sử dụng giáo trình chuẩn:', err);
        setLessons(getSubjectLessons(course));
      } finally {
        setIsLoadingLessons(false);
      }
    }

    fetchLessons();
  }, [isOpen, course?.id, isEnrolled, localEnrolled, currentUser?.id]);

  // Lắng nghe sự kiện YouTube IFrame API khi học viên xem hết video
  useEffect(() => {
    if (!activeVideoLesson) return;

    const handleMessage = (event) => {
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        if (data) {
          // YT.PlayerState.ENDED = 0
          const isEnded =
            (data.event === 'onStateChange' && (data.data === 0 || data.info === 0)) ||
            (data.event === 'infoDelivery' && data.info && data.info.playerState === 0);

          if (isEnded) {
            handleAutoLessonCompleted(activeVideoLesson.id, activeVideoLesson.title);
          }
        }
      } catch (e) {
        // Bỏ qua tin nhắn không phải JSON
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeVideoLesson, completedLessonIds, lessons, course?.id]);

  if (!isOpen || !course) return null;

  const effectivelyEnrolled = Boolean(isEnrolled || localEnrolled);

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Tự động hoàn thành bài học khi xem hết video
  const handleAutoLessonCompleted = (lessonId, lessonTitle = '') => {
    if (!effectivelyEnrolled || !lessonId) return;

    const currentCompleted = completedLessonIds;
    if (currentCompleted.includes(lessonId)) return; // Đã đánh dấu trước đó

    const newCompleted = [...currentCompleted, lessonId];
    setCompletedLessonIds(newCompleted);

    // Lưu vào localStorage
    const storageKey = `course_completed_lessons_${currentUser?.id || 'guest'}_${course.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCompleted));
    } catch (e) {
      console.warn('Lỗi lưu completed lessons:', e);
    }

    // Tính % hoàn thành mới
    const total = lessons.length > 0 ? lessons.length : 1;
    const newPercent = Math.min(100, Math.round((newCompleted.length / total) * 100));
    setProgressPercent(newPercent);

    // Hiển thị thông báo chúc mừng
    setAutoCompletedAlert(
      `🎉 Bạn đã xem xong "${lessonTitle || 'bài giảng'}"! Tiến độ khóa học đã tự động cập nhật lên ${newPercent}%.`
    );

    // Gửi cập nhật lên Backend
    setIsUpdatingProgress(true);
    courseApi.updateProgressByCourse(course.id, newPercent)
      .catch((err) => {
        console.error('Lỗi cập nhật tiến độ lên backend:', err);
      })
      .finally(() => {
        setIsUpdatingProgress(false);
      });
  };

  // Nút chuyển đổi thủ công (giữ nguyên để học viên/thầy cô có thể chủ động kiểm tra)
  const handleToggleLessonCompleted = async (lessonId) => {
    if (!effectivelyEnrolled) return;

    const isDone = completedLessonIds.includes(lessonId);
    const newCompleted = isDone
      ? completedLessonIds.filter((id) => id !== lessonId)
      : [...completedLessonIds, lessonId];

    setCompletedLessonIds(newCompleted);
    setAutoCompletedAlert(null);

    const storageKey = `course_completed_lessons_${currentUser?.id || 'guest'}_${course.id}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(newCompleted));
    } catch (e) {
      console.warn('Lỗi lưu completed lessons vào localStorage:', e);
    }

    const total = lessons.length > 0 ? lessons.length : 1;
    const newPercent = Math.min(100, Math.round((newCompleted.length / total) * 100));
    setProgressPercent(newPercent);

    setIsUpdatingProgress(true);
    try {
      await courseApi.updateProgressByCourse(course.id, newPercent);
    } catch (err) {
      console.error('Lỗi cập nhật tiến độ khóa học lên backend:', err);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleEnrollClick = async () => {
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    setIsEnrolling(true);
    try {
      if (onEnroll) {
        const success = await onEnroll(course);
        if (success === true && (!course.price || course.price === 0)) {
          setLocalEnrolled(true);
        }
      }
    } catch (err) {
      console.error('Đăng ký khóa học lỗi:', err);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div className="ud-detail-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Hero Banner */}
        <div className="detail-modal-hero">
          <div className="detail-hero-left">
            <span className="badge badge-bestseller">{course.badge || 'Khóa học tiêu biểu'}</span>
            <h2 className="detail-title">{course.title}</h2>
            <p className="detail-sub">{course.highlights ? course.highlights[0] : ''}</p>

            <div className="detail-rating-row">
              <span className="rating-score">{course.rating || 4.9}</span>
              <div className="rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={15} fill="#b4690e" stroke="#b4690e" />
                ))}
              </div>
              <span className="rating-count">({(course.ratingCount || 1200).toLocaleString()} đánh giá)</span>
              <span className="stat-divider">•</span>
              <span className="detail-students">Hơn 4.200 học viên</span>
            </div>

            <div className="detail-instructor-author">
              <img
                src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={course.instructor}
                className="author-img"
              />
              <div>
                <span>Giảng viên: <strong>{course.instructor || 'Gia sư EduTutor'}</strong></span>
                <p className="author-role-sub">{course.instructorRole || 'Giảng viên chuyên môn cao'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="detail-modal-grid">
          {/* Main Info */}
          <div className="detail-main-content">
            {/* What you'll learn */}
            <div className="detail-learn-box">
              <h3>Những gì bạn sẽ học được trong khóa học</h3>
              <div className="learn-grid">
                {(course.highlights || []).map((h, i) => (
                  <div key={i} className="learn-item">
                    <Check size={18} className="learn-check" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Player (Khi học viên bấm xem bài học) */}
            {activeVideoLesson && effectivelyEnrolled && (
              <div style={{ marginBottom: 20, background: '#1c1d1f', borderRadius: 8, overflow: 'hidden', border: '1px solid #3e4143', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                {/* Header thanh phát video */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#2d2f31', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                    <PlayCircle size={18} color="#a435f0" />
                    <strong style={{ fontSize: '0.88rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      Đang phát: {activeVideoLesson.title}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    {!completedLessonIds.includes(activeVideoLesson.id) ? (
                      <button
                        type="button"
                        onClick={() => handleAutoLessonCompleted(activeVideoLesson.id, activeVideoLesson.title)}
                        style={{
                          background: '#16a34a',
                          border: 'none',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '4px 12px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          transition: 'all 0.2s'
                        }}
                        title="Bấm để đánh dấu đã xem xong bài giảng ngay lập tức"
                      >
                        <CheckCircle2 size={14} /> Đã xem xong
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle2 size={14} /> Đã hoàn thành
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setActiveVideoLesson(null);
                        setAutoCompletedAlert(null);
                      }}
                      style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
                      title="Đóng video"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Khung iframe video YouTube với YouTube IFrame API kích hoạt */}
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
                  <iframe
                    ref={iframeRef}
                    src={getVideoEmbedUrl(activeVideoLesson.mediaUrl)}
                    title={activeVideoLesson.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    onLoad={() => {
                      if (iframeRef.current && iframeRef.current.contentWindow) {
                        try {
                          iframeRef.current.contentWindow.postMessage('{"event":"listening"}', '*');
                        } catch (e) {}
                      }
                    }}
                  />
                </div>

                {/* Thông báo tự động hoàn thành khi xem hết */}
                {autoCompletedAlert && (
                  <div style={{
                    background: '#ecfdf5',
                    borderTop: '1px solid #a7f3d0',
                    color: '#065f46',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Sparkles size={16} color="#10b981" />
                      <span>{autoCompletedAlert}</span>
                    </div>
                    <button
                      onClick={() => setAutoCompletedAlert(null)}
                      style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', padding: 2 }}
                    >
                      <X size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tiến độ khóa học (Dành cho học viên đã đăng ký) */}
            {effectivelyEnrolled && (
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        background: progressPercent === 100 ? '#dcfce7' : '#f3e8ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: progressPercent === 100 ? '#16a34a' : '#9333ea',
                      }}
                    >
                      {progressPercent === 100 ? <Award size={20} /> : <BookOpen size={18} />}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1e293b' }}>
                        Tiến độ học tập của bạn
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Đã học {completedLessonIds.length} / {lessons.length} bài ({progressPercent}%)
                      </span>
                    </div>
                  </div>
                  {progressPercent === 100 ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        background: '#dcfce7',
                        color: '#16a34a',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      <CheckCircle2 size={15} /> Đã hoàn thành khóa học
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: '#a435f0',
                      }}
                    >
                      {progressPercent}%
                    </span>
                  )}
                </div>

                {/* Thanh tiến độ */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e2e8f0',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      height: '100%',
                      background:
                        progressPercent === 100
                          ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                          : 'linear-gradient(90deg, #a435f0 0%, #7928ca 100%)',
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease-in-out',
                    }}
                  />
                </div>

                {/* Banner viết đánh giá khi hoàn thành 100% (CN02.16 & CN02.18) */}
                {progressPercent === 100 && (
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ fontSize: '0.84rem', color: '#065f46', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={16} color="#059669" /> Bạn đã hoàn thành 100% khóa học! Hãy chia sẻ trải nghiệm:
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        if (onOpenReview) {
                          onOpenReview({
                            type: 'enrollment',
                            id: course.id,
                            title: course.title,
                            tutorName: course.instructor
                          });
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        background: '#eab308',
                        color: '#000',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Star size={14} fill="#000" /> Viết Đánh Giá
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Recorded Video Curriculum */}
            <div className="course-curriculum-box">
              <div className="curriculum-header">
                <h3>Giáo trình & Video bài giảng quay sẵn</h3>
                <span className="curriculum-meta">
                  {lessons.length} video bài giảng • Học mọi lúc mọi nơi • Tự động ghi nhận tiến độ
                </span>
              </div>

              {isLoadingLessons ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6a6f73' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Đang tải danh sách bài giảng...</p>
                </div>
              ) : (
                <div className="lessons-list">
                  {lessons.map((lesson, idx) => {
                    const isDone = completedLessonIds.includes(lesson.id || String(idx));
                    return (
                      <div key={lesson.id || idx} className="lesson-card">
                        <div className="lesson-left">
                          <span className="lesson-index" style={{
                            backgroundColor: isDone ? '#dcfce7' : '#f1f5f9',
                            color: isDone ? '#16a34a' : '#475569'
                          }}>
                            {isDone ? '✓' : idx + 1}
                          </span>
                          <div className="lesson-info">
                            <span className="lesson-title" style={{ fontWeight: isDone ? 600 : 500 }}>
                              {lesson.title}
                            </span>
                            <span className="lesson-time">
                              Video bài giảng quay sẵn Full HD • {isDone ? 'Đã hoàn thành' : 'Xem xong tự động tính %'}
                            </span>
                          </div>
                        </div>

                        <div className="lesson-right" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {effectivelyEnrolled ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleToggleLessonCompleted(lesson.id || String(idx))}
                                title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã học xong'}
                                style={{
                                  fontSize: '0.78rem',
                                  padding: '5px 10px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  borderRadius: '6px',
                                  border: isDone ? '1px solid #16a34a' : '1px solid #cbd5e1',
                                  backgroundColor: isDone ? '#f0fdf4' : '#ffffff',
                                  color: isDone ? '#16a34a' : '#64748b',
                                  cursor: 'pointer',
                                  fontWeight: 500,
                                  transition: 'all 0.2s',
                                }}
                              >
                                {isDone ? (
                                  <>
                                    <CheckCircle2 size={14} color="#16a34a" />
                                    <span>Đã xong</span>
                                  </>
                                ) : (
                                  <>
                                    <Circle size={14} />
                                    <span>Chưa học</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveVideoLesson(lesson);
                                  setAutoCompletedAlert(null);
                                }}
                                className="btn btn-primary"
                                style={{
                                  fontSize: '0.82rem',
                                  padding: '6px 14px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  backgroundColor: activeVideoLesson?.id === lesson.id ? '#0d6832' : '#a435f0',
                                  borderColor: activeVideoLesson?.id === lesson.id ? '#0d6832' : '#a435f0',
                                  cursor: 'pointer',
                                }}
                              >
                                <PlayCircle size={15} />
                                {activeVideoLesson?.id === lesson.id ? 'Đang phát' : 'Xem video'}
                              </button>
                            </>
                          ) : (
                            <span className="lesson-locked" title="Đăng ký khóa học để xem trọn bộ video bài giảng">
                              <Lock size={14} /> Video khóa
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Course Features */}
            <div className="course-includes">
              <h4>Khóa học này bao gồm:</h4>
              <div className="includes-list">
                <div className="inc-item"><Clock size={16} /> {course.hours || '24 giờ'} video bài giảng chất lượng cao</div>
                <div className="inc-item"><BookOpen size={16} /> {lessons.length || 3} video bài học theo lộ trình</div>
                <div className="inc-item"><Award size={16} /> Chứng chỉ hoàn thành khóa học</div>
                <div className="inc-item"><ShieldCheck size={16} /> Quyền sở hữu trọn đời & xem trên mọi thiết bị</div>
              </div>
            </div>
          </div>

          {/* Sticky Pricing Sidebar */}
          <div className="detail-sidebar">
            <div className="detail-card-preview">
              <div className="preview-video-box">
                <img src={course.thumbnail} alt={course.title} className="video-thumb" />
                <div className="play-overlay">
                  <div className="play-btn-circle">
                    <Play size={24} fill="#ffffff" />
                  </div>
                  <span>Xem trước khóa học</span>
                </div>
              </div>

              <div className="sidebar-pricing">
                <div className="price-row">
                  <span className="huge-price">{formatVND(course.price)}</span>
                  {course.originalPrice && (
                    <span className="strike-price">{formatVND(course.originalPrice)}</span>
                  )}
                  {course.discount && (
                    <span className="discount-pill">{course.discount}</span>
                  )}
                </div>

                {effectivelyEnrolled ? (
                  <div className="enrolled-success-box">
                    <Check size={20} />
                    <div>
                      <strong>Đã sở hữu khóa học trọn đời!</strong>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                        Tiến độ học tập: <strong>{progressPercent}%</strong> ({completedLessonIds.length}/{lessons.length} bài đã hoàn thành).
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pricing-actions">
                    <button
                      className="btn btn-primary btn-block btn-lg"
                      onClick={handleEnrollClick}
                      disabled={isEnrolling}
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 size={18} className="animate-spin" style={{ display: 'inline', marginRight: 6 }} />
                          Đang xử lý đăng ký...
                        </>
                      ) : (
                        'Đăng ký học ngay'
                      )}
                    </button>
                    <button
                      className="btn btn-outline btn-block"
                      onClick={() => onAddToCart && onAddToCart(course)}
                    >
                      Thêm vào giỏ hàng
                    </button>
                  </div>
                )}

                <p className="guarantee-note">
                  Đảm bảo hoàn tiền trong 7 ngày nếu không hài lòng.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
