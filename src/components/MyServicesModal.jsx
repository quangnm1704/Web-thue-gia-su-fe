import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  BookOpen,
  Calendar,
  Clock,
  Star,
  MessageCircle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  PlayCircle,
  Trash2,
  CreditCard,
  Ban
} from 'lucide-react';
import { courseApi, bookingApi } from '../services/api';

export default function MyServicesModal({
  isOpen,
  onClose,
  currentUser,
  onOpenCourse = null,
  onOpenChat = null,
  onOpenReview = null,
  onOpenCheckout = null
}) {
  const [activeType, setActiveType] = useState('ALL'); // 'ALL' | 'COURSE' | 'BOOKING'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [searchTerm, setSearchTerm] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMyServices = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const [enrRes, bookRes] = await Promise.allSettled([
        courseApi.getMyEnrollments(),
        bookingApi.getMyBookings()
      ]);

      if (enrRes.status === 'fulfilled' && enrRes.value) {
        const list = Array.isArray(enrRes.value) ? enrRes.value : (enrRes.value?.result || []);
        setEnrollments(list);
      }

      if (bookRes.status === 'fulfilled' && bookRes.value) {
        const list = Array.isArray(bookRes.value) ? bookRes.value : (bookRes.value?.result || []);
        const hiddenKey = `hidden_bookings_${currentUser?.id || 'default'}`;
        let hiddenList = [];
        try {
          hiddenList = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
        } catch (e) {
          hiddenList = [];
        }
        setBookings(list.filter(b => !hiddenList.includes(b.id)));
      }
    } catch (err) {
      console.warn('Lỗi tải dịch vụ của tôi:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Hủy đơn ghi danh khóa học đang chờ thanh toán
  const handleCancelEnrollment = async (enrollmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY đơn đăng ký khóa học này không?')) return;
    try {
      await courseApi.cancelEnrollment(enrollmentId);
      await fetchMyServices();
    } catch (err) {
      alert('Không thể hủy đơn ghi danh: ' + (err.data?.message || err.message));
    }
  };

  // Xóa đơn ghi danh đã hủy vĩnh viễn khỏi hệ thống
  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn đơn đăng ký này khỏi danh sách?')) return;
    setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
    try {
      await courseApi.deleteEnrollment(enrollmentId);
      await fetchMyServices();
    } catch (err) {
      console.warn('Lỗi xóa ghi danh phía backend (đã ẩn trên UI):', err);
    }
  };

  // Hủy đơn booking gia sư 1-1
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn HỦY đơn kết nối gia sư này không?')) return;
    try {
      await bookingApi.cancelBooking(bookingId);
      await fetchMyServices();
    } catch (err) {
      alert('Không thể hủy đơn gia sư: ' + (err.data?.message || err.message));
    }
  };

  // Xóa đơn booking đã hủy
  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn XÓA vĩnh viễn đơn kết nối này khỏi danh sách?')) return;
    setBookings(prev => prev.filter(b => b.id !== bookingId));
    try {
      const hiddenKey = `hidden_bookings_${currentUser?.id || 'default'}`;
      const existingHidden = JSON.parse(localStorage.getItem(hiddenKey) || '[]');
      if (!existingHidden.includes(bookingId)) {
        existingHidden.push(bookingId);
        localStorage.setItem(hiddenKey, JSON.stringify(existingHidden));
      }
    } catch (e) {
      console.warn('Lỗi lưu hidden_bookings:', e);
    }
    try {
      await bookingApi.deleteBooking(bookingId);
      await fetchMyServices();
    } catch (err) {
      console.warn('Lỗi xóa booking phía backend:', err);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchMyServices();
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  // Chuẩn hóa dữ liệu thành danh sách hợp nhất
  const unifiedList = [];

  // Khóa học
  if (activeType === 'ALL' || activeType === 'COURSE') {
    enrollments.forEach(e => {
      const isCompleted = e.status === 'COMPLETED' || (e.progressPercent >= 100);
      const isMatchedStatus = statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && isCompleted) ||
        (statusFilter === 'ACTIVE' && !isCompleted);

      const title = e.courseTitle || e.course?.title || 'Khóa học online';
      const tutorName = e.course?.tutor?.displayName || e.tutorName || 'Gia sư EduTutor';
      const matchesSearch = !searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase()) || tutorName.toLowerCase().includes(searchTerm.toLowerCase());

      if (isMatchedStatus && matchesSearch) {
        unifiedList.push({
          type: 'COURSE',
          id: e.id,
          courseId: e.courseId || e.course?.id,
          title: title,
          tutorName: tutorName,
          price: e.pricePaid || e.course?.price || 0,
          status: isCompleted ? 'COMPLETED' : (e.status || 'ACTIVE'),
          progressPercent: e.progressPercent || 0,
          createdAt: e.enrolledAt || e.createdAt,
          originalItem: e
        });
      }
    });
  }

  // Đơn gia sư
  if (activeType === 'ALL' || activeType === 'BOOKING') {
    bookings.forEach(b => {
      const isCompleted = b.status === 'COMPLETED';
      const isMatchedStatus = statusFilter === 'ALL' ||
        (statusFilter === 'COMPLETED' && isCompleted) ||
        (statusFilter === 'ACTIVE' && !isCompleted);

      const title = b.packageName || 'Hợp đồng gia sư 1-1';
      const tutorName = b.tutorName || 'Gia sư';
      const matchesSearch = !searchTerm || title.toLowerCase().includes(searchTerm.toLowerCase()) || tutorName.toLowerCase().includes(searchTerm.toLowerCase());

      if (isMatchedStatus && matchesSearch) {
        unifiedList.push({
          type: 'BOOKING',
          id: b.id,
          title: title,
          tutorName: tutorName,
          tutorId: b.tutorId,
          price: b.totalPrice || 0,
          status: b.status || 'PENDING',
          createdAt: b.createdAt,
          originalItem: b
        });
      }
    });
  }

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #1e1e24 0%, #1e3a8a 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(59, 130, 246, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GraduationCap size={24} color="#60a5fa" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Dịch Vụ Đã Đăng Ký Của Tôi (CN02.14)
                </h3>
                <span style={{ background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>
                  MyServicesFrm
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#cbd5e1' }}>
                Trung tâm quản lý khóa học online và các hợp đồng kèm gia sư 1-1
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={fetchMyServices}
              disabled={isLoading}
              style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{ padding: '14px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Service Type pills */}
          <div style={{ display: 'flex', gap: 6, background: '#e2e8f0', padding: 3, borderRadius: 8 }}>
            {[
              { id: 'ALL', label: `Tất cả (${enrollments.length + bookings.length})` },
              { id: 'COURSE', label: `Khóa học (${enrollments.length})` },
              { id: 'BOOKING', label: `Gia sư 1-1 (${bookings.length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveType(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeType === tab.id ? '#fff' : 'transparent',
                  color: activeType === tab.id ? '#1d4ed8' : '#64748b',
                  fontWeight: activeType === tab.id ? 700 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  boxShadow: activeType === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status filter & search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem', background: '#fff' }}
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Đang học / Đang diễn ra</option>
              <option value="COMPLETED">Đã hoàn thành</option>
            </select>

            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm khóa học, gia sư..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ padding: '6px 12px 6px 30px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Body List */}
        <div style={{ padding: '20px 24px', maxHeight: '68vh', overflowY: 'auto' }}>
          {unifiedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <BookOpen size={40} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Không tìm thấy dịch vụ nào phù hợp.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {unifiedList.map((item) => {
                const isCourse = item.type === 'COURSE';
                return (
                  <div
                    key={`${item.type}-${item.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      background: '#fff',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: isCourse ? '#eff6ff' : '#f5f3ff',
                        color: isCourse ? '#2563eb' : '#7c3aed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {isCourse ? <BookOpen size={22} /> : <GraduationCap size={22} />}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: 4,
                            background: isCourse ? '#dbeafe' : '#ede9fe',
                            color: isCourse ? '#1e40af' : '#6b21a8'
                          }}>
                            {isCourse ? 'KHÓA HỌC ONLINE' : 'GIA SƯ 1-1'}
                          </span>
                          <strong style={{ fontSize: '0.98rem', color: '#0f172a' }}>
                            {item.title}
                          </strong>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 4, fontSize: '0.8rem', color: '#64748b' }}>
                          <span>Gia sư: <strong style={{ color: '#334155' }}>{item.tutorName}</strong></span>
                          <span>Học phí: <strong style={{ color: '#059669' }}>{formatVND(item.price)}</strong></span>
                          {item.createdAt && (
                            <span>Ngày ĐK: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                          )}
                        </div>

                        {/* Progress bar for course */}
                        {isCourse && (
                          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 180, height: 6, background: '#e2e8f0', borderRadius: 100, overflow: 'hidden' }}>
                              <div style={{ width: `${item.progressPercent}%`, height: '100%', background: item.progressPercent >= 100 ? '#16a34a' : '#2563eb', transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: item.progressPercent >= 100 ? '#16a34a' : '#2563eb' }}>
                              Tiến độ: {item.progressPercent}% {item.progressPercent >= 100 ? '✓ Đã hoàn thành' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {isCourse ? (
                        <>
                          {item.status === 'PENDING' ? (
                            <>
                              {onOpenCheckout && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    onClose();
                                    onOpenCheckout({
                                      type: 'course',
                                      item: item.originalItem?.course || { id: item.courseId, title: item.title, price: item.price },
                                      enrollmentId: item.id,
                                      amount: item.price
                                    });
                                  }}
                                  style={{
                                    padding: '7px 12px',
                                    borderRadius: 6,
                                    background: '#2563eb',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5
                                  }}
                                >
                                  <CreditCard size={14} /> Thanh toán ngay
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCancelEnrollment(item.id)}
                                style={{
                                  padding: '7px 12px',
                                  borderRadius: 6,
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fecaca',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5
                                }}
                                title="Hủy đăng ký khóa học này"
                              >
                                <Ban size={14} /> Hủy đơn
                              </button>
                            </>
                          ) : item.status === 'CANCELLED' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteEnrollment(item.id)}
                              style={{
                                padding: '7px 12px',
                                borderRadius: 6,
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5
                              }}
                              title="Xóa vĩnh viễn khỏi danh sách"
                            >
                              <Trash2 size={14} /> Xóa khỏi danh sách
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  if (onOpenCourse) onOpenCourse(item.originalItem?.course || { id: item.courseId });
                                }}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: 6,
                                  background: '#2563eb',
                                  color: '#fff',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <PlayCircle size={15} /> Vào học ngay
                              </button>

                              {/* Nút đánh giá nếu đã học */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (onOpenReview) {
                                    onOpenReview({
                                      type: 'enrollment',
                                      id: item.id,
                                      title: item.title,
                                      tutorName: item.tutorName
                                    });
                                  }
                                }}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: 6,
                                  background: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  fontWeight: 700,
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                                title="Đánh giá chất lượng khóa học"
                              >
                                <Star size={14} color="#d97706" fill="#d97706" /> Đánh giá
                              </button>
                            </>
                          )}
                        </>
                      ) : (
                        <>
                          {item.status === 'CANCELLED' ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteBooking(item.id)}
                              style={{
                                padding: '7px 12px',
                                borderRadius: 6,
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                fontWeight: 700,
                                fontSize: '0.82rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 5
                              }}
                              title="Xóa đơn kết nối này khỏi danh sách"
                            >
                              <Trash2 size={14} /> Xóa khỏi danh sách
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  if (onOpenChat) onOpenChat(item.tutorId);
                                }}
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: 6,
                                  background: '#f5f3ff',
                                  color: '#7c3aed',
                                  border: '1px solid #ddd6fe',
                                  fontWeight: 700,
                                  fontSize: '0.84rem',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6
                                }}
                              >
                                <MessageCircle size={15} /> Nhắn tin
                              </button>

                              {item.status === 'PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelBooking(item.id)}
                                  style={{
                                    padding: '7px 12px',
                                    borderRadius: 6,
                                    background: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    fontWeight: 700,
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 5
                                  }}
                                  title="Hủy đơn kết nối gia sư này"
                                >
                                  <Ban size={14} /> Hủy đơn
                                </button>
                              )}

                              {item.status === 'COMPLETED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (onOpenReview) {
                                      onOpenReview({
                                        type: 'booking',
                                        id: item.id,
                                        title: item.title,
                                        tutorName: item.tutorName
                                      });
                                    }
                                  }}
                                  style={{
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    border: '1px solid #fde68a',
                                    fontWeight: 700,
                                    fontSize: '0.84rem',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6
                                  }}
                                >
                                  <Star size={14} color="#d97706" fill="#d97706" /> Đánh giá
                                </button>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

