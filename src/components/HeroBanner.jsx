import React from 'react';
import { Search, CheckCircle, Star, Users, Award, ArrowRight } from 'lucide-react';

export default function HeroBanner({ onSearchTag }) {
  const popularTags = ['Toán 12', 'IELTS 7.5+', 'Java Spring Boot', 'Python AI', 'Hóa Học THPT'];

  return (
    <section className="ud-hero-section">
      <div className="container">
        <div className="ud-hero-card">
          {/* Left Text Card (Udemy Billboard Card) */}
          <div className="ud-hero-content animate-fade-in">
            <div className="ud-hero-pill">
              <Star size={14} className="star-icon" /> Nền tảng giáo dục & gia sư số 1
            </div>
            
            <h1 className="ud-hero-title">
              Nâng tầm tương lai cùng các <span className="highlight">Gia sư giỏi</span> & Khóa học thực chiến
            </h1>
            
            <p className="ud-hero-desc">
              Kết nối trực tiếp 1-1 với đội ngũ giáo viên, thủ khoa trường chuyên và chuyên gia hàng đầu. Lộ trình cá nhân hóa, học thử miễn phí.
            </p>

            {/* Quick action buttons */}
            <div className="ud-hero-actions">
              <a href="#courses" className="btn btn-primary btn-hero">
                Khám phá khóa học <ArrowRight size={18} />
              </a>
              <a href="#tutors" className="btn btn-outline btn-hero-secondary">
                Tìm gia sư 1-1
              </a>
            </div>

            {/* Popular search tags */}
            <div className="ud-popular-tags">
              <span className="tags-label">Xu hướng tìm kiếm:</span>
              <div className="tags-list">
                {popularTags.map((tag) => (
                  <button 
                    key={tag} 
                    className="tag-btn"
                    onClick={() => onSearchTag && onSearchTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="ud-hero-media">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
              alt="Học tập trực tuyến" 
              className="ud-hero-img"
            />
            {/* Floating stats badge */}
            <div className="ud-floating-badge badge-1">
              <div className="badge-icon">
                <Users size={20} />
              </div>
              <div>
                <span className="badge-value">50.000+</span>
                <span className="badge-label">Học viên tin chọn</span>
              </div>
            </div>

            <div className="ud-floating-badge badge-2">
              <div className="badge-icon gold">
                <Award size={20} />
              </div>
              <div>
                <span className="badge-value">100%</span>
                <span className="badge-label">Gia sư kiểm định</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
