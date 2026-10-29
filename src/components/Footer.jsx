import React from 'react';
import { GraduationCap, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="ud-footer">
      {/* Top enterprise banner */}
      <div className="ud-footer-top">
        <div className="container ud-footer-top-inner">
          <div className="footer-top-text">
            <h3>EduTutor Dành Cho Doanh Nghiệp & Tổ Chức</h3>
            <p>Đào tạo nâng cao kỹ năng cho đội ngũ nhân sự với hơn 10.000 khóa học chọn lọc.</p>
          </div>
          <button className="btn btn-primary">Tìm hiểu thêm</button>
        </div>
      </div>

      {/* Main footer columns */}
      <div className="container ud-footer-main">
        <div className="ud-footer-grid">
          <div className="footer-col">
            <h4 className="footer-heading">Về EduTutor</h4>
            <ul className="footer-links">
              <li><a href="#">Giới thiệu về chúng tôi</a></li>
              <li><a href="#">Cơ hội nghề nghiệp</a></li>
              <li><a href="#">Báo chí & Truyền thông</a></li>
              <li><a href="#">Blog chia sẻ</a></li>
              <li><a href="#">Liên hệ chúng tôi</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Khám Phá & Học Tập</h4>
            <ul className="footer-links">
              <li><a href="#tutors">Tìm gia sư 1-1</a></li>
              <li><a href="#courses">Các khóa học trực tuyến</a></li>
              <li><a href="#articles">Diễn đàn cộng đồng</a></li>
              <li><a href="#">Tải ứng dụng di động</a></li>
              <li><a href="#">Bảng xếp hạng gia sư</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Giảng Dạy & Đối Tác</h4>
            <ul className="footer-links">
              <li><a href="#become-tutor">Trở thành Gia sư</a></li>
              <li><a href="#">Quy trình xét duyệt hồ sơ</a></li>
              <li><a href="#">Quy chuẩn giảng dạy</a></li>
              <li><a href="#">Trung tâm hỗ trợ gia sư</a></li>
              <li><a href="#">Chương trình tiếp thị liên kết</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Pháp Lý & Hỗ Trợ</h4>
            <ul className="footer-links">
              <li><a href="#">Trung tâm trợ giúp 24/7</a></li>
              <li><a href="#">Điều khoản sử dụng</a></li>
              <li><a href="#">Chính sách quyền riêng tư</a></li>
              <li><a href="#">Chính sách bảo vệ học phí</a></li>
              <li><a href="#">Giải quyết tranh chấp</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ud-footer-bottom">
          <div className="footer-bottom-left">
            <div className="ud-footer-logo">
              <GraduationCap size={24} />
              <span>Edu<span>Tutor</span></span>
            </div>
            <p className="copyright-text">© 2026 EduTutor, Inc. Bảo lưu mọi quyền.</p>
          </div>

          <div className="footer-bottom-right">
            <button className="btn-lang-selector">
              <Globe size={16} /> <span>Tiếng Việt</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
