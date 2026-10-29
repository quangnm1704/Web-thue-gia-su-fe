import React from 'react';
import { ArrowRight, Check, Award, DollarSign, Calendar } from 'lucide-react';

export default function BecomeTutorBanner({ onApplyTutor }) {
  return (
    <section className="ud-become-tutor-section" id="become-tutor">
      <div className="container">
        <div className="ud-instructor-banner">
          <div className="instructor-img-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80" 
              alt="Giảng dạy trên EduTutor" 
              className="instructor-banner-img"
            />
          </div>

          <div className="instructor-content">
            <span className="badge badge-toprated">Dành cho Giáo viên & Gia sư</span>
            <h2 className="instructor-title">Trở thành Gia sư & Giảng viên trên EduTutor</h2>
            <p className="instructor-desc">
              Các gia sư hàng đầu từ khắp cả nước đang giảng dạy hàng ngàn học viên trên nền tảng của chúng tôi. Chúng tôi cung cấp công cụ, học viên và quy trình thanh toán minh bạch để bạn tập trung trọn vẹn vào giảng dạy.
            </p>

            <div className="instructor-benefits">
              <div className="benefit-item">
                <DollarSign size={18} className="benefit-icon" />
                <span>Thu nhập hấp dẫn, chiết khấu nền tảng chỉ từ 10%</span>
              </div>
              <div className="benefit-item">
                <Calendar size={18} className="benefit-icon" />
                <span>Chủ động hoàn toàn về thời gian và địa điểm dạy</span>
              </div>
              <div className="benefit-item">
                <Award size={18} className="benefit-icon" />
                <span>Hỗ trợ xây dựng thương hiệu cá nhân uy tín</span>
              </div>
            </div>

            <button className="btn btn-dark btn-lg" onClick={onApplyTutor}>
              Đăng ký nộp hồ sơ gia sư <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
