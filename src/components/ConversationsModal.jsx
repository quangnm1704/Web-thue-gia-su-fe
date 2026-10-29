import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Search, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Loader2, 
  User, 
  MessageSquare,
  Sparkles,
  RefreshCw,
  GraduationCap
} from 'lucide-react';
import { conversationApi, messageApi } from '../services/api';
import { topTutors } from '../data/mockData';

export default function ConversationsModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onSelectConversation,
  onNavigateToTutors
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Tải danh sách cuộc trò chuyện cùng tin nhắn mới nhất
  const fetchConversations = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const convList = await conversationApi.getMyConversations();
      
      // Lấy tin nhắn mới nhất cho từng cuộc hội thoại
      const enriched = await Promise.all(
        (convList || []).map(async (c) => {
          try {
            const msgs = await messageApi.getMessages(c.id);
            const lastMsg = msgs && msgs.length > 0 ? msgs[msgs.length - 1] : null;
            return {
              ...c,
              lastMessage: lastMsg?.content || null,
              lastSenderId: lastMsg?.senderId || null,
              lastMessageTime: lastMsg?.createdAt || c.updatedAt || c.createdAt
            };
          } catch {
            return {
              ...c,
              lastMessage: null,
              lastMessageTime: c.updatedAt || c.createdAt
            };
          }
        })
      );

      // Sắp xếp theo tin nhắn mới nhất
      enriched.sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
      setConversations(enriched);
    } catch (err) {
      console.warn('Lỗi tải danh sách cuộc trò chuyện:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Lọc theo từ khóa tìm kiếm
  const filteredConversations = conversations.filter(c => {
    const isStudent = currentUser?.role === 'STUDENT';
    const partnerName = isStudent ? (c.tutorName || 'Gia sư') : (c.studentName || 'Học viên');
    return partnerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Tìm avatar và thông tin hiển thị của đối phương
  const getPartnerInfo = (conv) => {
    const isStudent = currentUser?.role === 'STUDENT';
    if (isStudent) {
      const matchedTutor = topTutors.find(t => t.id === conv.tutorId);
      return {
        name: conv.tutorName === 'user001' ? 'Gia sư user001 (ThS. Đặng Thị Bích Thủy)' : (conv.tutorName || 'Gia sư 1-1'),
        role: 'Gia sư chuyên nghiệp',
        avatar: matchedTutor?.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
        tutorObject: matchedTutor || {
          id: conv.tutorId,
          name: conv.tutorName,
          title: 'Gia sư 1-1 chuyên môn',
          degree: 'ThS. Toán học - Đại học Sư Phạm',
          avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=150&q=80',
          rating: 5.0,
          reviews: 142
        }
      };
    } else {
      return {
        name: conv.studentName || 'Học viên',
        role: 'Học viên đăng ký học',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        studentObject: {
          id: conv.studentId,
          displayName: conv.studentName
        }
      };
    }
  };

  // Format thời gian hiển thị tương đối
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now - date;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMin < 2) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  const handleSelect = (conv) => {
    const partner = getPartnerInfo(conv);
    if (onSelectConversation) {
      onSelectConversation(conv, partner);
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 760, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }} 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="ud-modal-close" onClick={onClose}>
          <X size={22} />
        </button>

        {/* Modal Header */}
        <div className="detail-modal-hero" style={{ padding: '22px 28px' }}>
          <div className="detail-hero-left">
            <span className="badge badge-bestseller" style={{ background: '#a435f0', color: '#fff' }}>
              <MessageCircle size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} /> 
              Messenger EduTutor
            </span>
            <h2 className="detail-title" style={{ fontSize: '1.5rem', marginTop: 8 }}>
              Hộp thư & Cuộc trò chuyện
            </h2>
            <p className="detail-sub" style={{ margin: '4px 0 0 0' }}>
              Trò chuyện trực tiếp theo thời gian thực và thỏa thuận điều kiện học với Gia sư & Học viên.
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid #e4e8eb', background: '#fafbfc', display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#6a6f73' }} />
            <input 
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 38px',
                borderRadius: 6,
                border: '1px solid #d1d7dc',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>

          <button 
            className="btn btn-outline"
            title="Làm mới tin nhắn"
            onClick={() => { setRefreshing(true); fetchConversations(); }}
            disabled={loading || refreshing}
            style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            <span>Làm mới</span>
          </button>
        </div>

        {/* Conversation List */}
        <div style={{ padding: '16px 28px', flex: 1, overflowY: 'auto' }}>
          {loading && !refreshing ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#a435f0' }} />
              <p>Đang tải danh sách cuộc trò chuyện...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: '#6a6f73' }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                borderRadius: '50%', 
                background: '#f7f9fa', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px',
                border: '1px solid #e4e8eb'
              }}>
                <MessageSquare size={32} color="#a435f0" />
              </div>
              <h4 style={{ fontSize: '1.15rem', color: '#1c1d1f', marginBottom: 6 }}>
                {searchTerm ? 'Không tìm thấy cuộc trò chuyện nào phù hợp' : 'Chưa có cuộc trò chuyện nào'}
              </h4>
              <p style={{ maxWidth: 440, margin: '0 auto 20px', fontSize: '0.9rem' }}>
                {searchTerm 
                  ? 'Hãy thử kiểm tra lại từ khóa tìm kiếm của bạn.' 
                  : 'Bạn chưa trao đổi với Gia sư nào. Hãy chọn một Gia sư trong danh sách để bắt đầu hỏi đáp và thỏa thuận lịch học!'}
              </p>
              {!searchTerm && onNavigateToTutors && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    onClose();
                    onNavigateToTutors();
                  }}
                  style={{ padding: '10px 24px' }}
                >
                  <GraduationCap size={16} style={{ marginRight: 6 }} /> Khám phá danh sách Gia sư 1-1
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filteredConversations.map((conv) => {
                const partner = getPartnerInfo(conv);
                const isMyLastMessage = conv.lastSenderId === currentUser?.id;

                return (
                  <div 
                    key={conv.id}
                    onClick={() => handleSelect(conv)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 18px',
                      borderRadius: 10,
                      border: '1px solid #e4e8eb',
                      background: '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#a435f0';
                      e.currentTarget.style.backgroundColor = '#faf5ff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e4e8eb';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Left: Avatar & Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, minWidth: 0, flex: 1 }}>
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img 
                          src={partner.avatar} 
                          alt={partner.name}
                          style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f0f0f0' }}
                        />
                        <span style={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: '#10b981',
                          border: '2px solid #fff'
                        }} title="Trực tuyến" />
                      </div>

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1c1d1f' }}>
                            {partner.name}
                          </h4>
                          <span style={{ 
                            fontSize: '0.72rem', 
                            padding: '2px 8px', 
                            borderRadius: 100, 
                            backgroundColor: '#f3e8ff', 
                            color: '#7e22ce',
                            fontWeight: 600
                          }}>
                            {partner.role}
                          </span>

                          {conv.status === 'AGREED' && (
                            <span style={{
                              fontSize: '0.72rem',
                              padding: '2px 8px',
                              borderRadius: 100,
                              backgroundColor: '#dcfce7',
                              color: '#15803d',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}>
                              <CheckCircle2 size={12} /> Đã thống nhất
                            </span>
                          )}
                        </div>

                        {/* Last message preview */}
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: conv.lastMessage ? '#4b5563' : '#9ca3af',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          maxWidth: '90%'
                        }}>
                          {conv.lastMessage ? (
                            <span>
                              {isMyLastMessage && <strong style={{ color: '#6b7280' }}>Bạn: </strong>}
                              {conv.lastMessage}
                            </span>
                          ) : (
                            <span style={{ fontStyle: 'italic' }}>Chưa có tin nhắn nào. Bấm để bắt đầu nhắn...</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Timestamp & Action */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                      <span style={{ fontSize: '0.75rem', color: '#6a6f73', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={12} /> {formatTime(conv.lastMessageTime)}
                      </span>

                      <button 
                        className="btn btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(conv);
                        }}
                        style={{ 
                          padding: '6px 14px', 
                          fontSize: '0.82rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 5,
                          borderRadius: 6 
                        }}
                      >
                        <span>Nhắn tin</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid #e4e8eb', background: '#f7f9fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.82rem', color: '#6a6f73' }}>
            Tin nhắn được đồng bộ và lưu trữ bảo mật trên hệ thống máy chủ EduTutor.
          </span>
          <button className="btn btn-outline" onClick={onClose} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

