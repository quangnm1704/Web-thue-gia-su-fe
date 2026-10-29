import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  Globe, 
  Send, 
  MoreHorizontal, 
  Smile, 
  CheckCircle2, 
  Clock, 
  Bookmark, 
  Eye,
  Loader2,
  Sparkles,
  Heart,
  Trash2
} from 'lucide-react';
import { articleApi } from '../services/api';

export default function ArticlePostModal({ 
  article, 
  isOpen, 
  onClose, 
  currentUser, 
  onOpenAuth,
  onDeleteArticle 
}) {
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(24);
  const [copiedLink, setCopiedLink] = useState(false);
  const commentInputRef = useRef(null);

  // Khởi tạo bài viết và tải bình luận từ CSDL backend
  useEffect(() => {
    if (!isOpen || !article) return;

    // Reset reaction states
    setIsLiked(false);
    setLikesCount(Math.floor(Math.random() * 20) + 12);
    setCommentInput('');
    setCopiedLink(false);

    // Tải danh sách bình luận thật từ CSDL
    async function fetchComments() {
      if (!article.id) return;
      setLoadingComments(true);
      try {
        const res = await articleApi.getComments(article.id);
        if (res && Array.isArray(res)) {
          setComments(res);
        } else {
          setComments([]);
        }
      } catch (err) {
        console.warn('Lỗi lấy bình luận từ backend:', err);
        setComments([]);
      } finally {
        setLoadingComments(false);
      }
    }

    fetchComments();
  }, [isOpen, article]);

  if (!isOpen || !article) return null;

  // Lấy thông tin tác giả
  const authorName = article.author?.displayName || article.authorNickname || article.author || 'Thành viên EduTutor';
  const authorAvatar = article.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
  const postDate = article.date || (article.createdAt ? new Date(article.createdAt).toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Vừa xong');
  const postTitle = article.title || '';
  const postContent = article.content || article.excerpt || '';
  const postCategory = article.category || 'Học Tập & Chia Sẻ';

  // Kiểm tra quyền xóa bài viết: chỉ người đăng hoặc Admin
  const isAuthor = currentUser && (
    (article.authorId && currentUser.id === article.authorId) ||
    (article.author?.id && currentUser.id === article.author.id) ||
    (currentUser.displayName && (currentUser.displayName === article.authorNickname || currentUser.displayName === article.author?.displayName))
  );
  const isAdmin = currentUser?.role === 'ADMIN';
  const canDelete = isAuthor || isAdmin;

  // Xử lý Xóa bài viết
  const handleDeletePost = async () => {
    const roleText = isAdmin ? 'với quyền Quản trị viên (Admin)' : 'của mình';
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${postTitle}" ${roleText} không? Bài viết và toàn bộ bình luận sẽ bị xóa khỏi hệ thống.`)) {
      return;
    }

    setDeleting(true);
    try {
      if (onDeleteArticle) {
        await onDeleteArticle(article.id);
      } else {
        await articleApi.deleteArticle(article.id);
        alert('Đã xóa bài viết thành công!');
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
      const msg = err.data?.message || err.message || 'Không có quyền xóa bài viết';
      alert(`Không thể xóa bài viết: ${msg}`);
    } finally {
      setDeleting(false);
    }
  };

  // Toggle Like
  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
  };

  // Chia sẻ / Copy link
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Focus ô bình luận
  const handleFocusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  // Gửi bình luận mới
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    if (!currentUser) {
      if (onOpenAuth) onOpenAuth('login');
      return;
    }

    setSubmittingComment(true);
    const contentToSend = commentInput.trim();

    try {
      // Gọi API backend lưu bình luận vào PostgreSQL CSDL
      const newCommentResponse = await articleApi.createComment(article.id, contentToSend);
      if (newCommentResponse) {
        setComments(prev => [...prev, newCommentResponse]);
      } else {
        // Fallback optimistic comment
        const mockNewComment = {
          id: 'temp-' + Date.now(),
          userDisplayName: currentUser.displayName || currentUser.username,
          userAvatarUrl: null,
          content: contentToSend,
          createdAt: new Date().toISOString()
        };
        setComments(prev => [...prev, mockNewComment]);
      }
      setCommentInput('');
    } catch (err) {
      console.warn('Lỗi gửi bình luận:', err);
      // Fallback thêm lạc quan cho giao diện
      const mockNewComment = {
        id: 'temp-' + Date.now(),
        userDisplayName: currentUser.displayName || currentUser.username,
        userAvatarUrl: null,
        content: contentToSend,
        createdAt: new Date().toISOString()
      };
      setComments(prev => [...prev, mockNewComment]);
      setCommentInput('');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Định dạng thời gian tương đối
  const formatCommentTime = (isoString) => {
    if (!isoString) return 'Vừa xong';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMin = Math.floor((now - date) / (1000 * 60));
      if (diffMin < 2) return 'Vừa xong';
      if (diffMin < 60) return `${diffMin} phút trước`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return 'Vừa xong';
    }
  };

  return (
    <div className="ud-modal-backdrop" onClick={onClose} style={{ zIndex: 1050 }}>
      <div 
        className="ud-fb-post-modal animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          maxWidth: 680,
          width: '92%',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          fontFamily: 'inherit'
        }}
      >
        {/* Top Title Bar (Facebook style modal header) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid #e4e6eb',
          position: 'relative'
        }}>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1.15rem', color: '#050505' }}>
            Bài viết của {authorName}
          </div>
          <button 
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: '#e4e6eb',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#606770',
              transition: 'background-color 0.2s ease',
              position: 'absolute',
              right: 14,
              top: 10
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d8dadf'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e4e6eb'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Post Content & Comments Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          
          {/* Post Header (Author info, timestamp, audience) */}
          <div style={{ padding: '16px 20px 12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img 
                src={authorAvatar} 
                alt={authorName}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '1px solid #e4e6eb'
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: '1.02rem', color: '#050505' }}>
                    {authorName}
                  </span>
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '2px 8px',
                    borderRadius: 100,
                    backgroundColor: '#e7f3ff',
                    color: '#1877f2',
                    fontWeight: 600
                  }}>
                    Thành viên
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: '#65676b', marginTop: 2 }}>
                  <span>{postDate}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Globe size={13} /> Công khai
                  </span>
                  <span>•</span>
                  <span style={{ color: '#a435f0', fontWeight: 600 }}>#{postCategory}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {canDelete && (
                <button 
                  onClick={handleDeletePost}
                  disabled={deleting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 6,
                    backgroundColor: '#fee2e2',
                    border: '1px solid #fca5a5',
                    color: '#b91c1c',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: deleting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!deleting) {
                      e.currentTarget.style.backgroundColor = '#fecaca';
                      e.currentTarget.style.borderColor = '#f87171';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!deleting) {
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.borderColor = '#fca5a5';
                    }
                  }}
                  title={isAdmin ? 'Xóa bài viết này (Quyền Quản trị viên)' : 'Xóa bài viết của bạn'}
                >
                  <Trash2 size={15} color="#b91c1c" />
                  <span>{deleting ? 'Đang xóa...' : (isAdmin ? 'Xóa bài (Admin)' : 'Xóa bài viết')}</span>
                </button>
              )}

              <button 
                style={{ background: 'none', border: 'none', color: '#65676b', cursor: 'pointer', padding: 8, borderRadius: '50%' }}
                title="Tùy chọn khác"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          </div>

          {/* Post Content (Title & Text Body) */}
          <div style={{ padding: '4px 20px 16px 20px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#050505', marginBottom: 12, lineHeight: 1.35 }}>
              {postTitle}
            </h2>
            <div style={{ 
              fontSize: '1rem', 
              color: '#050505', 
              lineHeight: 1.6, 
              whiteSpace: 'pre-line',
              wordBreak: 'break-word'
            }}>
              {postContent}
            </div>

            {/* Post banner card / Topic badge */}
            <div style={{
              marginTop: 18,
              padding: '14px 18px',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
              border: '1px solid #ddd6fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a435f0', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#4c1d95' }}>Diễn đàn trao đổi học thuật EduTutor</div>
                  <div style={{ fontSize: '0.78rem', color: '#6d28d9' }}>Hỏi đáp chuyên môn và kết nối cùng các chuyên gia hàng đầu</div>
                </div>
              </div>
              <span className="badge badge-bestseller" style={{ fontSize: '0.75rem' }}>{postCategory}</span>
            </div>
          </div>

          {/* Reactions & Stats Bar (Facebook style) */}
          <div style={{
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.88rem',
            color: '#65676b',
            borderTop: '1px solid #ced0d4',
            margin: '0 16px'
          }}>
            {/* Left: Like & Heart Reaction Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#1877f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem'
                }}>
                  👍
                </span>
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: '#fa383e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '0.65rem',
                  marginLeft: -4
                }}>
                  ❤️
                </span>
              </div>
              <span style={{ cursor: 'pointer', fontWeight: 500 }}>
                {likesCount} người thích
              </span>
            </div>

            {/* Right: Comments & Views count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ cursor: 'pointer' }} onClick={handleFocusCommentInput}>
                {comments.length} bình luận
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Eye size={14} /> {article.viewsCount || 28} lượt xem
              </span>
            </div>
          </div>

          {/* Facebook Action Buttons Bar: Thích, Bình luận, Chia sẻ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            padding: '4px 16px',
            borderTop: '1px solid #ced0d4',
            borderBottom: '1px solid #ced0d4',
            margin: '0 16px'
          }}>
            {/* 1. Thích */}
            <button 
              onClick={handleToggleLike}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                color: isLiked ? '#1877f2' : '#65676b',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <ThumbsUp size={18} fill={isLiked ? '#1877f2' : 'none'} color={isLiked ? '#1877f2' : 'currentColor'} />
              <span>{isLiked ? 'Đã thích' : 'Thích'}</span>
            </button>

            {/* 2. Bình luận */}
            <button 
              onClick={handleFocusCommentInput}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                color: '#65676b',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MessageCircle size={18} />
              <span>Bình luận</span>
            </button>

            {/* 3. Chia sẻ */}
            <button 
              onClick={handleShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 0',
                background: 'none',
                border: 'none',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                color: copiedLink ? '#0d6832' : '#65676b',
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Share2 size={18} />
              <span>{copiedLink ? 'Đã sao chép!' : 'Chia sẻ'}</span>
            </button>
          </div>

          {/* ==================== COMMENTS SECTION (BÌNH LUẬN FACEBOOK) ==================== */}
          <div style={{ padding: '16px 20px 24px 20px' }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#050505', marginBottom: 14 }}>
              Bình luận ({comments.length})
            </div>

            {/* Ô nhập bình luận Facebook */}
            <form onSubmit={handleSubmitComment} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 20 }}>
              <div style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                backgroundColor: currentUser?.role === 'TUTOR' ? '#a435f0' : '#1c1d1f',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                flexShrink: 0
              }}>
                {currentUser?.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
              </div>

              <div style={{
                flex: 1,
                backgroundColor: '#f0f2f5',
                borderRadius: 20,
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid transparent',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={() => {}}
              >
                <input 
                  ref={commentInputRef}
                  type="text"
                  placeholder={currentUser ? `Viết bình luận với tên ${currentUser.displayName || currentUser.username}...` : "Đăng nhập để tham gia thảo luận bài viết..."}
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  disabled={submittingComment}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    fontSize: '0.92rem',
                    color: '#050505'
                  }}
                />

                <button 
                  type="submit"
                  disabled={!commentInput.trim() || submittingComment}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: commentInput.trim() ? '#1877f2' : '#bcc0c4',
                    cursor: commentInput.trim() ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 4
                  }}
                  title="Gửi bình luận"
                >
                  {submittingComment ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </form>

            {/* Danh sách bình luận */}
            {loadingComments ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#65676b' }}>
                <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px', color: '#1877f2' }} />
                <span style={{ fontSize: '0.88rem' }}>Đang tải bình luận...</span>
              </div>
            ) : comments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 20px', color: '#65676b', backgroundColor: '#f9fafb', borderRadius: 10 }}>
                <MessageCircle size={32} style={{ color: '#bcc0c4', margin: '0 auto 10px' }} />
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.95rem' }}>Chưa có bình luận nào</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Hãy là người đầu tiên nêu ý kiến về bài viết này!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {comments.map((comment) => {
                  const commenterName = comment.userDisplayName || comment.authorName || 'Thành viên EduTutor';
                  const commentAvatar = comment.userAvatarUrl || null;
                  const commentInitial = commenterName.charAt(0).toUpperCase();

                  return (
                    <div key={comment.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      {/* Avatar */}
                      {commentAvatar ? (
                        <img 
                          src={commentAvatar} 
                          alt={commenterName}
                          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                        />
                      ) : (
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '50%',
                          backgroundColor: '#60a5fa',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '0.88rem',
                          flexShrink: 0
                        }}>
                          {commentInitial}
                        </div>
                      )}

                      {/* Comment Bubble (FB style) */}
                      <div style={{ flex: 1, maxWidth: '88%' }}>
                        <div style={{
                          backgroundColor: '#f0f2f5',
                          borderRadius: 18,
                          padding: '9px 14px',
                          display: 'inline-block',
                          maxWidth: '100%',
                          wordBreak: 'break-word'
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#050505', marginBottom: 2 }}>
                            {commenterName}
                          </div>
                          <div style={{ fontSize: '0.92rem', color: '#050505', lineHeight: 1.4 }}>
                            {comment.content}
                          </div>
                        </div>

                        {/* Comment Actions (Like, Reply, Time) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.78rem', color: '#65676b', marginTop: 3, paddingLeft: 8 }}>
                          <span 
                            style={{ fontWeight: 700, cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            onClick={() => alert('Bạn đã thích bình luận này!')}
                          >
                            Thích
                          </span>
                          <span 
                            style={{ fontWeight: 700, cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                            onClick={() => {
                              setCommentInput(`@${commenterName} `);
                              handleFocusCommentInput();
                            }}
                          >
                            Phản hồi
                          </span>
                          <span>{formatCommentTime(comment.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

