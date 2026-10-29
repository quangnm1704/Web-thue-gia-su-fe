import React from 'react';
import { MessageSquare, Eye, PenSquare, Trash2 } from 'lucide-react';
import { communityArticles } from '../data/mockData';

export default function ArticlesSection({ 
  articles = communityArticles, 
  onOpenArticle, 
  onCreateArticle,
  onDeleteArticle,
  currentUser 
}) {
  return (
    <section className="ud-articles-section" id="articles">
      <div className="container">
        <div className="ud-section-header">
          <div className="ud-header-left">
            <h2 className="ud-section-title">Góc chia sẻ kinh nghiệm & Diễn đàn học tập</h2>
            <p className="ud-section-desc">
              Cập nhật mẹo ôn thi, tài liệu tự học và thảo luận trực tiếp cùng cộng đồng học viên & gia sư.
            </p>
          </div>
          <button className="btn btn-outline btn-write-article" onClick={onCreateArticle}>
            <PenSquare size={16} /> Viết bài mới
          </button>
        </div>

        <div className="ud-articles-grid">
          {articles.map((art) => {
            const isAuthor = currentUser && (
              (art.authorId && currentUser.id === art.authorId) ||
              (art.author?.id && currentUser.id === art.author.id) ||
              (currentUser.displayName && (currentUser.displayName === art.authorNickname || currentUser.displayName === art.author?.displayName))
            );
            const isAdmin = currentUser?.role === 'ADMIN';
            const canDeleteCard = isAuthor || isAdmin;

            return (
              <article 
                key={art.id} 
                className="ud-article-card"
                onClick={() => onOpenArticle && onOpenArticle(art)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div className="article-tag" style={{ marginBottom: 0 }}>{art.category || 'Học Tập'}</div>
                  {canDeleteCard && (
                    <button
                      className="btn-card-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        const roleLabel = isAdmin ? 'với quyền Quản trị viên (Admin)' : 'của mình';
                        if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}" ${roleLabel} không?`)) {
                          onDeleteArticle && onDeleteArticle(art.id);
                        }
                      }}
                      title={isAdmin ? 'Xóa bài viết này (Admin)' : 'Xóa bài viết của bạn'}
                      style={{
                        background: '#fef2f2',
                        border: '1px solid #fee2e2',
                        color: '#dc2626',
                        borderRadius: 4,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Trash2 size={13} color="#dc2626" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
                <h3 className="article-title">{art.title}</h3>
              <p className="article-excerpt">{art.excerpt || art.content}</p>

              <div className="article-meta">
                <div className="article-author">
                  <img 
                    src={art.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                    alt={art.author?.displayName || art.authorNickname || 'Tác giả'} 
                    className="author-avatar" 
                  />
                  <div className="author-info">
                    <span className="author-name">{art.author?.displayName || art.authorNickname || 'Tác giả'}</span>
                    <span className="article-date">{art.date || 'Gần đây'}</span>
                  </div>
                </div>

                <div className="article-stats">
                  <span className="stat-item" title="Bình luận">
                    <MessageSquare size={14} /> {art.commentsCount || (art.comments ? art.comments.length : 0)}
                  </span>
                  <span className="stat-item" title="Lượt xem">
                    <Eye size={14} /> {art.viewsCount || 10}
                  </span>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
