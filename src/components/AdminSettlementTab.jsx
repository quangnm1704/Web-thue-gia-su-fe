import React, { useState } from 'react';
import { Layers, Search, Loader2, CheckCircle2, Clock, Check, AlertCircle } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminSettlementTab() {
  const [serviceType, setServiceType] = useState('BOOKING');
  const [serviceId, setServiceId] = useState('');
  const [settlementData, setSettlementData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [releasing, setReleasing] = useState(false);

  const formatVND = (amt) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!serviceId.trim()) {
      alert('Vui lòng nhập Mã dịch vụ (Booking ID hoặc CourseEnrollment ID)');
      return;
    }
    setLoading(true);
    try {
      const res = await adminApi.getSettlement(serviceType, serviceId.trim());
      setSettlementData(res);
    } catch (err) {
      alert('Không tìm thấy dịch vụ: ' + (err.data?.message || err.message));
      setSettlementData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRelease = async () => {
    if (!settlementData) return;
    const msg = `Xác nhận GIẢI PHÓNG KÝ QUỸ cho dịch vụ này?\n• Thu nhập gia sư: ${formatVND(settlementData.tutorIncome)}\n• Phí sàn: ${formatVND(settlementData.platformFee)}\nTiền sẽ được chuyển ngay lập tức vào ví của hai bên.`;
    if (!window.confirm(msg)) return;

    setReleasing(true);
    try {
      const res = await adminApi.releaseSettlement(settlementData.serviceType, settlementData.serviceId);
      alert('Giải ngân ký quỹ thành công!');
      setSettlementData(res);
    } catch (err) {
      alert('Lỗi giải ngân ký quỹ: ' + (err.data?.message || err.message));
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Layers size={24} color="#7c3aed" />
          Phân Bổ Tiền Dịch Vụ & Giải Ngân Ký Quỹ (CN06.12)
        </h2>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
          Kiểm tra chi tiết cơ cấu phân chia doanh thu (Thu nhập gia sư và Phí hoa hồng sàn) và giải phóng ký quỹ thủ công.
        </p>
      </div>

      {/* Tra cứu SettlementFrm (cboServiceType, txtServiceId, btnSearch) */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ width: 260 }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Loại dịch vụ (cboServiceType)
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
            >
              <option value="BOOKING">Thuê gia sư kèm riêng (Booking)</option>
              <option value="ENROLLMENT">Đăng ký khóa học (Course Enrollment)</option>
            </select>
          </div>

          <div style={{ flex: '1 1 320px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: 6 }}>
              Mã ID dịch vụ (txtServiceId)
            </label>
            <input
              type="text"
              placeholder="Nhập mã UUID của Booking hoặc CourseEnrollment..."
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              background: '#7c3aed',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            <span>Tra Cứu Phân Bổ</span>
          </button>
        </form>
      </div>

      {/* Bảng phân bổ pnlAllocation (btnRelease, btnConfirm) */}
      {settlementData && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, boxShadow: '0 2px 5px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 18 }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '3px 8px', borderRadius: 6 }}>
                  {settlementData.serviceType}
                </span>
                <h3 style={{ margin: '8px 0 4px', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                  {settlementData.serviceTitle}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Mã ID: <code>{settlementData.serviceId}</code> • Trạng thái: <strong>{settlementData.status}</strong>
                </div>
              </div>

              <div>
                {settlementData.escrowReleased ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dcfce7', color: '#15803d', padding: '6px 14px', borderRadius: 100, fontWeight: 700, fontSize: '0.84rem' }}>
                    <CheckCircle2 size={16} />
                    <span>ĐÃ GIẢI NGÂN VỀ VÍ</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: 100, fontWeight: 700, fontSize: '0.84rem' }}>
                      <Clock size={16} />
                      <span>ĐANG TẠM GIỮ (ESCROW HOLD)</span>
                    </span>
                    <button
                      onClick={handleRelease}
                      disabled={releasing}
                      style={{
                        padding: '7px 16px',
                        background: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      {releasing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                      <span>Giải Phóng Ký Quỹ</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Thông tin đối tượng */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>HỌC VIÊN THANH TOÁN</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{settlementData.studentName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{settlementData.studentEmail}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>GIA SƯ THỤ HƯỞNG</div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{settlementData.tutorName}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{settlementData.tutorEmail}</div>
              </div>
            </div>

            {/* 3 Thẻ phân chia tiền */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af' }}>TỔNG TIỀN DỊCH VỤ</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', marginTop: 4 }}>
                  {formatVND(settlementData.totalPrice)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#3b82f6', marginTop: 2 }}>Học viên đã chi trả</div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534' }}>THU NHẬP GIA SƯ (TUTOR)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', marginTop: 4 }}>
                  {formatVND(settlementData.tutorIncome)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#22c55e', marginTop: 2 }}>Gia sư thực nhận về ví</div>
              </div>

              <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b21a8' }}>PHÍ HOA HỒNG SÀN</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#7c3aed', marginTop: 4 }}>
                  {formatVND(settlementData.platformFee)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#a855f7', marginTop: 2 }}>Nền tảng Edututor thu</div>
              </div>
            </div>
          </div>

          {/* Bảng giao dịch liên quan */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.96rem', fontWeight: 700, color: '#0f172a' }}>
              Bút toán giao dịch liên quan ({settlementData.relatedTransactions?.length || 0})
            </h4>
            {(!settlementData.relatedTransactions || settlementData.relatedTransactions.length === 0) ? (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Chưa có bút toán thanh toán nào được ghi nhận.</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '8px 12px', color: '#475569' }}>Mã tham chiếu</th>
                    <th style={{ padding: '8px 12px', color: '#475569' }}>Loại giao dịch</th>
                    <th style={{ padding: '8px 12px', color: '#475569' }}>Số tiền</th>
                    <th style={{ padding: '8px 12px', color: '#475569' }}>Trạng thái</th>
                    <th style={{ padding: '8px 12px', color: '#475569' }}>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {settlementData.relatedTransactions.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600 }}>{tx.referenceCode || tx.id.slice(0, 8)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: tx.type === 'ESCROW_RELEASE' ? '#15803d' : '#2563eb' }}>{tx.type}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{formatVND(tx.amount)}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: '0.74rem', fontWeight: 700, background: tx.status === 'SUCCESS' ? '#dcfce7' : '#fef3c7', color: tx.status === 'SUCCESS' ? '#15803d' : '#b45309' }}>
                          {tx.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{tx.note || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

