import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  MessageCircle, 
  User, 
  Clock, 
  CheckCheck, 
  Loader2, 
  Sparkles, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { conversationApi, messageApi } from '../services/api';

export default function ChatModal({ 
  isOpen, 
  onClose, 
  tutor, 
  targetStudent, 
  targetConversation,
  currentUser, 
  onOpenBook 
}) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  // Đối tượng đang trò chuyện cùng
  const partnerName = tutor 
    ? tutor.name 
    : (targetStudent?.displayName || (targetConversation ? (currentUser?.role === 'STUDENT' ? (targetConversation.tutorName === 'user001' ? 'Gia sư user001 (ThS. Đặng Thị Bích Thủy)' : targetConversation.tutorName) : targetConversation.studentName) : 'Người dùng'));
  const partnerRole = tutor 
    ? 'Gia sư 1-1' 
    : (currentUser?.role === 'STUDENT' ? 'Gia sư 1-1' : 'Học viên');
  const partnerAvatar = tutor?.avatar || 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80';

  // Tự động cuộn xuống tin nhắn mới nhất
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Khởi tạo cuộc hội thoại và tải lịch sử tin nhắn
  useEffect(() => {
    if (!isOpen || !currentUser) return;

    let isMounted = true;
    let pollInterval = null;

    async function initChat() {
      setLoading(true);
      setErrorMsg('');
      try {
        let conv = null;

        if (targetConversation) {
          conv = targetConversation;
        } else if (currentUser.role === 'STUDENT' && tutor) {
          // Nếu là học viên nhắn với gia sư:
          conv = await conversationApi.createDirect(tutor.id);
        } else if (currentUser.role === 'TUTOR') {
          // Gia sư lấy các cuộc trò chuyện của mình
          const myConvs = await conversationApi.getMyConversations();
          if (targetStudent) {
            conv = myConvs.find(c => c.studentId === targetStudent.id);
          }
          if (!conv && myConvs.length > 0) {
            conv = myConvs[0];
          }
        }

        if (!isMounted) return;

        if (conv) {
          setConversation(conv);
          // Lấy tin nhắn lịch sử từ DB
          const history = await messageApi.getMessages(conv.id);
          if (isMounted) {
            setMessages(history || []);
          }

          // Kích hoạt Real-time Polling 1.5s để cập nhật tin nhắn tức thời
          pollInterval = setInterval(async () => {
            try {
              const updated = await messageApi.getMessages(conv.id);
              if (isMounted && updated) {
                setMessages(prev => {
                  // Chỉ cập nhật nếu có tin nhắn mới
                  if (updated.length !== prev.length || (updated.length > 0 && updated[updated.length - 1].id !== prev[prev.length - 1]?.id)) {
                    return updated;
                  }
                  return prev;
                });
              }
            } catch (err) {
              // Bỏ qua lỗi polling nền
            }
          }, 1500);
        } else {
          setErrorMsg('Chưa thể kết nối phiên hội thoại với người dùng này.');
        }
      } catch (err) {
        console.warn('Lỗi kết nối chat:', err);
        if (isMounted) setErrorMsg('Không thể khởi tạo hội thoại: ' + (err.data?.message || err.message));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initChat();

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, tutor, targetStudent, currentUser]);

  if (!isOpen) return null;

  // Gửi tin nhắn mới
  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || !conversation?.id || sending) return;

    setSending(true);
    setInputText('');

    try {
      // 1. Gọi REST API POST /messages (lưu vào CSDL PostgreSQL & phát WebSocket)
      const res = await messageApi.sendMessage(conversation.id, text.trim());
      
      // 2. Cập nhật state tức thời phía client
      if (res) {
        setMessages(prev => [...prev, res]);
      }
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err);
      alert('Không thể gửi tin nhắn: ' + (err.data?.message || err.message));
      setInputText(text); // khôi phục lại input nếu gửi lỗi
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Các gợi ý câu hỏi nhanh
  const quickSuggestions = currentUser?.role === 'STUDENT' ? [
    'Chào gia sư, em muốn hỏi về lịch học kèm 1-1 ạ!',
    'Gia sư có thể dạy vào các buổi tối trong tuần không ạ?',
    'Em có thể đăng ký học thử trước được không ạ?'
  ] : [
    'Chào em! Thầy/cô sẵn sàng dạy kèm vào các buổi tối trong tuần.',
    'Em đang muốn ôn tập môn học và mục tiêu điểm số như thế nào?',
    'Thầy/cô có thể sắp xếp buổi học thử đầu tiên qua Google Meet nhé.'
  ];

  return (
    <div className="ud-modal-backdrop" onClick={onClose}>
      <div 
        className="ud-detail-modal-card animate-fade-in" 
        style={{ maxWidth: 720, height: 680, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Chat Header */}
        <div style={{ padding: '16px 24px', background: '#1c1d1f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ position: 'relative' }}>
              <img 
                src={partnerAvatar} 
                alt={partnerName} 
                style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid #a435f0' }} 
              />
              <span style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, backgroundColor: '#22c55e', borderRadius: '50%', border: '2px solid #1c1d1f' }}></span>
            </div>

            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                {partnerName}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600 }}>
                  ● Đang hoạt động (Thời gian thực)
                </span>
                <span style={{ fontSize: '0.75rem', color: '#8c8c8c' }}>• {partnerRole}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {currentUser?.role === 'STUDENT' && tutor && onOpenBook && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => { onClose(); onOpenBook(tutor); }}
                style={{ padding: '6px 14px', fontSize: '0.85rem' }}
              >
                <Calendar size={14} /> Đặt lịch ngay
              </button>
            )}

            <button 
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 6 }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Notice Bar */}
        <div style={{ padding: '8px 24px', background: '#f7f9fa', borderBottom: '1px solid #e4e8eb', fontSize: '0.8rem', color: '#6a6f73', display: 'flex', justifyContent: 'space-between' }}>
          <span>🔒 Tin nhắn được lưu trữ an toàn trong CSDL PostgreSQL giữa hai bên.</span>
          <span style={{ color: '#0d6832', fontWeight: 600 }}>Tự động đồng bộ Realtime</span>
        </div>

        {/* Chat Messages Body */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto', background: '#fcfcfc', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {errorMsg && (
            <div className="auth-alert error" style={{ margin: 0 }}>
              <AlertCircle size={16} /> <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#6a6f73' }}>
              <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 8px' }} />
              <p style={{ fontSize: '0.9rem' }}>Đang tải lịch sử cuộc trò chuyện...</p>
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', margin: 'auto', color: '#8c8c8c', maxWidth: 360 }}>
              <MessageCircle size={48} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <h4 style={{ color: '#1c1d1f', marginBottom: 4 }}>Bắt đầu cuộc trò chuyện</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Hãy gửi tin nhắn đầu tiên để trao đổi điều kiện học tập, thời gian biểu và học phí cùng {partnerName}.
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const timeStr = msg.createdAt 
                ? new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) 
                : '';

              return (
                <div 
                  key={msg.id || Math.random()} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <span style={{ fontSize: '0.72rem', color: '#8c8c8c', marginBottom: 3, padding: '0 4px' }}>
                    {isMe ? 'Bạn' : (msg.senderName || partnerName)} • {timeStr}
                  </span>

                  <div 
                    style={{
                      background: isMe ? '#a435f0' : '#ffffff',
                      color: isMe ? '#ffffff' : '#1c1d1f',
                      padding: '10px 16px',
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      border: isMe ? 'none' : '1px solid #e4e8eb',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                      fontSize: '0.93rem',
                      lineHeight: 1.45,
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions */}
        <div style={{ padding: '8px 24px', background: '#f7f9fa', borderTop: '1px solid #e4e8eb', display: 'flex', gap: 8, overflowX: 'auto' }}>
          <Sparkles size={14} color="#a435f0" style={{ flexShrink: 0, marginTop: 4 }} />
          {quickSuggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              disabled={sending}
              style={{
                background: '#ffffff',
                border: '1px solid #d1d7dc',
                borderRadius: 100,
                padding: '4px 12px',
                fontSize: '0.78rem',
                color: '#2d2f31',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => e.target.style.borderColor = '#a435f0'}
              onMouseLeave={(e) => e.target.style.borderColor = '#d1d7dc'}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{ padding: '14px 24px', background: '#ffffff', borderTop: '1px solid #e4e8eb', display: 'flex', alignItems: 'center', gap: 12 }}>
          <input 
            type="text"
            placeholder={`Nhập tin nhắn gửi tới ${partnerName}... (Nhấn Enter để gửi)`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={sending}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 24,
              border: '1px solid #d1d7dc',
              outline: 'none',
              fontSize: '0.92rem',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#a435f0'}
            onBlur={(e) => e.target.style.borderColor = '#d1d7dc'}
          />

          <button 
            className="btn btn-primary"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              opacity: !inputText.trim() || sending ? 0.6 : 1
            }}
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}

