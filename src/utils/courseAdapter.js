/**
 * Adapter chuẩn hóa dữ liệu khóa học từ Backend Spring Boot sang format UI
 */
export function formatCourseFromBackend(course, index = 0) {
  if (!course) return null;

  const titleLower = (course.title || '').toLowerCase();
  let category = 'it';
  let defaultThumb = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80';
  let highlights = [
    'Xây dựng các RESTful API chuẩn quốc tế với Spring Boot 3 và Java 21',
    'Làm chủ PostgreSQL, Spring Data JPA, JWT Authentication và Spring Security',
    'Học trực tiếp qua Google Meet kèm giải đáp mã nguồn 1-1'
  ];

  if (titleLower.includes('toán') || titleLower.includes('thpt') || titleLower.includes('toan')) {
    category = 'math';
    defaultThumb = 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80';
    highlights = [
      'Nắm vững phương pháp giải nhanh chuyên đề và câu hỏi phân hóa',
      'Luyện đề bám sát cấu trúc mới nhất với lời giải chi tiết',
      'Học trực tuyến và tương tác trực tiếp qua phòng học Google Meet'
    ];
  } else if (titleLower.includes('tiếng anh') || titleLower.includes('ielts') || titleLower.includes('english')) {
    category = 'english';
    defaultThumb = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80';
    highlights = [
      'Phát triển phản xạ nghe nói tự nhiên và phát âm chuẩn quốc tế',
      'Chiến lược làm bài thi tối ưu điểm số với giáo trình chuẩn',
      'Buổi học tương tác trực tuyến cùng giảng viên qua Google Meet'
    ];
  }

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'
  ];

  const badges = [
    { badge: 'Bán chạy nhất', badgeType: 'bestseller' },
    { badge: 'Được đánh giá cao', badgeType: 'toprated' },
    { badge: 'Mới cập nhật', badgeType: 'hot' }
  ];

  const badgeObj = badges[index % badges.length];

  return {
    ...course,
    instructor: course.tutorName || 'Gia sư EduTutor',
    instructorRole: 'Giảng viên chuyên môn cao',
    instructorAvatar: course.instructorAvatar || defaultAvatars[index % defaultAvatars.length],
    rating: course.rating || (4.9 - (index * 0.05)),
    ratingCount: course.ratingCount || (1250 + index * 420),
    price: course.price || 499000,
    originalPrice: course.originalPrice || Math.round((course.price || 500000) * 1.5),
    discount: '-35%',
    badge: course.badge || badgeObj.badge,
    badgeType: course.badgeType || badgeObj.badgeType,
    thumbnail: course.thumbnail || defaultThumb,
    category: course.category || category,
    level: course.level || 'Mọi cấp độ',
    hours: course.hours || '24 giờ học',
    lessons: course.lessons || 3,
    updatedDate: '10/2026',
    highlights: course.highlights || highlights,
  };
}

