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

  // Load lessons whenever modal opens or course changes
  useEffect(() => {
    if (!isOpen || !course?.id) return;

    setLocalEnrolled(isEnrolled);

    async function fetchLessons() {
      setIsLoadingLessons(true);
      try {
        const data = await courseApi.getLessons(course.id);
        if (data && Array.isArray(data) && data.length > 0) {
          setLessons(data);
        } else {
          // Fallback lessons outline if backend returns empty
          setLessons([
            { id: '1', title: 'Buổi 1: Giới thiệu tổng quan & Thiết lập môi trường', meetingUrl: 'https://meet.google.com/edututor-math-001' },
            { id: '2', title: 'Buổi 2: Kiến thức nền tảng & Các dạng bài trọng tâm', meetingUrl: 'https://meet.google.com/edututor-math-002' },
            { id: '3', title: 'Buổi 3: Luyện giải bài tập thực chiến & Hỏi đáp trực tiếp 1-1', meetingUrl: 'https://meet.google.com/edututor-math-003' }
          ]);
        }
      } catch (err) {
        console.warn('Lỗi lấy bài học từ Backend:', err);
        setLessons([
          { id: '1', title: 'Buổi 1: Giới thiệu tổng quan & Thiết lập môi trường', meetingUrl: 'https://meet.google.com/edututor-math-001' },
          { id: '2', title: 'Buổi 2: Kiến thức nền tảng & Các dạng bài trọng tâm', meetingUrl: 'https://meet.google.com/edututor-math-002' },
          { id: '3', title: 'Buổi 3: Luyện giải bài tập thực chiến & Hỏi đáp trực tiếp 1-1', meetingUrl: 'https://meet.google.com/edututor-math-003' }
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

            {/* Online Lessons & Curriculum */}
            <div className="course-curriculum-box">
              <div className="curriculum-header">
                <h3>Lịch học trực tuyến & Bài giảng</h3>
                <span className="curriculum-meta">
                  {lessons.length} buổi học • Trực tuyến qua Google Meet
                </span>
              </div>

              {isLoadingLessons ? (
                <div style={{ textAlign: 'center', padding: '24px', color: '#6a6f73' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px' }} />
                  <p>Đang tải danh sách buổi học...</p>
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
                            Hình thức: Trực tuyến 1-1 qua Google Meet
                          </span>
                        </div>
                      </div>

                      <div className="lesson-right">
                        {effectivelyEnrolled ? (
                          <a 
                            href={lesson.meetingUrl || 'https://meet.google.com'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-meet"
                          >
                            <Video size={15} />
                            Vào Google Meet
                          </a>
                        ) : (
                          <span className="lesson-locked" title="Đăng ký khóa học để nhận link Google Meet">
                            <Lock size={14} /> Link Meet khóa
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
                <div className="inc-item"><Clock size={16} /> {course.hours || '24 giờ học'} tương tác trực tiếp</div>
                <div className="inc-item"><BookOpen size={16} /> {lessons.length || 3} buổi kèm thực hành</div>
                <div className="inc-item"><Award size={16} /> Chứng chỉ hoàn thành khóa học</div>
                <div className="inc-item"><ShieldCheck size={16} /> Hỗ trợ giải đáp bài tập 24/7</div>
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
                      <strong>Đã đăng ký thành công!</strong>
                      <div style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                        Bạn có thể nhấn nút "Vào Google Meet" ở danh sách buổi học để vào lớp.
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
