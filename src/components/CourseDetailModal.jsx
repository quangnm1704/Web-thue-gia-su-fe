import React, { useState, useEffect } from 'react';
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
  Loader2
} from 'lucide-react';
import { courseApi } from '../services/api';

export default function CourseDetailModal({ 
  course, 
  isOpen, 
  onClose, 
  onEnroll, 
  isEnrolled = false,
  currentUser = null,
  onOpenAuth = null,
  onAddToCart = null
}) {
  const [lessons, setLessons] = useState([]);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [localEnrolled, setLocalEnrolled] = useState(false);
  const [activeVideoLesson, setActiveVideoLesson] = useState(null);

  // Load lessons whenever modal opens or course changes
  useEffect(() => {
    if (!isOpen || !course?.id) return;

    setLocalEnrolled(isEnrolled);
    setActiveVideoLesson(null);

    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const data = await courseApi.getLessons(course.id);
        if (data && Array.isArray(data) && data.length > 0) {
          setLessons(data);
        } else {
          // Fallback lessons outline if backend returns empty
          setLessons([
            { id: '1', title: 'Bài 1: Giới thiệu tổng quan & Thiết lập môi trường', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: '2', title: 'Bài 2: Kiến thức nền tảng & Các dạng bài trọng tâm', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
            { id: '3', title: 'Bài 3: Thực hành dự án thực chiến & Bài tập áp dụng', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
          ]);
        }
      } catch (err) {
        console.warn('Lỗi lấy bài học từ Backend:', err);
        setLessons([
          { id: '1', title: 'Bài 1: Giới thiệu tổng quan & Thiết lập môi trường', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
          { id: '2', title: 'Bài 2: Kiến thức nền tảng & Các dạng bài trọng tâm', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
          { id: '3', title: 'Bài 3: Thực hành dự án thực chiến & Bài tập áp dụng', mediaUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
        ]);
      } finally {
        setIsLoadingLessons(false);
      }
    }

    fetchLessons();
  }, [isOpen, course?.id, isEnrolled]);

  if (!isOpen || !course) return null;

  const effectivelyEnrolled = isEnrolled || localEnrolled;

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
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

            {/* Active Video Player (When Enrolled) */}
            {activeVideoLesson && effectivelyEnrolled && (
              <div style={{ marginBottom: 20, background: '#1c1d1f', borderRadius: 8, overflow: 'hidden', border: '1px solid #3e4143' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', background: '#2d2f31', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <PlayCircle size={18} color="#a435f0" />
                    <strong style={{ fontSize: '0.9rem' }}>Đang phát: {activeVideoLesson.title}</strong>
                  </div>
                  <button 
                    onClick={() => setActiveVideoLesson(null)} 
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
                    title="Đóng video"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', background: '#000' }}>
                  <iframe 
                    src={activeVideoLesson.mediaUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'} 
                    title={activeVideoLesson.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Recorded Video Curriculum */}
            <div className="course-curriculum-box">
              <div className="curriculum-header">
                <h3>Giáo trình & Video bài giảng quay sẵn</h3>
                <span className="curriculum-meta">
                  {lessons.length} video bài giảng • Học mọi lúc mọi nơi • Full HD
                </span>
              </div>

              {isLoadingLessons ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6a6f73' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Đang tải danh sách bài giảng...</p>
                </div>
              ) : (
                <div className="lessons-list">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id || idx} className="lesson-card">
                      <div className="lesson-left">
                        <span className="lesson-index">{idx + 1}</span>
                        <div className="lesson-info">
                          <span className="lesson-title">{lesson.title}</span>
                          <span className="lesson-time">
                            Video bài giảng quay sẵn Full HD • Xem trọn đời
                          </span>
                        </div>
                      </div>

                      <div className="lesson-right">
                        {effectivelyEnrolled ? (
                          <button 
                            type="button"
                            onClick={() => setActiveVideoLesson(lesson)}
                            className="btn btn-primary"
                            style={{ 
                              fontSize: '0.82rem', 
                              padding: '6px 14px', 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: 6,
                              backgroundColor: activeVideoLesson?.id === lesson.id ? '#0d6832' : '#a435f0',
                              borderColor: activeVideoLesson?.id === lesson.id ? '#0d6832' : '#a435f0',
                              cursor: 'pointer'
                            }}
                          >
                            <PlayCircle size={15} />
                            {activeVideoLesson?.id === lesson.id ? 'Đang phát' : 'Xem video'}
                          </button>
                        ) : (
                          <span className="lesson-locked" title="Đăng ký khóa học để xem trọn bộ video bài giảng">
                            <Lock size={14} /> Video khóa
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
                        Bạn có thể nhấn nút "Xem video" ở danh sách các bài học để bắt đầu học ngay.
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
