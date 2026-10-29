import React from 'react';
import { Star, Quote } from 'lucide-react';
import { studentReviews } from '../data/mockData';

export default function Testimonials() {
  return (
    <section className="ud-testimonials-section">
      <div className="container">
        <div className="ud-section-header text-center">
          <h2 className="ud-section-title">Học viên nói gì về trải nghiệm tại EduTutor</h2>
          <p className="ud-section-desc">
            Hơn 98% học viên đạt mục tiêu học tập và đỗ vào các trường đại học, chứng chỉ mong muốn.
          </p>
        </div>

        <div className="ud-testimonials-grid">
          {studentReviews.map((rev) => (
            <div key={rev.id} className="ud-testimonial-card">
              <Quote size={28} className="quote-icon" />
              <p className="testimonial-comment">"{rev.comment}"</p>
              
              <div className="testimonial-rating">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="#b4690e" stroke="#b4690e" />
                ))}
              </div>

              <div className="testimonial-user">
                <img src={rev.avatar} alt={rev.studentName} className="user-avatar" />
                <div>
                  <h4 className="user-name">{rev.studentName}</h4>
                  <p className="user-role">{rev.studentRole}</p>
                  <p className="user-course">Đã học: <strong>{rev.courseName}</strong></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
