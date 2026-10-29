import React, { useState } from 'react';
import CourseCard from './CourseCard';
import { featuredCourses } from '../data/mockData';
import { Sparkles } from 'lucide-react';

export default function CourseTabs({ courses = featuredCourses, onSelectCourse, onAddToCart, wishlist, onToggleWishlist }) {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Tất cả lĩnh vực' },
    { id: 'it', label: 'Lập trình & CNTT' },
    { id: 'math', label: 'Toán học & Ôn thi' },
    { id: 'english', label: 'Tiếng Anh & IELTS' },
    { id: 'physics', label: 'Vật lý & KHTN' }
  ];

  const filteredCourses = activeTab === 'all' 
    ? courses 
    : courses.filter(c => c.category === activeTab);

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
      </div>
    </section>
  );
}
