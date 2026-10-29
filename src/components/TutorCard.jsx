import React from 'react';
import { Star, CheckCircle, Calendar, MessageCircle, Award, Users } from 'lucide-react';

export default function TutorCard({ tutor, onBookTutor, onChatTutor }) {
  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="ud-tutor-card">
      <div className="ud-tutor-header">
        <div className="ud-tutor-avatar-wrapper">
          <img src={tutor.avatar} alt={tutor.name} className="ud-tutor-avatar" />
          {tutor.isVerified && (
            <span className="ud-verified-badge" title="Gia sư đã được xác minh bằng cấp">
              <CheckCircle size={16} />
            </span>
          )}
        </div>

        <div className="ud-tutor-meta">
          <h3 className="ud-tutor-name">{tutor.name}</h3>
          <p className="ud-tutor-title">{tutor.title}</p>
          <p className="ud-tutor-degree">
            <Award size={13} className="inline-icon" /> {tutor.degree}
          </p>

          <div className="ud-tutor-stats">
            <div className="tutor-stat-item">
              <Star size={13} fill="#b4690e" stroke="#b4690e" />
              <strong>{tutor.rating}</strong>
              <span className="stat-sub">({tutor.reviews} đánh giá)</span>
            </div>
            <span className="stat-divider">•</span>
            <div className="tutor-stat-item">
              <Users size={13} />
              <span>{tutor.students} học sinh</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ud-tutor-body">
        <p className="ud-tutor-bio">{tutor.bio}</p>

        <div className="ud-tutor-subjects">
          {tutor.subjects.map((sub, i) => (
            <span key={i} className="subject-pill">{sub}</span>
          ))}
        </div>
      </div>

      <div className="ud-tutor-footer">
        <div className="ud-tutor-price">
          <span className="price-label">Học phí:</span>
          <span className="price-val">{formatVND(tutor.hourlyRate)}</span>
          <span className="price-unit">/ giờ</span>
        </div>

        <div className="ud-tutor-actions">
          <button 
            className="btn btn-outline btn-sm"
            onClick={() => onChatTutor && onChatTutor(tutor)}
            title="Nhắn tin trao đổi"
          >
            <MessageCircle size={16} /> Nhắn tin
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onBookTutor && onBookTutor(tutor)}
          >
            <Calendar size={16} /> Đặt lịch học
          </button>
        </div>
      </div>
    </div>
  );
}
