export const categories = [
  { id: 'math', name: 'Toán học & Luyện thi', count: '1.240 khóa học', icon: 'Calculator' },
  { id: 'it', name: 'Lập trình & CNTT', count: '3.580 khóa học', icon: 'Code' },
  { id: 'english', name: 'Tiếng Anh & IELTS', count: '2.150 khóa học', icon: 'Languages' },
  { id: 'physics', name: 'Vật lý & Hóa học', count: '940 khóa học', icon: 'Atom' },
  { id: 'business', name: 'Kinh doanh & Marketing', count: '1.820 khóa học', icon: 'Briefcase' },
  { id: 'design', name: 'Thiết kế đồ họa', count: '1.100 khóa học', icon: 'Palette' },
  { id: 'music', name: 'Âm nhạc & Nghệ thuật', count: '650 khóa học', icon: 'Music' },
  { id: 'softskills', name: 'Kỹ năng mềm', count: '890 khóa học', icon: 'Sparkles' },
];

export const featuredCourses = [
  {
    id: 'c1',
    title: 'Khóa Học Toàn Diện Lập Trình Java & Spring Boot Full-Stack 2026',
    instructor: 'ThS. Nguyễn Văn Toàn',
    instructorRole: 'Senior Software Engineer tại FPT Software',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    rating: 4.9,
    ratingCount: 3820,
    price: 499000,
    originalPrice: 1299000,
    discount: '-62%',
    badge: 'Bán chạy nhất',
    badgeType: 'bestseller',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
    category: 'it',
    level: 'Mọi trình độ',
    hours: '42 giờ học',
    lessons: 185,
    updatedDate: '10/2026',
    highlights: [
      'Xây dựng các RESTful API chuẩn quốc tế với Spring Boot 3 và Java 21',
      'Làm chủ PostgreSQL, Spring Data JPA, JWT Authentication và Spring Security',
      'Triển khai ứng dụng lên Docker, CI/CD và kiến trúc Microservices thực tế'
    ]
  },
  {
    id: 'c2',
    title: 'Bí Quyết Chinh Phục Điểm 9+ Môn Toán Thi Tốt Nghiệp THPT Quốc Gia',
    instructor: 'Thầy Trần Đình Cương',
    instructorRole: 'Thủ khoa ĐH Sư Phạm, 10 năm kinh nghiệm luyện thi',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    rating: 4.95,
    ratingCount: 4210,
    price: 399000,
    originalPrice: 950000,
    discount: '-58%',
    badge: 'Được đánh giá cao',
    badgeType: 'toprated',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80',
    category: 'math',
    level: 'Lớp 12 & Luyện thi',
    hours: '56 giờ học',
    lessons: 220,
    updatedDate: '09/2026',
    highlights: [
      'Nắm vững phương pháp giải nhanh Hàm số, Hình học Oxyz và Tích phân',
      'Bộ 50 đề thi thử bám sát ma trận đề Bộ Giáo Dục kèm lời giải video chi tiết',
      'Kỹ thuật bấm máy Casio siêu tốc giải quyết câu hỏi vận dụng cao'
    ]
  },
  {
    id: 'c3',
    title: 'Luyện Thi IELTS Cấp Tốc Từ 5.0 Lên 7.5+ - 4 Kỹ Năng Toàn Diện',
    instructor: 'Cô Sarah Hoàng & Thầy Alex Smith',
    instructorRole: 'IELTS 8.5 Overall, Giảng viên BC & IDP',
    instructorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    rating: 4.88,
    ratingCount: 2950,
    price: 649000,
    originalPrice: 1500000,
    discount: '-57%',
    badge: 'Bán chạy nhất',
    badgeType: 'bestseller',
    thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80',
    category: 'english',
    level: 'Trung cấp đến Nâng cao',
    hours: '68 giờ học',
    lessons: 140,
    updatedDate: '10/2026',
    highlights: [
      'Công thức phát triển ý tưởng và từ vựng band 8.0 cho Writing Task 1 & 2',
      'Chiến thuật xử lý bẫy trong Listening Section 3 & 4 và Reading Passage 3',
      'Chữa phát âm chuẩn IPA và phản xạ tự nhiên trong Speaking Part 1, 2, 3'
    ]
  },
  {
    id: 'c4',
    title: 'Khóa Học Khoa Học Dữ Liệu & Machine Learning Thực Chiến Với Python',
    instructor: 'TS. Phạm Hoàng Nam',
    instructorRole: 'AI Research Scientist tại Viettel AI',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    rating: 4.92,
    ratingCount: 1840,
    price: 549000,
    originalPrice: 1400000,
    discount: '-61%',
    badge: 'Mới & Nổi bật',
    badgeType: 'hot',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
    category: 'it',
    level: 'Mọi trình độ',
    hours: '38 giờ học',
    lessons: 160,
    updatedDate: '10/2026',
    highlights: [
      'Thành thạo NumPy, Pandas, Matplotlib và Scikit-Learn qua 8 dự án thực tế',
      'Hiểu sâu bản chất các mô hình phân loại, hồi quy, cây quyết định và Deep Learning',
      'Xây dựng và triển khai mô hình dự đoán tài chính và nhận diện hình ảnh'
    ]
  },
  {
    id: 'c5',
    title: 'Chuyên Đề Vật Lý 12: Dao Động Cơ, Sóng Cơ & Dòng Điện Xoay Chiều',
    instructor: 'Thầy Lê Quốc Tuấn',
    instructorRole: 'Cựu giáo viên THPT Chuyên Hà Nội - Amsterdam',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
    rating: 4.85,
    ratingCount: 1620,
    price: 349000,
    originalPrice: 850000,
    discount: '-59%',
    badge: 'Được đánh giá cao',
    badgeType: 'toprated',
    thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80',
    category: 'physics',
    level: 'Lớp 12',
    hours: '45 giờ học',
    lessons: 130,
    updatedDate: '08/2026',
    highlights: [
      'Phương pháp chuẩn hóa số liệu và giản đồ vectơ giải mạch điện xoay chiều cực trị',
      'Mô phỏng hình học trực quan cho sóng dừng, giao thoa sóng cơ học',
      'Hơn 800 bài tập trắc nghiệm phân dạng chi tiết từ cơ bản đến 9.6 điểm'
    ]
  },
  {
    id: 'c6',
    title: 'Lập Trình Web React 19 & Next.js Thực Chiến Dành Cho Người Mới Bắt Đầu',
    instructor: 'Vũ Đức Minh',
    instructorRole: 'Lead Frontend Engineer tại VNG Corporation',
    instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
    rating: 4.96,
    ratingCount: 5120,
    price: 449000,
    originalPrice: 1200000,
    discount: '-63%',
    badge: 'Bán chạy nhất',
    badgeType: 'bestseller',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=600&q=80',
    category: 'it',
    level: 'Người mới bắt đầu',
    hours: '52 giờ học',
    lessons: 210,
    updatedDate: '10/2026',
    highlights: [
      'Làm chủ React Hooks, Server Components, State Management và TailwindCSS',
      'Xây dựng 4 dự án hoàn chỉnh: E-commerce, Chat App, Dashboard và Video Streaming',
      'Tối ưu hóa hiệu năng website đạt chuẩn Google Core Web Vitals'
    ]
  }
];

export const topTutors = [
  {
    id: '63d91ca1-d606-4d51-849c-c90749a7bd5c',
    name: 'Gia sư user001 (ThS. Đặng Thị Bích Thủy)',
    title: 'Gia sư Toán & Luyện thi Chuyên (Tài khoản user001)',
    degree: 'Sinh viên năm cuối ĐH Sư Phạm - ThS. Toán học',
    experience: '8 năm kinh nghiệm',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=80',
    rating: 5.0,
    reviews: 142,
    students: 310,
    hourlyRate: 250000,
    subjects: ['Toán 10-12', 'Toán Nâng Cao', 'Ôn Thi Đại Học'],
    isVerified: true,
    bio: 'Phương pháp giảng dạy trực quan, kiên nhẫn bồi dưỡng học sinh mất gốc thành học sinh khá giỏi. Đã giúp hơn 120 học sinh đỗ trường chuyên và điểm 9+.'
  },
  {
    id: 't2',
    name: 'Thầy Robert Jenkins (Thầy Rob)',
    title: 'Gia sư Tiếng Anh Bản Ngữ & Giao Tiếp',
    degree: 'CELTA Certified, BA University of Cambridge',
    experience: '6 năm dạy kèm trực tuyến',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=250&q=80',
    rating: 4.98,
    reviews: 215,
    students: 450,
    hourlyRate: 350000,
    subjects: ['IELTS Speaking', 'Tiếng Anh Doanh Nghiệp', 'Phát Âm Chuẩn Anh - Mỹ'],
    isVerified: true,
    bio: 'Chuyên gia chỉnh sửa ngữ điệu và phát âm, tạo môi trường phản xạ tự nhiên 100% bằng tiếng Anh giúp học viên tự tin sau 12 buổi học.'
  },
  {
    id: 't3',
    name: 'Kỹ sư Vũ Thành Đạt',
    title: 'Gia sư Lập Trình Web & Cấu Trúc Dữ Liệu',
    degree: 'Cựu sinh viên ĐH Bách Khoa Hà Nội, Giải Nhất Tin học Quốc gia',
    experience: '5 năm làm gia sư & mentor',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=250&q=80',
    rating: 4.95,
    reviews: 98,
    students: 180,
    hourlyRate: 280000,
    subjects: ['Python cơ bản - nâng cao', 'C++ giải thuật', 'Web Frontend'],
    isVerified: true,
    bio: 'Dạy học theo phương pháp Project-based Learning (học qua dự án thực tế), cam kết học viên tự tay code được sản phẩm chạy thực tế.'
  },
  {
    id: 't4',
    name: 'Cô Mai Phương Linh',
    title: 'Gia sư Hóa Học THPT & Luyện Thi',
    degree: 'Cử nhân Sư phạm Hóa học loại Xuất Sắc',
    experience: '7 năm kinh nghiệm gia sư',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    rating: 4.92,
    reviews: 130,
    students: 260,
    hourlyRate: 220000,
    subjects: ['Hóa Học 10-12', 'Bồi dưỡng HSG', 'Ôn Thi THPT Quốc Gia'],
    isVerified: true,
    bio: 'Hệ thống hóa toàn bộ công thức và phương pháp bảo toàn khối lượng, bảo toàn electron bằng sơ đồ tư duy sinh động, dễ nhớ.'
  }
];

export const communityArticles = [
  {
    id: 'a1',
    title: 'Chiến Lược Phân Bổ Thời Gian 90 Phút Làm Bài Thi Toán THPT Đạt Điểm 9+',
    excerpt: 'Kinh nghiệm xương máu từ các thủ khoa giúp bạn không bị mất điểm oan ở 38 câu nhận biết và tối ưu 12 câu phân hóa.',
    author: 'ThS. Nguyễn Văn Toàn',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
    date: '26/10/2026',
    commentsCount: 28,
    viewsCount: 1450,
    category: 'Kinh Nghiệm Học Tập',
    readTime: '5 phút đọc'
  },
  {
    id: 'a2',
    title: 'Lộ Trình Học Lập Trình Backend Cho Người Mới Bắt Đầu Từ Con Số 0',
    excerpt: 'Từ ngôn ngữ lập trình Java, cấu trúc dữ liệu, cơ sở dữ liệu quan hệ PostgreSQL đến thiết kế API chuẩn RESTful.',
    author: 'Vũ Đức Minh',
    authorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&q=80',
    date: '25/10/2026',
    commentsCount: 42,
    viewsCount: 2190,
    category: 'Công Nghệ & CNTT',
    readTime: '8 phút đọc'
  },
  {
    id: 'a3',
    title: 'Bí Quyết Nâng Band IELTS Speaking Từ 6.0 Lên 7.5 Sau 3 Tháng Tự Luyện',
    excerpt: 'Cách luyện Shadowing hiệu quả, xây dựng từ vựng theo chủ đề ít gặp và làm chủ phong thái tự tin trước giám khảo.',
    author: 'Cô Sarah Hoàng',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80',
    date: '24/10/2026',
    commentsCount: 19,
    viewsCount: 980,
    category: 'Ngoại Ngữ',
    readTime: '6 phút đọc'
  }
];

export const studentReviews = [
  {
    id: 'r1',
    studentName: 'Trần Minh Quân',
    studentRole: 'Học sinh lớp 12 - THPT Yên Hòa',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    courseName: 'Bí Quyết Chinh Phục Điểm 9+ Môn Toán',
    rating: 5,
    comment: 'Khóa học cực kỳ chi tiết, thầy Cương dạy rất có tâm và chỉ ra những lỗi sai phổ biến mà các bạn hay mắc. Điểm thi thử của em đã tăng từ 6.8 lên 9.2!'
  },
  {
    id: 'r2',
    studentName: 'Lê Thùy Dương',
    studentRole: 'Sinh viên ĐH Ngoại Thương',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    courseName: 'Gia sư Tiếng Anh Thầy Rob',
    rating: 5,
    comment: 'Thầy Rob rất nhiệt tình, phát âm cực chuẩn và hướng dẫn em cách tư duy bằng tiếng Anh. Sau 2 tháng học 1-1 em đã đạt 7.5 IELTS Speaking.'
  },
  {
    id: 'r3',
    studentName: 'Nguyễn Hoàng Long',
    studentRole: 'Lập trình viên tập sự',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    courseName: 'Khóa Học Lập Trình Java & Spring Boot Full-Stack',
    rating: 5,
    comment: 'Khóa học hay nhất về Spring Boot em từng học ở Việt Nam! Kiến trúc chuẩn dự án doanh nghiệp, giảng viên support rất nhanh trên diễn đàn.'
  }
];
