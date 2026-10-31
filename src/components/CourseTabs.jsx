import React, { useState } from 'react';
import CourseCard from './CourseCard';
import { featuredCourses } from '../data/mockData';
import { Sparkles, Search, X, BookOpen } from 'lucide-react';

function removeVietnameseTones(str) {
  if (!str) return '';
  str = String(str).toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  str = str.replace(/\u02C6|\u0306|\u031B/g, '');
  return str.trim();
}

export default function CourseTabs({ 
  courses = featuredCourses, 
  onSelectCourse, 
  onAddToCart, 
  wishlist, 
  onToggleWishlist,
  searchKeyword = '',
  onClearSearch = null
}) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Tất cả lĩnh vực' },
    { id: 'it', label: 'Lập trình & CNTT' },
    { id: 'math', label: 'Toán học & Ôn thi' },
    { id: 'english', label: 'Tiếng Anh & IELTS' },
    { id: 'physics', label: 'Vật lý & KHTN' }
  ];

  const cleanSearch = removeVietnameseTones(searchKeyword);

  // Filter by category tab
  const tabFiltered = activeTab === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeTab);

  // Filter by search keyword across title, instructor, highlights, category
  const filteredCourses = cleanSearch
    ? tabFiltered.filter(c => {
        const titleMatch = removeVietnameseTones(c.title).includes(cleanSearch);
        const instructorMatch = removeVietnameseTones(c.instructor).includes(cleanSearch);
        const categoryMatch = removeVietnameseTones(c.category).includes(cleanSearch);
        const highlightMatch = c.highlights && c.highlights.some(h => removeVietnameseTones(h).includes(cleanSearch));
        return titleMatch || instructorMatch || categoryMatch || highlightMatch;
      })
    : tabFiltered;

  return (
    <section className="ud-courses-section" id="courses">
      <div className="container">
        <div className="ud-section-header">
          <div className="ud-header-left">
            <span className="ud-section-tag">
              <Sparkles size={14} /> Khóa học & Buổi kèm chọn lọc
            </span>
            <h2 className="ud-section-title">Khám phá các khóa học thịnh hành nhất</h2>
            <p className="ud-section-desc">
              Được học viên đánh giá cao về tính thực tiễn, hỗ trợ giải đáp trực tiếp 1-1 từ giảng viên.
            </p>
          </div>
        </div>

        {/* Search Filter Active Notice */}
        {cleanSearch && (
          <div style={{
            background: '#f5f3ff',
            border: '1px solid #ddd6fe',
            borderRadius: 8,
            padding: '12px 20px',
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 6px rgba(124, 58, 237, 0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Search size={18} color="#7c3aed" />
              <span style={{ fontSize: '0.95rem', color: '#4c1d95' }}>
                Đang lọc kết quả tìm kiếm theo: <strong>"{searchKeyword}"</strong> — Tìm thấy <strong>{filteredCourses.length}</strong> khóa học
              </span>
            </div>

            {onClearSearch && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onClearSearch}
                style={{
                  fontSize: '0.82rem',
                  padding: '4px 12px',
                  borderColor: '#7c3aed',
                  color: '#7c3aed',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <X size={14} /> Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Udemy Tab Navigation Bar */}
        <div className="ud-tabs-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ud-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Courses Grid */}
        {filteredCourses.length > 0 ? (
          <div className="ud-courses-grid">
            {filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={course}
                onSelectCourse={onSelectCourse}
                onAddToCart={onAddToCart}
                isLiked={wishlist && wishlist.includes(course.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '50px 20px',
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px dashed #cbd5e1',
            margin: '20px 0'
          }}>
            <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#1e293b', marginBottom: 6 }}>
              Không tìm thấy khóa học nào phù hợp
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: 440, margin: '0 auto 16px' }}>
              Không có khóa học nào khớp với từ khóa "<strong>{searchKeyword}</strong>"{activeTab !== 'all' ? ' trong danh mục này' : ''}.
            </p>
            {onClearSearch && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={onClearSearch}
                style={{ padding: '8px 20px', fontSize: '0.88rem' }}
              >
                Xem tất cả khóa học
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
