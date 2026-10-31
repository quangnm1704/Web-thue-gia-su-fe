import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Users,
  UserCheck,
  Briefcase,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Search,
  FileText,
  Trash2
} from 'lucide-react';
import { adminApi, articleApi } from '../services/api';

export default function AdminDashboardModal({ isOpen, onClose, currentUser, onDeleteArticle }) {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [packages, setPackages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Tải dữ liệu tương ứng theo tab
  const fetchData = async () => {
    if (!isOpen || currentUser?.role !== 'ADMIN') return;
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const res = await adminApi.getAllUsers();
        setUsers(res || []);
      } else if (activeTab === 'applications') {
        const res = await adminApi.getTutorApplications();
        setApplications(res || []);
      } else if (activeTab === 'packages') {
        const res = await adminApi.getAllPackages();
        setPackages(res || []);
      } else if (activeTab === 'articles') {
        const res = await articleApi.getArticles();
        setArticles(res || []);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu quản trị:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isOpen, activeTab, currentUser]);

  if (!isOpen || currentUser?.role !== 'ADMIN') return null;

  // Xử lý Khóa / Mở khóa tài khoản người dùng
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionText = newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.displayName || user.email}"?`)) return;

    setProcessingId(user.id);
    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      setNotification(`Đã ${actionText} thành công tài khoản "${user.displayName || user.email}"!`);
      // Cập nhật lại state danh sách users
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái người dùng: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Duyệt đơn gia sư
  const handleApproveApplication = async (appId) => {
    if (!window.confirm('Bạn có chắc chắn muốn DUYỆT đơn ứng tuyển này? Người dùng sẽ được cấp quyền Gia sư.')) return;
    setProcessingId(appId);
    try {
      await adminApi.approveTutorApplication(appId);
      setNotification('Đã duyệt đơn gia sư thành công!');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED' } : a));
    } catch (err) {
      alert('Lỗi duyệt đơn: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Từ chối đơn gia sư
  const handleRejectApplication = async (appId) => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ gia sư:', 'Hồ sơ chưa đáp ứng tiêu chuẩn chuyên môn');
    if (reason === null) return;

    setProcessingId(appId);
    try {
      await adminApi.rejectTutorApplication(appId, reason);
      setNotification('Đã từ chối đơn gia sư.');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED', adminNote: reason } : a));
    } catch (err) {
      alert('Lỗi từ chối đơn: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
      setTimeout(() => setNotification(''), 3000);
    }
  };

  // Xóa bài viết khỏi diễn đàn (Quyền Admin)
  const handleDeleteArticleAdmin = async (art) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}" (Tác giả: ${art.authorNickname || art.author?.displayName || 'Ẩn danh'}) không? Hành động này sẽ xóa vĩnh viễn bài viết và toàn bộ bình luận.`)) {
      return;
    }
    setProcessingId(art.id);
    try {
      if (onDeleteArticle) {
        await onDeleteArticle(art.id);
      } else {
        await articleApi.deleteArticle(art.id);
      }
      setArticles(prev => prev.filter(a => a.id !== art.id));
      setNotification(`Đã xóa bài viết "${art.title}" thành công.`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      alert('Không thể xóa bài viết: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Lọc theo tìm kiếm
  const filteredUsers = users.filter(u =>
    (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredArticles = articles.filter(a =>
    (a.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.content || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.authorNickname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="ud-detail-modal-card animate-fade-in"
        style={{ maxWidth: 960, width: '95%', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '22px 30px', background: 'linear-gradient(135deg, #1e1e24 0%, #2b1055 100%)' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller" style={{ backgroundColor: '#dc2626', color: '#fff' }}>
              <ShieldCheck size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
              Cổng Quản Trị Hệ Thống (Admin Panel)
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.55rem', marginTop: 8, color: '#fff' }}>
              Bảng Điều Khiển Quản Trị Viên
            </h2>
            <p className="detail-sub" style={{ margin: '4px 0 0 0', color: '#e2e8f0' }}>
              Quản lý tài khoản người dùng, phê duyệt hồ sơ ứng tuyển Gia sư & cấu hình dịch vụ EduTutor.
            </p>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', borderBottom: '1px solid #e2e8f0', background: '#fafbfc' }}>
          <div style={{ display: 'flex', gap: 20 }}>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '14px 4px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeTab === 'users' ? '#a435f0' : '#64748b',
                borderBottom: activeTab === 'users' ? '3px solid #a435f0' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Users size={16} /> Quản lý Người dùng ({users.length})
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              style={{
                padding: '14px 4px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeTab === 'applications' ? '#a435f0' : '#64748b',
                borderBottom: activeTab === 'applications' ? '3px solid #a435f0' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <UserCheck size={16} /> Duyệt đơn Gia sư ({applications.length})
            </button>

            <button
              onClick={() => setActiveTab('packages')}
              style={{
                padding: '14px 4px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeTab === 'packages' ? '#a435f0' : '#64748b',
                borderBottom: activeTab === 'packages' ? '3px solid #a435f0' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Briefcase size={16} /> Gói Dịch Vụ Môi Giới ({packages.length})
            </button>

            <button
              onClick={() => setActiveTab('articles')}
              style={{
                padding: '14px 4px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeTab === 'articles' ? '#dc2626' : '#64748b',
                borderBottom: activeTab === 'articles' ? '3px solid #dc2626' : '3px solid transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <FileText size={16} /> Diễn đàn & Bài viết ({articles.length})
            </button>
          </div>

          <button
            className="btn btn-outline"
            onClick={fetchData}
            disabled={loading}
            style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 30px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={16} /> {notification}
          </div>
        )}

        {/* Tab Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 30px' }}>

          {/* TAB 1: QUẢN LÝ NGƯỜI DÙNG */}
          {activeTab === 'users' && (
            <div>
              {/* Search bar */}
              <div style={{ marginBottom: 16, position: 'relative', maxWidth: 400 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, vai trò..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 36px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px', color: '#a435f0' }} />
                  <p>Đang tải danh sách người dùng...</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Tên người dùng</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Email</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Vai trò</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                        <th style={{ padding: '12px 16px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const isSelf = u.id === currentUser?.id;
                        const roleColor = u.role === 'ADMIN' ? '#dc2626' : (u.role === 'TUTOR' ? '#7c3aed' : '#2563eb');
                        const statusColor = u.status === 'ACTIVE' ? '#16a34a' : '#ea580c';

                        return (
                          <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                              {u.displayName || 'Chưa đặt tên'}
                              {isSelf && <span style={{ marginLeft: 6, fontSize: '0.72rem', backgroundColor: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>Bạn</span>}
                            </td>
                            <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.email}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                backgroundColor: roleColor + '15',
                                color: roleColor,
                                padding: '3px 8px',
                                borderRadius: 100,
                                fontSize: '0.78rem',
                                fontWeight: 700
                              }}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                backgroundColor: statusColor + '15',
                                color: statusColor,
                                padding: '3px 8px',
                                borderRadius: 100,
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4
                              }}>
                                {u.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                {u.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              {!isSelf && (
                                <button
                                  onClick={() => handleToggleUserStatus(u)}
                                  disabled={processingId === u.id}
                                  style={{
                                    padding: '5px 12px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: u.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                                    color: u.status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 5
                                  }}
                                >
                                  {u.status === 'ACTIVE' ? <Lock size={12} /> : <Unlock size={12} />}
                                  <span>{u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}</span>
                                </button>
                              )}
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

          {/* TAB 2: DUYỆT ĐƠN ỨNG TUYỂN GIA SƯ */}
          {activeTab === 'applications' && (
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px', color: '#a435f0' }} />
                  <p>Đang tải danh sách hồ sơ ứng tuyển...</p>
                </div>
              ) : applications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#64748b' }}>
                  <UserCheck size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#1e293b' }}>Hiện chưa có đơn ứng tuyển nào</h4>
                  <p style={{ fontSize: '0.88rem' }}>Khi người dùng đăng ký trở thành Gia sư, hồ sơ sẽ hiển thị tại đây để bạn xét duyệt.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '18px 22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                                <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                                  {app.userName || `Ứng viên ID: ${app.userId ? app.userId.substring(0, 8) : 'N/A'}`}
                                </h4>
                                {app.userEmail && (
                                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({app.userEmail})</span>
                                )}
                                <span style={{
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  padding: '3px 10px',
                                  borderRadius: 100,
                                  backgroundColor: app.status === 'APPROVED' ? '#dcfce7' : (app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7'),
                                  color: app.status === 'APPROVED' ? '#15803d' : (app.status === 'REJECTED' ? '#b91c1c' : '#b45309')
                                }}>
                                  {app.status === 'APPROVED' ? 'ĐÃ DUYỆT' : (app.status === 'REJECTED' ? 'ĐÃ TỪ CHỐI' : 'CHỜ DUYỆT')}
                                </span>
                              </div>

                              <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: 16 }}>
                                <span>Mã hồ sơ: <code>{app.id.substring(0, 8)}...</code></span>
                                {app.createdAt && (
                                  <span>Ngày nộp: {new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                                )}
                              </div>
                            </div>

                              {app.status === 'PENDING' && (
                                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                                  <button
                                    onClick={() => handleApproveApplication(app.id)}
                                    disabled={processingId === app.id}
                                    style={{
                                      padding: '8px 16px',
                                      borderRadius: 6,
                                      border: 'none',
                                      backgroundColor: '#16a34a',
                                      color: '#fff',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 6
                                    }}
                                  >
                                    <CheckCircle size={15} /> Phê duyệt Gia sư
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(app.id)}
                                    disabled={processingId === app.id}
                                    style={{
                                      padding: '8px 16px',
                                      borderRadius: 6,
                                      border: '1px solid #fca5a5',
                                      backgroundColor: '#fff',
                                      color: '#dc2626',
                                      fontSize: '0.85rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Từ chối
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Details Content */}
                            <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {app.subjectsCanTeach && (
                                <div>
                                  <strong style={{ color: '#334155' }}>Môn đăng ký dạy: </strong>
                                  <span style={{ color: '#0f172a' }}>{app.subjectsCanTeach}</span>
                                </div>
                              )}
                              {app.bio && (
                                <div>
                                  <strong style={{ color: '#334155' }}>Giới thiệu & Kinh nghiệm: </strong>
                                  <span style={{ color: '#475569', whiteSpace: 'pre-line' }}>{app.bio}</span>
                                </div>
                              )}
                              <div style={{ display: 'flex', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                                {app.cvUrl && (
                                    <a
                                      href={app.cvUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ color: '#a435f0', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                    >
                                      <FileText size={15} /> Mở CV / Bằng cấp ứng tuyển <ExternalLink size={13} />
                                    </a>
                          )}
                                    {app.testSubmission && (
                                      <a
                                        href={app.testSubmission}
                                        target="_blank"
                                        rel="noreferrer"
                                        style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                                      >
                                        <ExternalLink size={14} /> Mở Video dạy thử / Bài test <ExternalLink size={13} />
                                      </a>
                                    )}
                                  </div>
                              </div>

                                  {app.adminNote && (
                                    <div style={{ fontSize: '0.82rem', color: '#b91c1c', fontStyle: 'italic', background: '#fef2f2', padding: '6px 12px', borderRadius: 4 }}>
                                      Ghi chú Admin: {app.adminNote}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
              )}
                          </div>
          )}

                          {/* TAB 4: QUẢN LÝ BÀI VIẾT DIỄN ĐÀN */}
                          {activeTab === 'articles' && (
                            <div>
                              {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px', color: '#dc2626' }} />
                                  <p>Đang tải danh sách bài viết...</p>
                                </div>
                              ) : filteredArticles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                  Không tìm thấy bài viết nào phù hợp.
                                </div>
                              ) : (
                                <div style={{ overflowX: 'auto' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                    <thead>
                                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                        <th style={{ padding: '12px 14px' }}>Tiêu đề bài viết</th>
                                        <th style={{ padding: '12px 14px' }}>Tác giả</th>
                                        <th style={{ padding: '12px 14px' }}>Thời gian đăng</th>
                                        <th style={{ padding: '12px 14px' }}>Trạng thái</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Thao tác Admin</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredArticles.map((art) => (
                                        <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                          <td style={{ padding: '14px', fontWeight: 600, color: '#1e293b', maxWidth: 300 }}>
                                            <div style={{ fontSize: '0.95rem', marginBottom: 4 }}>{art.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                                              {art.content}
                                            </div>
                                          </td>
                                          <td style={{ padding: '14px' }}>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>
                                              {art.authorNickname || art.author?.displayName || 'Thành viên'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '14px', color: '#64748b', fontSize: '0.82rem' }}>
                                            {art.createdAt ? new Date(art.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                                          </td>
                                          <td style={{ padding: '14px' }}>
                                            <span style={{
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              padding: '2px 8px',
                                              borderRadius: 100,
                                              backgroundColor: art.isPublished !== false ? '#dcfce7' : '#fee2e2',
                                              color: art.isPublished !== false ? '#15803d' : '#b91c1c'
                                            }}>
                                              {art.isPublished !== false ? 'Đã xuất bản' : 'Ẩn'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '14px', textAlign: 'right' }}>
                                            <button
                                              onClick={() => handleDeleteArticleAdmin(art)}
                                              disabled={processingId === art.id}
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '6px 12px',
                                                borderRadius: 6,
                                                border: '1px solid #fca5a5',
                                                backgroundColor: '#fee2e2',
                                                color: '#b91c1c',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                cursor: processingId === art.id ? 'not-allowed' : 'pointer'
                                              }}
                                              title="Xóa bài viết này khỏi hệ thống"
                                            >
                                              {processingId === art.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                              ) : (
                                                <Trash2 size={14} color="#b91c1c" />
                                              )}
                                              <span>Xóa bài</span>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB 3: GÓI DỊCH VỤ MÔI GIỚI */}
                          {activeTab === 'packages' && (
                            <div>
                              {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px', color: '#a435f0' }} />
                                  <p>Đang tải danh sách gói dịch vụ...</p>
                                </div>
                              ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                                  {packages.map((pkg) => (
                                    <div
                                      key={pkg.id}
                                      style={{
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 8,
                                        padding: 18,
                                        background: '#fff',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                      }}
                                    >
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#1e293b' }}>{pkg.name}</h4>
                                        <span style={{
                                          fontSize: '0.72rem',
                                          fontWeight: 700,
                                          padding: '2px 8px',
                                          borderRadius: 100,
                                          backgroundColor: pkg.active ? '#dcfce7' : '#f1f5f9',
                                          color: pkg.active ? '#15803d' : '#64748b'
                                        }}>
                                          {pkg.active ? 'Đang hoạt động' : 'Tạm ngưng'}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a435f0', marginBottom: 6 }}>
                                        {formatVND(pkg.price)}
                                      </div>
                                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Phí nền tảng trích lại: <strong>{pkg.platformFeePercent}%</strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB 4: QUẢN LÝ BÀI VIẾT DIỄN ĐÀN */}
                          {activeTab === 'articles' && (
                            <div>
                              {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                  <Loader2 size={30} className="animate-spin" style={{ margin: '0 auto 10px', color: '#dc2626' }} />
                                  <p>Đang tải danh sách bài viết...</p>
                                </div>
                              ) : filteredArticles.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                                  Không tìm thấy bài viết nào phù hợp.
                                </div>
                              ) : (
                                <div style={{ overflowX: 'auto' }}>
                                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                                    <thead>
                                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                                        <th style={{ padding: '12px 14px' }}>Tiêu đề bài viết</th>
                                        <th style={{ padding: '12px 14px' }}>Tác giả</th>
                                        <th style={{ padding: '12px 14px' }}>Thời gian đăng</th>
                                        <th style={{ padding: '12px 14px' }}>Trạng thái</th>
                                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Thao tác Admin</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {filteredArticles.map((art) => (
                                        <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                          <td style={{ padding: '14px', fontWeight: 600, color: '#1e293b', maxWidth: 300 }}>
                                            <div style={{ fontSize: '0.95rem', marginBottom: 4 }}>{art.title}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 280 }}>
                                              {art.content}
                                            </div>
                                          </td>
                                          <td style={{ padding: '14px' }}>
                                            <span style={{ fontWeight: 600, color: '#334155' }}>
                                              {art.authorNickname || art.author?.displayName || 'Thành viên'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '14px', color: '#64748b', fontSize: '0.82rem' }}>
                                            {art.createdAt ? new Date(art.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                                          </td>
                                          <td style={{ padding: '14px' }}>
                                            <span style={{
                                              fontSize: '0.74rem',
                                              fontWeight: 700,
                                              padding: '2px 8px',
                                              borderRadius: 100,
                                              backgroundColor: art.isPublished !== false ? '#dcfce7' : '#fee2e2',
                                              color: art.isPublished !== false ? '#15803d' : '#b91c1c'
                                            }}>
                                              {art.isPublished !== false ? 'Đã xuất bản' : 'Ẩn'}
                                            </span>
                                          </td>
                                          <td style={{ padding: '14px', textAlign: 'right' }}>
                                            <button
                                              onClick={() => handleDeleteArticleAdmin(art)}
                                              disabled={processingId === art.id}
                                              style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                padding: '6px 12px',
                                                borderRadius: 6,
                                                border: '1px solid #fca5a5',
                                                backgroundColor: '#fee2e2',
                                                color: '#b91c1c',
                                                fontWeight: 700,
                                                fontSize: '0.82rem',
                                                cursor: processingId === art.id ? 'not-allowed' : 'pointer'
                                              }}
                                              title="Xóa bài viết này khỏi hệ thống"
                                            >
                                              {processingId === art.id ? (
                                                <Loader2 size={14} className="animate-spin" />
                                              ) : (
                                                <Trash2 size={14} color="#b91c1c" />
                                              )}
                                              <span>Xóa bài</span>
                                            </button>
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

                        {/* Modal Footer */}
                        <div style={{ padding: '14px 30px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                            Quyền quản trị cấp cao • Tài khoản: <strong>{currentUser?.displayName || currentUser?.email}</strong>
                          </span>
                          <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 24px', fontSize: '0.85rem' }}>
                            Đóng
                          </button>
                        </div>
                      </div>
                    </div>
                  );
}

