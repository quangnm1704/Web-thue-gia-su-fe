import React from 'react';
import { Video, ShieldCheck, Clock, MessageSquareQuote } from 'lucide-react';

export default function ValueProps() {
  const props = [
    {
      icon: Video,
      title: 'Học 1-1 Trực Tuyến & Khóa Học',
      desc: 'Tương tác trực tiếp qua phòng học ảo HD, chia sẻ màn hình và bảng vẽ.'
    },
    {
      icon: ShieldCheck,
      title: 'Gia Sư Kiểm Duyệt 100%',
      desc: 'Hồ sơ, bằng cấp, chứng chỉ và kinh nghiệm giảng dạy được thẩm định nghiêm ngặt.'
    },
    {
      icon: Clock,
      title: 'Lịch Học Tự Chủ Linh Hoạt',
      desc: 'Dễ dàng sắp xếp lịch học phù hợp với thời gian biểu cá nhân của bạn.'
    },
    {
      icon: MessageSquareQuote,
      title: 'Hỗ Trợ & Hoàn Tiền An Tâm',
      desc: 'Chính sách hoàn tiền trong 7 ngày nếu không hài lòng chất lượng buổi học.'
    }
  ];

  return (
    <section className="ud-value-props-section">
      <div className="container">
        <div className="ud-value-props-grid">
          {props.map((p, idx) => {
            const IconComponent = p.icon;
            return (
              <div key={idx} className="ud-prop-card">
                <div className="ud-prop-icon-wrapper">
                  <IconComponent size={24} />
                </div>
                <div className="ud-prop-text">
                  <h4 className="ud-prop-title">{p.title}</h4>
                  <p className="ud-prop-desc">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
