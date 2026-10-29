import React, { useState } from 'react';
import { Star, Check, Heart, ShoppingCart, Clock, PlayCircle } from 'lucide-react';

export default function CourseCard({ course, onSelectCourse, onAddToCart, isLiked, onToggleWishlist }) {
  const [isHovered, setIsHovered] = useState(false);

  // Format currency VND
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getBadgeClass = (badgeType) => {
    switch (badgeType) {
      case 'bestseller': return 'badge-bestseller';
      case 'toprated': return 'badge-toprated';
      case 'hot': return 'badge-hot';
      default: return 'badge-bestseller';
    }
  };

  return (
    <div 
      className="ud-course-card-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="ud-course-card" onClick={() => onSelectCourse && onSelectCourse(course)}>
        {/* Thumbnail */}
        <div className="ud-card-thumbnail-wrapper">
          <img src={course.thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'} alt={course.title} className="ud-card-img" />
          <div className="ud-card-overlay">
            <span className="ud-play-icon"><PlayCircle size={36} /></span>
          </div>
        </div>

        {/* Content */}
        <div className="ud-card-body">
          <h3 className="ud-card-title" title={course.title}>
            {course.title}
          </h3>
          <p className="ud-card-instructor">{course.instructor || 'Gia sư EduTutor'}</p>

          {/* Rating */}
          <div className="ud-card-rating">
            <span className="rating-score">{course.rating || 4.9}</span>
            <div className="rating-stars">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={13} fill="#b4690e" stroke="#b4690e" />
              ))}
            </div>
            <span className="rating-count">({(course.ratingCount || 1200).toLocaleString()})</span>
          </div>

          {/* Price */}
          <div className="ud-card-price-row">
            <span className="current-price">{formatVND(course.price)}</span>
            {course.originalPrice && (
              <span className="original-price">{formatVND(course.originalPrice)}</span>
            )}
          </div>

          {/* Badge */}
          {course.badge && (
            <div className="ud-card-badge-row">
              <span className={`badge ${getBadgeClass(course.badgeType)}`}>
                {course.badge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Floating Hover Preview (Udemy Characteristic feature) */}
      {isHovered && (
        <div className="ud-hover-preview animate-fade-in">
          <h4 className="preview-title">{course.title}</h4>
          <div className="preview-meta">
            <span className="preview-badge">{course.level || 'Mọi cấp độ'}</span>
            <span>Cập nhật {course.updatedDate || '10/2026'}</span>
            <span>• {course.hours || '24 giờ học'}</span>
          </div>
          <p className="preview-instructor-bio">{course.instructorRole || 'Giảng viên chuyên môn cao'}</p>

          <div className="preview-highlights">
            <div className="highlights-header">Những gì bạn sẽ học:</div>
            {(course.highlights || []).map((h, i) => (
              <div key={i} className="highlight-item">
                <Check size={14} className="check-icon" />
                <span>{h}</span>
              </div>
            ))}
          </div>

          <div className="preview-actions">
            <button 
              className="btn btn-primary preview-cta-btn"
              onClick={() => onSelectCourse && onSelectCourse(course)}
              style={{ flex: 1 }}
            >
              Xem chi tiết
            </button>
            <button
              className="btn btn-outline"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart && onAddToCart(course);
              }}
              title="Thêm vào giỏ hàng"
              style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <ShoppingCart size={18} />
            </button>
            <button 
              className={`preview-wishlist-btn ${isLiked ? 'liked' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist && onToggleWishlist(course.id);
              }}
              title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            >
              <Heart size={18} fill={isLiked ? '#db2777' : 'none'} stroke={isLiked ? '#db2777' : '#2d2f31'} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
