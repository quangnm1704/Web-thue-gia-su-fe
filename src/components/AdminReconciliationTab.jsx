import React, { useState, useEffect } from 'react';
import { PieChart, RefreshCw, Search, Loader2, X, FileText } from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminReconciliationTab() {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);

  const formatVND = (amt) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amt || 0);
  };

  const fetchReconciliationData = async (filterParams = {}) => {
    setLoading(true);
    try {
      const [sumRes, txsRes] = await Promise.allSettled([
        adminApi.getReconciliationSummary(),
        adminApi.getReconciliationTransactions({
          type: filterParams.type !== undefined ? filterParams.type : (type || undefined),
          status: filterParams.status !== undefined ? filterParams.status : (status || undefined),
          referenceCode: filterParams.referenceCode !== undefined ? filterParams.referenceCode : (referenceCode || undefined)
        })
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value) {
        setSummary(sumRes.value);
      }
      if (txsRes.status === 'fulfilled' && Array.isArray(txsRes.value)) {
        setTransactions(txsRes.value);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.warn('Lỗi tải đối soát tài chính:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliationData();
  }, []);

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
            <PieChart size={24} color="#0284c7" />
            Đối Soát Tài Chính & Dòng Tiền (CN06.13)
          </h2>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Báo cáo số dư toàn sàn, tiền ký quỹ đang giữ, thu nhập giải ngân và đối soát chi tiết từng bút toán giao dịch.
          </p>
        </div>

        <button
          onClick={() => fetchReconciliationData()}
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
          <span>Đối soát lại</span>
        </button>
      </div>

      {/* 5 Thẻ đối soát dòng tiền */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 22 }}>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TỔNG TIỀN NẠP VÀO SÀN</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: 6 }}>
              {formatVND(summary.totalDeposits)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Qua cổng thanh toán / ngân hàng</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>DOANH THU PHÍ SÀN</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed', marginTop: 6 }}>
              {formatVND(summary.totalPlatformFees)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Hoa hồng đã chuyển về ví sàn</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>THU NHẬP GIA SƯ ĐÃ GIẢI NGÂN</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', marginTop: 6 }}>
              {formatVND(summary.totalTutorIncomeReleased)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Đã ghi có vào ví gia sư</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TIỀN ĐANG GIỮ KÝ QUỸ</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c', marginTop: 6 }}>
              {formatVND(summary.totalEscrowHolding)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Chờ học xong để thanh toán</div>
          </div>

          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>TIỀN GIA SƯ ĐÃ RÚT RA</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#dc2626', marginTop: 6 }}>
              {formatVND(summary.totalWithdrawn)}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>Chuyển khoản thành công về ngân hàng</div>
          </div>
        </div>
      )}

      {/* Bộ lọc ReconciliationFrm (cboType, txtReferenceCode, btnSearch) */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="">-- Tất cả loại giao dịch --</option>
            <option value="DEPOSIT">DEPOSIT (Nạp tiền)</option>
            <option value="PAYMENT">PAYMENT (Thanh toán)</option>
            <option value="ESCROW_HOLD">ESCROW_HOLD (Tạm giữ ký quỹ)</option>
            <option value="ESCROW_RELEASE">ESCROW_RELEASE (Giải ngân ký quỹ)</option>
            <option value="WITHDRAW">WITHDRAW (Rút tiền)</option>
            <option value="REFUND">REFUND (Hoàn tiền)</option>
          </select>
        </div>

        <div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
          >
            <option value="">-- Tất cả trạng thái --</option>
            <option value="SUCCESS">SUCCESS (Thành công)</option>
            <option value="PENDING">PENDING (Chờ xử lý)</option>
            <option value="FAILED">FAILED (Thất bại)</option>
          </select>
        </div>

        <div style={{ flex: '1 1 200px' }}>
          <input
            type="text"
            placeholder="Mã tham chiếu (txtReferenceCode)..."
            value={referenceCode}
            onChange={(e) => setReferenceCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') fetchReconciliationData(); }}
            style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <button
          onClick={() => fetchReconciliationData()}
          style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Search size={14} />
          <span>Tìm kiếm</span>
        </button>
      </div>

      {/* Bảng bút toán tblReconciliation */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          <div>Đang đối soát giao dịch...</div>
        </div>
      ) : transactions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
          <PieChart size={44} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontWeight: 700, color: '#334155', fontSize: '1rem' }}>Không có bút toán nào phù hợp</div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginTop: 4 }}>
            Hãy thử thay đổi loại giao dịch hoặc mã tham chiếu để tìm kiếm.
          </p>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Mã tham chiếu</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Loại bút toán</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Số tiền</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Số dư sau GD</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Thời gian</th>
                <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600 }}>
                    {tx.referenceCode || tx.id.slice(0, 10)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontWeight: 700,
                      color: tx.type === 'ESCROW_RELEASE' ? '#15803d' : (tx.type === 'DEPOSIT' ? '#0284c7' : (tx.type === 'WITHDRAW' ? '#dc2626' : '#7c3aed'))
                    }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>
                    {formatVND(tx.amount)}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b' }}>
                    {formatVND(tx.balanceAfter)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 100,
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: tx.status === 'SUCCESS' ? '#dcfce7' : (tx.status === 'FAILED' ? '#fee2e2' : '#fef3c7'),
                      color: tx.status === 'SUCCESS' ? '#15803d' : (tx.status === 'FAILED' ? '#b91c1c' : '#b45309')
                    }}>
                      {tx.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.8rem' }}>
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleString('vi-VN') : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button
                      onClick={() => setSelectedTx(tx)}
                      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.78rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal chi tiết bút toán */}
      {selectedTx && (
        <div className="ud-modal-backdrop" onClick={() => setSelectedTx(null)} style={{ zIndex: 1300 }}>
          <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 460, padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#0284c7" /> Chi Tiết Bút Toán Đối Soát
              </h3>
              <button onClick={() => setSelectedTx(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Mã tham chiếu:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{selectedTx.referenceCode || selectedTx.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Loại giao dịch:</span>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>{selectedTx.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Số tiền phát sinh:</span>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{formatVND(selectedTx.amount)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Số dư ví sau GD:</span>
                <span style={{ fontWeight: 700 }}>{formatVND(selectedTx.balanceAfter)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Trạng thái:</span>
                <span style={{ fontWeight: 700, color: selectedTx.status === 'SUCCESS' ? '#15803d' : '#b45309' }}>{selectedTx.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                <span style={{ color: '#64748b' }}>Thời gian ghi sổ:</span>
                <span>{selectedTx.createdAt ? new Date(selectedTx.createdAt).toLocaleString('vi-VN') : 'N/A'}</span>
              </div>
              {selectedTx.note && (
                <div style={{ marginTop: 4, background: '#f8fafc', padding: 10, borderRadius: 6, color: '#334155' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: 2 }}>GHI CHÚ NGHIỆP VỤ:</div>
                  {selectedTx.note}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                onClick={() => setSelectedTx(null)}
                style={{ padding: '8px 18px', borderRadius: 6, border: 'none', background: '#0284c7', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
