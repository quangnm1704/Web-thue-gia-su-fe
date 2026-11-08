import React, { useState, useEffect } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Percent,
  Wallet,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Loader2,
  Calendar,
  BookOpen,
  UserCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import { walletApi, bookingApi, courseApi, withdrawalApi } from '../services/api';

export default function TutorIncomeModal({
  isOpen,
  onClose,
  currentUser,
  onOpenWithdraw
}) {
  const [wallet, setWallet] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' | 'courses' | 'withdrawals'

  const formatVND = (val) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
  };

  const fetchIncomeData = async () => {
    if (!currentUser?.id) return;
    setIsLoading(true);
    try {
      const [walletRes, bookingsRes, coursesRes, withdrawalsRes] = await Promise.allSettled([
        walletApi.getWalletByUserId(currentUser.id),
        bookingApi.getTutorBookings(),
        courseApi.getCourses(),
        withdrawalApi.getMyWithdrawals()
      ]);

      if (walletRes.status === 'fulfilled' && walletRes.value) {
        setWallet(walletRes.value);
      }

      if (bookingsRes.status === 'fulfilled' && bookingsRes.value) {
        const bList = Array.isArray(bookingsRes.value) ? bookingsRes.value : (bookingsRes.value?.result || []);
        setBookings(bList);
      }

      if (coursesRes.status === 'fulfilled' && coursesRes.value) {
        const cList = Array.isArray(coursesRes.value) ? coursesRes.value : (coursesRes.value?.result || []);
        const tutorCourses = cList.filter(c => c.tutorId === currentUser.id);
        setMyCourses(tutorCourses);
      }

      if (withdrawalsRes.status === 'fulfilled' && withdrawalsRes.value) {
        const wList = Array.isArray(withdrawalsRes.value) ? withdrawalsRes.value : (withdrawalsRes.value?.result || []);
        setWithdrawals(wList);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu thu nhập gia sư:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchIncomeData();
    }
  }, [isOpen, currentUser?.id]);

  if (!isOpen) return null;

  // Tính toán các chỉ số tài chính chuẩn theo quy tắc 10% phí nền tảng & 90% thu nhập gia sư
  let grossBookings = 0;
  let platformFeeTotal = 0;
  let tutorIncomeTotal = 0;

  bookings.forEach(b => {
    const total = Number(b.totalPrice) || 0;
    const fee = Number(b.platformFee) || Math.round(total * 0.1);
    const income = Number(b.tutorIncome) || (total - fee);
    grossBookings += total;
    platformFeeTotal += fee;
    tutorIncomeTotal += income;
  });

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1250 }}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 900, padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DollarSign size={26} color="#6ee7b7" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                  Theo Dõi Thu Nhập Gia Sư (CN04.03)
                </h3>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: '#d1fae5',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  Tutor Income Frm
                </span>
              </div>
              <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#a7f3d0' }}>
                Gia sư: <strong>{currentUser?.displayName || currentUser?.username}</strong> — Thống kê chi tiết doanh thu, chiết khấu và số dư khả dụng
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={fetchIncomeData}
              disabled={isLoading}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} /> Làm mới
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px 28px', maxHeight: '78vh', overflowY: 'auto' }}>
          
          {/* KPI Dashboard Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 14,
            marginBottom: 24
          }}>
            {/* Card 1: Tổng doanh thu gộp */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '16px 18px',
              borderTop: '4px solid #3b82f6'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={14} color="#3b82f6" /> Tổng doanh thu gộp
              </span>
              <strong style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', display: 'block', marginTop: 6 }}>
                {formatVND(grossBookings)}
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: 4 }}>
                Từ {bookings.length} hợp đồng thuê gia sư
              </span>
            </div>

            {/* Card 2: Phí nền tảng (10%) */}
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: 10,
              padding: '16px 18px',
              borderTop: '4px solid #ef4444'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Percent size={14} color="#ef4444" /> Phí nền tảng (10%)
              </span>
              <strong style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', display: 'block', marginTop: 6 }}>
                {formatVND(platformFeeTotal)}
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#b91c1c', display: 'block', marginTop: 4 }}>
                Chi phí vận hành & bảo hiểm
              </span>
            </div>

            {/* Card 3: Thu nhập thực nhận (90%) */}
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #dcfce7',
              borderRadius: 10,
              padding: '16px 18px',
              borderTop: '4px solid #16a34a'
            }}>
              <span style={{ fontSize: '0.78rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <DollarSign size={14} color="#16a34a" /> Thu nhập thực nhận (90%)
              </span>
              <strong style={{ fontSize: '1.35rem', fontWeight: 800, color: '#15803d', display: 'block', marginTop: 6 }}>
                {formatVND(tutorIncomeTotal)}
              </strong>
              <span style={{ fontSize: '0.74rem', color: '#166534', display: 'block', marginTop: 4 }}>
                Đã trừ 10% phí môi giới
              </span>
            </div>

            {/* Card 4: Số dư khả dụng & Rút tiền */}
            <div style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#fff',
              borderRadius: 10,
              padding: '16px 18px',
              borderTop: '4px solid #38bdf8',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Wallet size={14} color="#38bdf8" /> Khả dụng rút
                </span>
                <strong style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', display: 'block', marginTop: 4 }}>
                  {formatVND(wallet?.availableBalance || 0)}
                </strong>
                <span style={{ fontSize: '0.72rem', color: '#a78bfa', display: 'block', marginTop: 2 }}>
                  Ký quỹ giữ: {formatVND(wallet?.holdingBalance || 0)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenWithdraw) onOpenWithdraw();
                }}
                style={{
                  marginTop: 10,
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4
                }}
              >
                <ArrowUpRight size={14} /> Rút tiền về STK
              </button>
            </div>
          </div>

          {/* Navigation Tabs for detailed breakdown */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '2px solid #e2e8f0', marginBottom: 18 }}>
            <button
              onClick={() => setActiveTab('bookings')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'bookings' ? '3px solid #059669' : '3px solid transparent',
                color: activeTab === 'bookings' ? '#059669' : '#64748b',
                fontWeight: activeTab === 'bookings' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <UserCheck size={16} /> Chi tiết đơn gia sư ({bookings.length})
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'courses' ? '3px solid #059669' : '3px solid transparent',
                color: activeTab === 'courses' ? '#059669' : '#64748b',
                fontWeight: activeTab === 'courses' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <BookOpen size={16} /> Lớp & Khóa học đã mở ({myCourses.length})
            </button>

            <button
              onClick={() => setActiveTab('withdrawals')}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'none',
                borderBottom: activeTab === 'withdrawals' ? '3px solid #059669' : '3px solid transparent',
                color: activeTab === 'withdrawals' ? '#059669' : '#64748b',
                fontWeight: activeTab === 'withdrawals' ? 700 : 500,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Clock size={16} /> Lịch sử rút thu nhập ({withdrawals.length})
            </button>
          </div>

          {/* Tab 1: Bookings breakdown */}
          {activeTab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Calendar size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Chưa có đơn thuê gia sư nào phát sinh doanh thu.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 14px' }}>Mã Đơn</th>
                        <th style={{ padding: '12px 14px' }}>Học Viên</th>
                        <th style={{ padding: '12px 14px' }}>Gói Dịch Vụ</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Tổng Thu</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right', color: '#dc2626' }}>Phí Sàn (10%)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right', color: '#15803d' }}>Gia Sư Nhận (90%)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Trạng Thái</th>
                        <th style={{ padding: '12px 14px' }}>Ngày Đặt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => {
                        const total = Number(b.totalPrice) || 0;
                        const fee = Number(b.platformFee) || Math.round(total * 0.1);
                        const inc = Number(b.tutorIncome) || (total - fee);
                        return (
                          <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                              #{b.id?.slice(0, 8)}
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                              {b.studentName || 'Học viên'}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748b' }}>
                              {b.packageName || 'Gói gia sư'}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700 }}>
                              {formatVND(total)}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                              -{formatVND(fee)}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', color: '#15803d', fontWeight: 800 }}>
                              +{formatVND(inc)}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                              <span style={{
                                display: 'inline-block',
                                padding: '3px 8px',
                                borderRadius: 4,
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                background: b.status === 'COMPLETED' ? '#dcfce7' : (b.status === 'CONFIRMED' ? '#e0f2fe' : '#fef3c7'),
                                color: b.status === 'COMPLETED' ? '#15803d' : (b.status === 'CONFIRMED' ? '#0369a1' : '#b45309')
                              }}>
                                {b.status === 'COMPLETED' ? 'HOÀN TẤT' : (b.status === 'CONFIRMED' ? 'ĐANG DẠY' : (b.status || 'CHỜ XỬ LÝ'))}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                              {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Courses breakdown */}
          {activeTab === 'courses' && (
            <div>
              {myCourses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <BookOpen size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Bạn chưa tạo khóa học online nào.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                  {myCourses.map((c) => (
                    <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 16 }}>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a', display: 'block', marginBottom: 4 }}>
                        {c.title}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: 8 }}>
                        Môn: {c.subject || c.category} | Thời lượng: {c.durationWeeks || 4} tuần
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: 8 }}>
                        <span style={{ fontSize: '0.82rem', color: '#475569' }}>Học phí niêm yết:</span>
                        <strong style={{ fontSize: '1rem', color: '#059669', fontWeight: 800 }}>
                          {formatVND(c.price)}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Withdrawals breakdown */}
          {activeTab === 'withdrawals' && (
            <div>
              {withdrawals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  <Clock size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>Chưa có lệnh rút tiền nào.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                        <th style={{ padding: '12px 14px' }}>Mã Lệnh</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Số Tiền Rút</th>
                        <th style={{ padding: '12px 14px' }}>Ngân Hàng Nhận</th>
                        <th style={{ padding: '12px 14px' }}>Chủ Tài Khoản</th>
                        <th style={{ padding: '12px 14px', textAlign: 'center' }}>Trạng Thái</th>
                        <th style={{ padding: '12px 14px' }}>Thời Gian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 600 }}>
                            #{w.id?.slice(0, 8)}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            {formatVND(w.amount)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            {w.bankName} - {w.accountNumber}
                          </td>
                          <td style={{ padding: '12px 14px', textTransform: 'uppercase' }}>
                            {w.accountHolder}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: 4,
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              background: w.status === 'COMPLETED' ? '#dcfce7' : (w.status === 'REJECTED' ? '#fee2e2' : '#fef3c7'),
                              color: w.status === 'COMPLETED' ? '#15803d' : (w.status === 'REJECTED' ? '#b91c1c' : '#b45309')
                            }}>
                              {w.status === 'COMPLETED' ? 'ĐÃ DUYỆT' : (w.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT')}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.8rem' }}>
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString('vi-VN') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
