import React, { useState, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Users,
  UserCheck,
  Briefcase,
  Lock,
  Unlock,
  CheckCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  Search,
  FileText,
  Trash2,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  AlertCircle,
  DollarSign,
  Scale,
  CreditCard,
  GraduationCap,
  Filter,
  Check,
  Clock,
  ArrowUpRight,
  Building2,
  Star,
  BookOpen,
  Layers,
  PieChart,
  X
} from 'lucide-react';
import { adminApi, articleApi, withdrawalApi } from '../services/api';
import AdminReviewsTab from './AdminReviewsTab';
import AdminLessonsTab from './AdminLessonsTab';
import AdminSettlementTab from './AdminSettlementTab';
import AdminReconciliationTab from './AdminReconciliationTab';

export default function AdminPortal({ currentUser, onBackToClient, onLogout, onDeleteArticle }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [packages, setPackages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [withdrawalFilter, setWithdrawalFilter] = useState('ALL');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedWithdrawalForReject, setSelectedWithdrawalForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLogs, setActionLogs] = useState([]);
  const [actionLogFilter, setActionLogFilter] = useState('');
  const [actionLogLoading, setActionLogLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [appStatusFilter, setAppStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [notification, setNotification] = useState('');

  // Tải dữ liệu toàn diện cho Admin Portal
  const fetchAllAdminData = async () => {
    if (currentUser?.role !== 'ADMIN') return;
    setLoading(true);
    try {
      const [usersRes, appsRes, pkgsRes, artsRes] = await Promise.allSettled([
        adminApi.getAllUsers(),
        adminApi.getTutorApplications(),
        adminApi.getAllPackages(),
        articleApi.getArticles()
      ]);

      if (usersRes.status === 'fulfilled' && usersRes.value) setUsers(usersRes.value);
      if (appsRes.status === 'fulfilled' && appsRes.value) setApplications(appsRes.value);
      if (pkgsRes.status === 'fulfilled' && pkgsRes.value) setPackages(pkgsRes.value);
      if (artsRes.status === 'fulfilled' && artsRes.value) setArticles(artsRes.value);

      // Thử tải disputes & withdrawals nếu có endpoint
      try {
        const dispRes = await adminApi.getDisputes();
        if (dispRes) setDisputes(dispRes);
      } catch (e) {
        // Mock fallback if empty
        setDisputes([]);
      }

      try {
        const withRes = await adminApi.getWithdrawals();
        if (withRes) setWithdrawals(withRes);
      } catch (e) {
        setWithdrawals([]);
      }

      try {
        const logsRes = await adminApi.getActionLogs();
        if (logsRes && Array.isArray(logsRes)) setActionLogs(logsRes);
      } catch (e) {
        setActionLogs([]);
      }
    } catch (err) {
      console.warn('Lỗi tải dữ liệu admin portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [currentUser]);

  // Toast notification timer
  const showToast = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Tải nhật ký kiểm toán hệ thống
  const fetchActionLogs = async (params = {}) => {
    setActionLogLoading(true);
    try {
      const logs = await adminApi.getActionLogs(params);
      if (logs && Array.isArray(logs)) {
        setActionLogs(logs);
      } else {
        setActionLogs([]);
      }
    } catch (err) {
      console.warn('Lỗi tải Action Logs:', err);
      setActionLogs([]);
    } finally {
      setActionLogLoading(false);
    }
  };

  // Duyệt & chấp thuận khiếu nại (Hoàn tiền cho học sinh)
  const handleApproveDispute = async (dispId) => {
    if (!window.confirm('Bạn có chắc chắn muốn CHẤP THUẬN khiếu nại này? Hệ thống sẽ hoàn tiền cho học sinh.')) return;
    setProcessingId(dispId);
    try {
      const res = await adminApi.approveDispute(dispId);
      showToast('Đã chấp thuận khiếu nại và tự động hoàn tiền thành công cho học sinh!');
      setDisputes(prev => prev.map(d => d.id === dispId ? { ...d, status: 'APPROVED', ...(res || {}) } : d));
    } catch (err) {
      alert('Lỗi phê duyệt khiếu nại: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Từ chối khiếu nại tranh chấp
  const handleRejectDispute = async (dispId) => {
    if (!window.confirm('Bạn có chắc chắn muốn TỪ CHỐI / BÁC BỎ khiếu nại này?')) return;
    setProcessingId(dispId);
    try {
      const res = await adminApi.rejectDispute(dispId);
      showToast('Đã từ chối khiếu nại tranh chấp.');
      setDisputes(prev => prev.map(d => d.id === dispId ? { ...d, status: 'REJECTED', ...(res || {}) } : d));
    } catch (err) {
      alert('Lỗi từ chối khiếu nại: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Khóa / Mở khóa người dùng
  const handleToggleUserStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionText = newStatus === 'ACTIVE' ? 'kích hoạt' : 'khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} tài khoản "${user.displayName || user.email}"?`)) return;

    setProcessingId(user.id);
    try {
      await adminApi.updateUserStatus(user.id, newStatus);
      showToast(`Đã ${actionText} thành công tài khoản "${user.displayName || user.email}"!`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái người dùng: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Duyệt đơn gia sư
  const handleApproveApplication = async (appId) => {
    if (!window.confirm('Bạn có chắc chắn muốn DUYỆT đơn ứng tuyển này? Người dùng sẽ được cấp quyền Gia sư.')) return;
    setProcessingId(appId);
    try {
      await adminApi.approveTutorApplication(appId);
      showToast('Đã duyệt đơn gia sư thành công! Người dùng đã được cấp quyền TUTOR.');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'APPROVED' } : a));
    } catch (err) {
      alert('Lỗi duyệt đơn: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Từ chối đơn gia sư
  const handleRejectApplication = async (appId) => {
    const reason = window.prompt('Nhập lý do từ chối hồ sơ gia sư:', 'Hồ sơ chuyên môn chưa đáp ứng tiêu chuẩn của nền tảng');
    if (reason === null) return;

    setProcessingId(appId);
    try {
      await adminApi.rejectTutorApplication(appId, reason);
      showToast('Đã từ chối đơn gia sư.');
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: 'REJECTED', adminNote: reason } : a));
    } catch (err) {
      alert('Lỗi từ chối đơn: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Xóa bài viết diễn đàn
  const handleDeleteArticleAdmin = async (art) => {
    if (!window.confirm(`Xóa vĩnh viễn bài viết "${art.title}"?`)) return;
    setProcessingId(art.id);
    try {
      if (onDeleteArticle) {
        await onDeleteArticle(art.id);
      } else {
        await articleApi.deleteArticle(art.id);
      }
      setArticles(prev => prev.filter(a => a.id !== art.id));
      showToast(`Đã xóa bài viết "${art.title}" thành công.`);
    } catch (err) {
      alert('Không thể xóa bài viết: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Duyệt lệnh rút tiền (CN06.11)
  const handleApproveWithdrawal = async (w) => {
    const formattedAmt = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(w.amount);
    if (!window.confirm(`Xác nhận DUYỆT lệnh rút tiền ${formattedAmt} cho ${w.accountHolder} (${w.bankName} - ${w.accountNumber})?`)) return;
    setProcessingId(w.id);
    try {
      const res = await withdrawalApi.approve(w.id);
      showToast(`Đã duyệt thành công lệnh rút tiền #${w.id.slice(0, 8)}!`);
      setWithdrawals(prev => prev.map(item => item.id === w.id ? { ...item, status: 'COMPLETED', ...(res || {}) } : item));
    } catch (err) {
      alert('Lỗi khi duyệt lệnh rút tiền: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  // Mở modal từ chối lệnh rút tiền
  const handleOpenRejectWithdrawal = (w) => {
    setSelectedWithdrawalForReject(w);
    setRejectReason('Thông tin tài khoản ngân hàng không chính xác hoặc không hợp lệ');
    setRejectModalOpen(true);
  };

  // Xác nhận từ chối lệnh rút tiền kèm lý do & hoàn tiền về ví (CN06.11)
  const handleConfirmRejectWithdrawal = async () => {
    if (!selectedWithdrawalForReject) return;
    setProcessingId(selectedWithdrawalForReject.id);
    try {
      const res = await withdrawalApi.reject(selectedWithdrawalForReject.id, rejectReason);
      showToast(`Đã từ chối lệnh rút tiền #${selectedWithdrawalForReject.id.slice(0, 8)} và hoàn trả tiền vào ví!`);
      setWithdrawals(prev => prev.map(item => item.id === selectedWithdrawalForReject.id ? { ...item, status: 'REJECTED', ...(res || {}) } : item));
      setRejectModalOpen(false);
      setSelectedWithdrawalForReject(null);
    } catch (err) {
      alert('Lỗi từ chối lệnh rút tiền: ' + (err.data?.message || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  // Lọc danh sách Users
  const filteredUsers = users.filter(u => {
    const matchesSearch = (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Lọc danh sách Đơn ứng tuyển
  const filteredApps = applications.filter(a => {
    const matchesStatus = appStatusFilter === 'ALL' || a.status === appStatusFilter;
    const matchesSearch = (a.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.userEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.subjectsCanTeach || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Số lượng đơn PENDING chờ duyệt
  const pendingAppsCount = applications.filter(a => a.status === 'PENDING').length;

  // Lọc danh sách Yêu cầu Rút tiền (CN06.11)
  const filteredWithdrawals = withdrawals.filter(w => {
    const matchesStatus = withdrawalFilter === 'ALL' || w.status === withdrawalFilter;
    const matchesSearch = (w.bankName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.accountNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.accountHolder || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (w.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Số lượng lệnh rút tiền PROCESSING chờ duyệt
  const pendingWithdrawalsCount = withdrawals.filter(w => w.status === 'PROCESSING').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'inherit' }}>
      
      {/* 1. TOP ADMIN NAVBAR */}
      <header style={{
        height: 64,
        background: 'linear-gradient(135deg, #1e1e24 0%, #2b1055 100%)',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {/* Brand & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={onBackToClient}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: '#a435f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <GraduationCap size={20} />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Edu<span style={{ color: '#c084fc' }}>Tutor</span>
            </span>
          </div>

          <div style={{ height: 20, width: 1, background: '#475569' }}></div>

          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: '#dc2626',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: 100,
            fontSize: '0.74rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <ShieldCheck size={13} /> Admin Portal
          </span>
        </div>

        {/* Action Controls & Admin User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Back to Client Web */}
          <button
            onClick={onBackToClient}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#f8fafc',
              fontSize: '0.84rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.16)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            title="Quay lại giao diện trang chủ của Học viên"
          >
            <ArrowLeft size={15} />
            <span>Xem trang Web Học viên</span>
          </button>

          {/* User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8, borderLeft: '1px solid rgba(255,255,255,0.15)' }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#dc2626',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700
            }}>
              {(currentUser?.displayName || currentUser?.email || 'A')[0].toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
              <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>
                {currentUser?.displayName || 'Quản trị viên'}
              </span>
              <span style={{ color: '#cbd5e1', fontSize: '0.72rem' }}>
                {currentUser?.email || 'admin@edututor.com'}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
            title="Đăng xuất khỏi tài khoản"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div style={{ display: 'flex', flex: 1 }}>
        
        {/* SIDEBAR */}
        <aside style={{
          width: 250,
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px 0'
        }}>
          {/* Group 1 */}
          <div style={{ padding: '0 16px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tổng quan hệ thống
          </div>
          
          <button
            onClick={() => { setActiveTab('overview'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'overview' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'overview' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'overview' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'overview' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Bảng Điều Khiển</span>
          </button>

          {/* Group 2 */}
          <div style={{ padding: '20px 16px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Nghiệp vụ quản lý
          </div>

          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'users' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'users' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'users' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'users' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Users size={18} />
              <span>Quản lý Người dùng</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {users.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('applications'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'applications' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'applications' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'applications' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'applications' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <UserCheck size={18} />
              <span>Duyệt đơn Gia sư</span>
            </div>
            {pendingAppsCount > 0 ? (
              <span style={{ fontSize: '0.75rem', background: '#ea580c', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                {pendingAppsCount}
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                {applications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('packages'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'packages' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'packages' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'packages' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'packages' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Briefcase size={18} />
              <span>Gói Dịch Vụ Môi Giới</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {packages.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('lessons'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'lessons' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'lessons' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'lessons' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'lessons' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <BookOpen size={18} />
              <span>Quản lý Bài học (CN06.03)</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('disputes'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'disputes' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'disputes' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'disputes' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'disputes' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Scale size={18} />
              <span>Xử lý Tranh chấp</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {disputes.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('withdrawals'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'withdrawals' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'withdrawals' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'withdrawals' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'withdrawals' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <CreditCard size={18} />
              <span>Yêu cầu Rút tiền (CN06.11)</span>
            </div>
            {pendingWithdrawalsCount > 0 ? (
              <span style={{ fontSize: '0.75rem', background: '#ea580c', color: '#fff', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                {pendingWithdrawalsCount}
              </span>
            ) : (
              <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
                {withdrawals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveTab('settlement'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'settlement' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'settlement' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'settlement' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'settlement' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Layers size={18} />
              <span>Phân bổ Tiền DV (CN06.12)</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab('reconciliation'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'reconciliation' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'reconciliation' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'reconciliation' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'reconciliation' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <PieChart size={18} />
              <span>Đối soát Tài chính (CN06.13)</span>
            </div>
          </button>

          {/* Group 3 */}
          {/* Group: Bảo Mật & Kiểm Toán */}
          <div style={{ padding: '20px 16px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Bảo mật & Giám sát
          </div>

          <button
            onClick={() => { setActiveTab('action-logs'); setSearchTerm(''); fetchActionLogs(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'action-logs' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'action-logs' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'action-logs' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'action-logs' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Activity size={18} />
              <span>Nhật Ký Kiểm Toán</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {actionLogs.length}
            </span>
          </button>

          <div style={{ padding: '20px 16px 8px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Cộng đồng & Kiểm duyệt
          </div>

          <button
            onClick={() => { setActiveTab('articles'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'articles' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'articles' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'articles' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'articles' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <FileText size={18} />
              <span>Kiểm duyệt Diễn đàn</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#e2e8f0', color: '#475569', padding: '1px 7px', borderRadius: 10, fontWeight: 700 }}>
              {articles.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('reviews'); setSearchTerm(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '11px 20px',
              border: 'none',
              background: activeTab === 'reviews' ? '#f5f3ff' : 'transparent',
              color: activeTab === 'reviews' ? '#7c3aed' : '#475569',
              fontWeight: activeTab === 'reviews' ? 700 : 500,
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              borderLeft: activeTab === 'reviews' ? '4px solid #7c3aed' : '4px solid transparent'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Star size={18} />
              <span>Đánh giá & Phản hồi (CN06.09)</span>
            </div>
          </button>

          {/* Bottom Refresh */}
          <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={fetchAllAdminData}
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                background: '#fff',
                color: '#334155',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Đồng bộ Dữ liệu</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
          
          {/* Notification Toast */}
          {notification && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#15803d',
              padding: '12px 20px',
              borderRadius: 8,
              fontSize: '0.9rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 20,
              boxShadow: '0 2px 6px rgba(0,0,0,0.05)'
            }}>
              <CheckCircle2 size={18} />
              <span>{notification}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Tổng Quan Nền Tảng EduTutor
                </h2>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
                  Giám sát các chỉ số vận hành, tài khoản người dùng, đơn ứng tuyển và hoạt động sàn.
                </p>
              </div>

              {/* 4 Metric KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, marginBottom: 28 }}>
                
                {/* Metric 1 */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tổng Người Dùng</span>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Users size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{users.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                    {users.filter(u => u.status === 'ACTIVE').length} tài khoản đang hoạt động
                  </div>
                </div>

                {/* Metric 2 */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Đơn Gia Sư Chờ Duyệt</span>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserCheck size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: pendingAppsCount > 0 ? '#ea580c' : '#0f172a' }}>
                    {pendingAppsCount}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Tổng cộng {applications.length} hồ sơ đã nộp
                  </div>
                </div>

                {/* Metric 3 */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Gói Môi Giới Hoạt Động</span>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Briefcase size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{packages.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Gói dịch vụ môi giới kết nối gia sư
                  </div>
                </div>

                {/* Metric 4 */}
                <div style={{ background: '#fff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Bài Viết Diễn Đàn</span>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{articles.length}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 4 }}>
                    Chia sẻ kiến thức cộng đồng
                  </div>
                </div>
              </div>

              {/* Pending Applications Action Banner */}
              {pendingAppsCount > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1px solid #fde68a',
                  borderRadius: 10,
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 28
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <AlertCircle size={28} color="#d97706" />
                    <div>
                      <h4 style={{ margin: 0, color: '#92400e', fontSize: '1.05rem', fontWeight: 700 }}>
                        Có {pendingAppsCount} hồ sơ ứng tuyển Gia sư đang chờ duyệt
                      </h4>
                      <p style={{ margin: '3px 0 0', color: '#b45309', fontSize: '0.88rem' }}>
                        Ứng viên đã nộp thông tin môn dạy, CV và video dạy thử cần Admin thẩm định năng lực.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('applications')}
                    style={{
                      padding: '9px 18px',
                      background: '#d97706',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Duyệt hồ sơ ngay
                  </button>
                </div>
              )}

              {/* Quick Actions Shortcuts */}
              <div style={{ background: '#fff', padding: 24, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: '#0f172a' }}>
                  Lối Tắt Thao Tác Nhanh
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <button
                    onClick={() => setActiveTab('users')}
                    style={{
                      padding: '14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>👥 Quản lý Người dùng</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Khóa hoặc mở khóa tài khoản thành viên</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('applications')}
                    style={{
                      padding: '14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>🎓 Xét duyệt Gia sư</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Thẩm định CV và cấp quyền dạy kèm</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('disputes')}
                    style={{
                      padding: '14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>⚖️ Tranh chấp & Khiếu nại</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Phân xử học phí ký quỹ an toàn</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('articles')}
                    style={{
                      padding: '14px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      background: '#f8fafc',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                  >
                    <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>📝 Quản trị Diễn đàn</span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Kiểm tra bài viết & xóa nội dung vi phạm</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUẢN LÝ NGƯỜI DÙNG */}
          {activeTab === 'users' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Quản Lý Tài Khoản Người Dùng
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Tra cứu thông tin, phân quyền vai trò và khóa tài khoản khi có vi phạm.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  {/* Role filter */}
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, outline: 'none' }}
                  >
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="STUDENT">Học viên (STUDENT)</option>
                    <option value="TUTOR">Gia sư (TUTOR)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>
              </div>

              {/* Search bar */}
              <div style={{ marginBottom: 16, position: 'relative', maxWidth: 420 }}>
                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hiển thị, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                    background: '#fff'
                  }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#7c3aed' }} />
                  <p style={{ color: '#64748b' }}>Đang tải danh sách người dùng...</p>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Tên người dùng</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Email</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Vai trò</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                            Không tìm thấy người dùng nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelf = u.id === currentUser?.id;
                          const roleColor = u.role === 'ADMIN' ? '#dc2626' : (u.role === 'TUTOR' ? '#7c3aed' : '#2563eb');
                          const statusColor = u.status === 'ACTIVE' ? '#16a34a' : '#ea580c';

                          return (
                            <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 18px', fontWeight: 600 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                  <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: '#e0e7ff',
                                    color: '#4338ca',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.82rem'
                                  }}>
                                    {(u.displayName || u.email || 'U')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ color: '#0f172a' }}>{u.displayName || 'Chưa đặt tên'}</div>
                                    {isSelf && <span style={{ fontSize: '0.7rem', background: '#e2e8f0', padding: '1px 5px', borderRadius: 4, color: '#475569' }}>Tài khoản của bạn</span>}
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '14px 18px', color: '#64748b' }}>{u.email}</td>
                              <td style={{ padding: '14px 18px' }}>
                                <span style={{
                                  backgroundColor: roleColor + '15',
                                  color: roleColor,
                                  padding: '4px 10px',
                                  borderRadius: 100,
                                  fontSize: '0.76rem',
                                  fontWeight: 700
                                }}>
                                  {u.role}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px' }}>
                                <span style={{
                                  backgroundColor: statusColor + '15',
                                  color: statusColor,
                                  padding: '4px 10px',
                                  borderRadius: 100,
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4
                                }}>
                                  {u.status === 'ACTIVE' ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                  {u.status}
                                </span>
                              </td>
                              <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                {!isSelf && (
                                  <button
                                    onClick={() => handleToggleUserStatus(u)}
                                    disabled={processingId === u.id}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      border: 'none',
                                      backgroundColor: u.status === 'ACTIVE' ? '#fee2e2' : '#dcfce7',
                                      color: u.status === 'ACTIVE' ? '#b91c1c' : '#15803d',
                                      fontSize: '0.8rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6
                                    }}
                                  >
                                    {u.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                                    <span>{u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DUYỆT ĐƠN ỨNG TUYỂN GIA SƯ */}
          {activeTab === 'applications' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Duyệt Hồ Sơ Ứng Tuyển Gia Sư
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Thẩm định năng lực, chứng chỉ CV và video dạy thử trước khi cấp quyền Gia sư chính thức.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setAppStatusFilter(st)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid',
                        borderColor: appStatusFilter === st ? '#7c3aed' : '#cbd5e1',
                        background: appStatusFilter === st ? '#f5f3ff' : '#fff',
                        color: appStatusFilter === st ? '#7c3aed' : '#475569',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {st === 'ALL' ? 'Tất cả' : (st === 'PENDING' ? 'Chờ duyệt' : (st === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'))}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px 0' }}>
                  <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#7c3aed' }} />
                  <p style={{ color: '#64748b' }}>Đang tải danh sách hồ sơ ứng tuyển...</p>
                </div>
              ) : filteredApps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <UserCheck size={42} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#1e293b', margin: 0 }}>Không có hồ sơ nào phù hợp</h4>
                  <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>Khi người dùng nộp đơn làm gia sư, thông tin sẽ được cập nhật tại đây.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {filteredApps.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: '20px 24px',
                        background: '#fff',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>
                              {app.userName || `Ứng viên ID: ${app.userId ? app.userId.substring(0, 8) : 'N/A'}`}
                            </h4>
                            {app.userEmail && (
                              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>({app.userEmail})</span>
                            )}
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '2px 10px',
                              borderRadius: 100,
                              backgroundColor: app.status === 'APPROVED' ? '#dcfce7' : (app.status === 'REJECTED' ? '#fee2e2' : '#fef3c7'),
                              color: app.status === 'APPROVED' ? '#15803d' : (app.status === 'REJECTED' ? '#b91c1c' : '#b45309')
                            }}>
                              {app.status === 'APPROVED' ? 'ĐÃ DUYỆT' : (app.status === 'REJECTED' ? 'ĐÃ TỪ CHỐI' : 'CHỜ DUYỆT')}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: 16 }}>
                            <span>Mã đơn: <code>{app.id.substring(0, 8)}...</code></span>
                            {app.createdAt && (
                              <span>Ngày nộp: {new Date(app.createdAt).toLocaleDateString('vi-VN')}</span>
                            )}
                          </div>
                        </div>

                        {app.status === 'PENDING' && (
                          <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
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
                                display: 'inline-flex',
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

                      {/* Content box */}
                      <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: 8, fontSize: '0.88rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {app.subjectsCanTeach && (
                          <div>
                            <strong style={{ color: '#334155' }}>Môn đăng ký giảng dạy: </strong>
                            <span style={{ color: '#0f172a', fontWeight: 600 }}>{app.subjectsCanTeach}</span>
                          </div>
                        )}
                        {app.bio && (
                          <div>
                            <strong style={{ color: '#334155' }}>Tiểu sử & Kinh nghiệm sư phạm: </strong>
                            <span style={{ color: '#475569', whiteSpace: 'pre-line' }}>{app.bio}</span>
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 20, marginTop: 4, flexWrap: 'wrap' }}>
                          {app.cvUrl && (
                            <a
                              href={app.cvUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#7c3aed', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            >
                              <FileText size={15} /> Xem CV / Bằng cấp chuyên môn <ExternalLink size={13} />
                            </a>
                          )}
                          {app.testSubmission && (
                            <a
                              href={app.testSubmission}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: '#2563eb', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5 }}
                            >
                              <ExternalLink size={14} /> Mở Video dạy thử / Bài kiểm tra đầu vào <ExternalLink size={13} />
                            </a>
                          )}
                        </div>
                      </div>

                      {app.adminNote && (
                        <div style={{ fontSize: '0.82rem', color: '#b91c1c', background: '#fef2f2', padding: '8px 14px', borderRadius: 6, border: '1px solid #fecaca' }}>
                          <strong>Ghi chú lý do từ chối:</strong> {app.adminNote}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: GÓI DỊCH VỤ MÔI GIỚI */}
          {activeTab === 'packages' && (
            <div>
              <div style={{ marginBottom: 20 }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                  Gói Dịch Vụ & Biểu Phí Môi Giới
                </h2>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                  Giám sát các gói dịch vụ môi giới và kết nối gia sư trên hệ thống.
                </p>
              </div>

              {packages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <Briefcase size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <p>Chưa có gói dịch vụ nào trên hệ thống.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      style={{
                        background: '#fff',
                        border: '1px solid #e2e8f0',
                        borderRadius: 10,
                        padding: 20,
                        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0f172a', fontWeight: 700 }}>{pkg.name}</h4>
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
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#7c3aed', marginBottom: 8 }}>
                        {formatVND(pkg.price)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Phí sàn trích lại: <strong style={{ color: '#0f172a' }}>{pkg.platformFeePercent}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: XỬ LÝ TRANH CHẤP & KHIẾU NẠI */}
          {activeTab === 'disputes' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Phân Xử Khiếu Nại & Tranh Chấp (Disputes)
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Thẩm định khiếu nại từ học sinh (gia sư vắng mặt, sai thỏa thuận) và ra phán quyết hoàn tiền ký quỹ an toàn.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    try {
                      const res = await adminApi.getDisputes();
                      if (res) setDisputes(res);
                      showToast('Đã làm mới danh sách khiếu nại!');
                    } catch (e) {}
                  }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 6, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}
                >
                  <RefreshCw size={14} /> Làm mới
                </button>
              </div>

              {disputes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <Scale size={42} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <h4 style={{ color: '#1e293b', margin: 0 }}>Không có vụ việc tranh chấp nào cần xử lý</h4>
                  <p style={{ fontSize: '0.88rem', margin: '6px 0 0' }}>Mọi buổi học trực tuyến hiện đều diễn ra thuận lợi và an toàn.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {disputes.map((disp) => {
                    const isPending = !disp.status || disp.status === 'PENDING' || disp.status === 'UNDER_REVIEW';
                    const isApproved = disp.status === 'APPROVED';
                    const isRejected = disp.status === 'REJECTED';
                    const isCancelled = disp.status === 'CANCELLED';

                    return (
                      <div
                        key={disp.id}
                        style={{
                          background: '#fff',
                          borderRadius: 12,
                          border: isPending ? '2px solid #fed7aa' : '1px solid #e2e8f0',
                          padding: '20px 24px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <Scale size={18} color="#7c3aed" />
                              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}>
                                Khiếu nại #{disp.id?.substring(0, 8)}...
                              </span>
                              {disp.bookingId && (
                                <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: 6, background: '#eff6ff', color: '#2563eb', fontWeight: 600 }}>
                                  Đơn Booking: {disp.bookingId?.substring(0, 8)}
                                </span>
                              )}
                              {disp.enrollmentId && (
                                <span style={{ fontSize: '0.78rem', padding: '2px 8px', borderRadius: 6, background: '#fdf4ff', color: '#c026d3', fontWeight: 600 }}>
                                  Khóa học: {disp.enrollmentId?.substring(0, 8)}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                              Tạo bởi: <strong>{disp.createdBy || 'Học sinh'}</strong> • Ngày gửi: {disp.createdAt ? new Date(disp.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                            </div>
                          </div>

                          <div>
                            {isPending && (
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#fef3c7', color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Clock size={12} /> Chờ Admin xử lý
                              </span>
                            )}
                            {isApproved && (
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#dcfce7', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle size={12} /> Đã chấp thuận (Đã hoàn tiền)
                              </span>
                            )}
                            {isRejected && (
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#fee2e2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <XCircle size={12} /> Đã bác bỏ
                              </span>
                            )}
                            {isCancelled && (
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '4px 10px', borderRadius: 100, background: '#f1f5f9', color: '#64748b' }}>
                                Học sinh đã hủy
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Lý do khiếu nại */}
                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 8, border: '1px solid #f1f5f9', marginBottom: 14 }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                            LÝ DO KHIẾU NẠI & NỘI DUNG PHẢN ÁNH:
                          </div>
                          <div style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: 1.5 }}>
                            {disp.reason || 'Không có mô tả chi tiết'}
                          </div>
                        </div>

                        {/* Thông tin hoàn tiền & Bằng chứng */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 12 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {disp.refundAmount > 0 && (
                              <div style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                                Số tiền hoàn yêu cầu: <strong style={{ color: '#dc2626' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(disp.refundAmount)}</strong>
                              </div>
                            )}

                            {(disp.evidenceUrl || disp.proofUrl) && (
                              <a
                                href={disp.evidenceUrl || disp.proofUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none' }}
                              >
                                <ExternalLink size={14} /> Xem bằng chứng đối chứng
                              </a>
                            )}
                          </div>

                          {/* Action buttons chỉ hiển thị khi PENDING */}
                          {isPending && (
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button
                                type="button"
                                disabled={processingId === disp.id}
                                onClick={() => handleApproveDispute(disp.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '8px 18px',
                                  borderRadius: 6,
                                  background: '#16a34a',
                                  color: '#fff',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer'
                                }}
                              >
                                {processingId === disp.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={15} />}
                                Chấp thuận & Hoàn tiền
                              </button>

                              <button
                                type="button"
                                disabled={processingId === disp.id}
                                onClick={() => handleRejectDispute(disp.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '8px 16px',
                                  borderRadius: 6,
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  border: '1px solid #fca5a5',
                                  fontWeight: 600,
                                  fontSize: '0.85rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <XCircle size={15} /> Bác bỏ khiếu nại
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: KIỂM DUYỆT DIỄN ĐÀN */}
          {activeTab === 'articles' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Kiểm Duyệt Diễn Đàn & Bài Viết
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Quản lý các bài chia sẻ kinh nghiệm học tập, xóa bài viết vi phạm tiêu chuẩn cộng đồng.
                  </p>
                </div>
              </div>

              {articles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <FileText size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <p>Hiện chưa có bài viết nào trên diễn đàn.</p>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Tiêu đề bài viết</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Tác giả</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Ngày đăng</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Trạng thái</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articles.map((art) => (
                        <tr key={art.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px', maxWidth: 350 }}>
                            <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>{art.title}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {art.content}
                            </div>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155' }}>
                            {art.authorNickname || art.author?.displayName || 'Thành viên'}
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.82rem' }}>
                            {art.createdAt ? new Date(art.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
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
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
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
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Trash2 size={13} />
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

          {/* TAB 7: XỬ LÝ YÊU CẦU RÚT TIỀN (CN06.11) */}
          {activeTab === 'withdrawals' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                    Quản Lý & Duyệt Lệnh Rút Tiền (CN06.11)
                  </h2>
                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.88rem' }}>
                    Kiểm tra thông tin tài khoản ngân hàng của gia sư, duyệt lệnh chuyển tiền hoặc từ chối kèm lý do (tự động hoàn tiền về ví).
                  </p>
                </div>

                {/* Status Filter Buttons */}
                <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                  {['ALL', 'PROCESSING', 'COMPLETED', 'REJECTED'].map((st) => {
                    const isSel = withdrawalFilter === st;
                    const label = st === 'ALL' ? 'Tất cả' : (st === 'PROCESSING' ? `Chờ duyệt (${pendingWithdrawalsCount})` : (st === 'COMPLETED' ? 'Đã duyệt' : 'Đã từ chối'));
                    return (
                      <button
                        key={st}
                        onClick={() => setWithdrawalFilter(st)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: 6,
                          border: 'none',
                          background: isSel ? '#fff' : 'transparent',
                          color: isSel ? '#7c3aed' : '#64748b',
                          fontWeight: isSel ? 700 : 500,
                          fontSize: '0.82rem',
                          cursor: 'pointer',
                          boxShadow: isSel ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredWithdrawals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', color: '#64748b' }}>
                  <CreditCard size={40} style={{ color: '#cbd5e1', margin: '0 auto 12px' }} />
                  <p>Không có yêu cầu rút tiền nào phù hợp.</p>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Mã GD</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Người yêu cầu</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Số tiền rút</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Ngân hàng & STK</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Chủ tài khoản</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'center' }}>Trạng thái</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569' }}>Ngày tạo</th>
                        <th style={{ padding: '12px 18px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWithdrawals.map((w) => (
                        <tr key={w.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 18px', fontFamily: 'monospace', fontWeight: 600, color: '#334155' }}>
                            #{w.id?.slice(0, 8)}
                          </td>
                          <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: '#64748b' }}>
                            <span style={{ fontFamily: 'monospace' }}>{w.userId ? `${w.userId.slice(0, 8)}...` : 'Tutor'}</span>
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                            {formatVND(w.amount)}
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <strong style={{ color: '#0f172a', display: 'block' }}>{w.bankName}</strong>
                            <span style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{w.accountNumber}</span>
                          </td>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: '#334155', textTransform: 'uppercase' }}>
                            {w.accountHolder}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 100,
                              backgroundColor: w.status === 'COMPLETED' ? '#dcfce7' : (w.status === 'REJECTED' ? '#fee2e2' : '#fef3c7'),
                              color: w.status === 'COMPLETED' ? '#15803d' : (w.status === 'REJECTED' ? '#b91c1c' : '#b45309')
                            }}>
                              {w.status === 'COMPLETED' ? 'ĐÃ DUYỆT' : (w.status === 'REJECTED' ? 'TỪ CHỐI' : 'CHỜ DUYỆT')}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '0.82rem' }}>
                            {w.createdAt ? new Date(w.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                          </td>
                          <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                            {w.status === 'PROCESSING' ? (
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleApproveWithdrawal(w)}
                                  disabled={processingId === w.id}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    padding: '5px 10px',
                                    borderRadius: 6,
                                    border: 'none',
                                    backgroundColor: '#16a34a',
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    cursor: 'pointer'
                                  }}
                                  title="Duyệt chuyển tiền thành công"
                                >
                                  {processingId === w.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                  <span>Duyệt</span>
                                </button>
                                <button
                                  onClick={() => handleOpenRejectWithdrawal(w)}
                                  disabled={processingId === w.id}
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
                                  title="Từ chối và hoàn tiền về ví"
                                >
                                  <XCircle size={12} />
                                  <span>Từ chối</span>
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                {w.status === 'COMPLETED' ? 'Đã giải ngân' : 'Đã hoàn ví'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 8: QUẢN LÝ BÀI HỌC (CN06.03) */}
          {activeTab === 'lessons' && <AdminLessonsTab />}

          {/* TAB 9: PHÂN BỔ TIỀN DỊCH VỤ (CN06.12) */}
          {activeTab === 'settlement' && <AdminSettlementTab />}

          {/* TAB 10: ĐỐI SOÁT TÀI CHÍNH (CN06.13) */}
          {activeTab === 'reconciliation' && <AdminReconciliationTab />}

          {/* TAB 11: ĐÁNH GIÁ & PHẢN HỒI (CN06.09) */}
          {activeTab === 'reviews' && <AdminReviewsTab />}

        </main>
      </div>

      {/* MODAL TỪ CHỐI LỆNH RÚT TIỀN (CN06.11) */}
      {rejectModalOpen && selectedWithdrawalForReject && (
        <div className="ud-modal-backdrop" onClick={() => setRejectModalOpen(false)} style={{ zIndex: 1300 }}>
          <div className="ud-detail-modal-card animate-fade-in" style={{ maxWidth: 480, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#b91c1c', display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={20} color="#dc2626" /> Từ Chối Lệnh Rút Tiền
              </h3>
              <button onClick={() => setRejectModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12, marginBottom: 16, fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Số tiền rút:</span>
                <strong style={{ color: '#0f172a' }}>{formatVND(selectedWithdrawalForReject.amount)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#64748b' }}>Ngân hàng:</span>
                <span style={{ fontWeight: 600 }}>{selectedWithdrawalForReject.bankName} - {selectedWithdrawalForReject.accountNumber}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Chủ tài khoản:</span>
                <span style={{ fontWeight: 600, textTransform: 'uppercase' }}>{selectedWithdrawalForReject.accountHolder}</span>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                Lý do từ chối (Gia sư sẽ nhìn thấy thông báo này):
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: 6, padding: '10px 12px', marginBottom: 18, fontSize: '0.8rem', color: '#c2410c' }}>
              💡 Khi xác nhận, số tiền <strong>{formatVND(selectedWithdrawalForReject.amount)}</strong> sẽ được tự động hoàn trả vào ví của người dùng.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectWithdrawal}
                disabled={processingId === selectedWithdrawalForReject.id || !rejectReason.trim()}
                style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {processingId === selectedWithdrawalForReject.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Xác nhận Từ chối & Hoàn ví
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

