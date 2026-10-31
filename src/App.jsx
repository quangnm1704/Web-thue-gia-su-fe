import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ValueProps from './components/ValueProps';
import CourseTabs from './components/CourseTabs';
import TutorCard from './components/TutorCard';
import CategoriesGrid from './components/CategoriesGrid';
import ArticlesSection from './components/ArticlesSection';
import BecomeTutorBanner from './components/BecomeTutorBanner';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CourseDetailModal from './components/CourseDetailModal';
import BookTutorModal from './components/BookTutorModal';
import TutorBookingsModal from './components/TutorBookingsModal';
import ChatModal from './components/ChatModal';
import CartModal from './components/CartModal';
import WishlistModal from './components/WishlistModal';
import ConversationsModal from './components/ConversationsModal';
import ArticlePostModal from './components/ArticlePostModal';
import AdminDashboardModal from './components/AdminDashboardModal';
import PaymentCheckoutModal from './components/PaymentCheckoutModal';
import WalletTopUpModal from './components/WalletTopUpModal';
import { topTutors, featuredCourses, communityArticles } from './data/mockData';
import { 
  authApi, 
  articleApi, 
  courseApi, 
  bookingApi, 
  cartApi, 
  wishlistApi, 
  conversationApi,
  walletApi,
  checkBackendHealth,
  getRoleFromToken,
  parseJwtPayload 
} from './services/api';
import { formatCourseFromBackend } from './utils/courseAdapter';
import { GraduationCap, ArrowRight, Wifi, WifiOff } from 'lucide-react';
import './App.css';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [isBackendOnline, setIsBackendOnline] = useState(false);

  const [courses, setCourses] = useState(featuredCourses);
  const [articles, setArticles] = useState(communityArticles);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedTutorForBooking, setSelectedTutorForBooking] = useState(null);
  const [tutorBookingsModalOpen, setTutorBookingsModalOpen] = useState(false);
  const [adminDashboardModalOpen, setAdminDashboardModalOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Wallet & Payment Checkout State
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [userWallet, setUserWallet] = useState({ availableBalance: 0, holdingBalance: 0 });
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    type: 'course',
    item: null,
    enrollmentId: null,
    bookingId: null,
    amount: 0
  });
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);

  // Chat & Messenger Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatTutor, setChatTutor] = useState(null);
  const [chatTargetStudent, setChatTargetStudent] = useState(null);
  const [chatTargetConversation, setChatTargetConversation] = useState(null);
  const [conversationsModalOpen, setConversationsModalOpen] = useState(false);
  const [conversationCount, setConversationCount] = useState(0);

  // Cart & Wishlist State (Đồng bộ trực tiếp với CSDL PostgreSQL)
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);

  // Lấy số lượng cuộc trò chuyện Messenger từ CSDL
  const loadConversationsCount = async (user) => {
    if (!user) {
      setConversationCount(0);
      return;
    }
    try {
      const convs = await conversationApi.getMyConversations();
      setConversationCount(convs ? convs.length : 0);
    } catch (e) {
      setConversationCount(0);
    }
  };

  // Lấy danh sách khóa học mà học sinh hiện tại đã đăng ký
  const loadUserEnrollments = async () => {
    try {
      const enrollments = await courseApi.getMyEnrollments();
      if (enrollments && Array.isArray(enrollments)) {
        setEnrolledCourseIds(enrollments.map(e => e.courseId));
      }
    } catch (e) {
      console.log('Chưa thể lấy danh sách khóa học đã đăng ký:', e.message);
    }
  };

  // Lấy giỏ hàng & danh sách yêu thích từ CSDL
  const loadCartAndWishlist = async (user) => {
    if (!user) {
      setCartItems([]);
      setWishlistItems([]);
      return;
    }
    try {
      const cart = await cartApi.getCart();
      if (cart && Array.isArray(cart)) setCartItems(cart);
    } catch (e) {
      console.warn('Lỗi tải giỏ hàng:', e.message);
    }
    try {
      const wish = await wishlistApi.getWishlist();
      if (wish && Array.isArray(wish)) setWishlistItems(wish);
    } catch (e) {
      console.warn('Lỗi tải danh sách yêu thích:', e.message);
    }
  };

  // Lấy danh sách thông báo & đơn đặt lịch cho người dùng hiện tại (Gia sư hoặc Học viên)
  const loadUserNotifications = async (user) => {
    if (!user) {
      setNotificationCount(0);
      return;
    }
    try {
      if (user.role === 'TUTOR') {
        const bookings = await bookingApi.getTutorBookings();
        if (bookings && Array.isArray(bookings)) {
          setNotificationCount(bookings.length);
        }
      } else if (user.role === 'STUDENT') {
        const myBookings = await bookingApi.getMyBookings();
        if (myBookings && Array.isArray(myBookings)) {
          setNotificationCount(myBookings.length);
        }
      }
    } catch (e) {
      console.log('Chưa thể lấy thông báo đặt lịch:', e.message);
    }
  };

  // Check Backend connection & load real data if online
  useEffect(() => {
    async function initData() {
      // 1. Kiểm tra trạng thái Backend
      const online = await checkBackendHealth();
      setIsBackendOnline(online);

      // 2. Nếu có token cũ, tự động lấy thông tin người dùng: GET /users
      if (authApi.isAuthenticated()) {
        try {
          const user = await authApi.getMyInfo();
          const tokenRole = getRoleFromToken(authApi.getToken());
          if (user && tokenRole) {
            user.role = tokenRole;
          }
          setCurrentUser(user);
          await loadUserEnrollments();
          await loadUserNotifications(user);
          await loadCartAndWishlist(user);
          await loadConversationsCount(user);
        } catch (e) {
          console.log('Chưa đăng nhập hoặc token hết hạn:', e.message);
          const token = authApi.getToken();
          const tokenRole = getRoleFromToken(token);
          const payload = parseJwtPayload(token);
          if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
            const fallbackUser = {
              id: payload.sub,
              displayName: tokenRole === 'ADMIN' ? 'Admin' : (tokenRole === 'TUTOR' ? 'Gia sư' : 'Học viên'),
              role: tokenRole || 'STUDENT'
            };
            setCurrentUser(fallbackUser);
            await loadUserEnrollments();
            await loadUserNotifications(fallbackUser);
            await loadCartAndWishlist(fallbackUser);
            await loadConversationsCount(fallbackUser);
          } else {
            authApi.logout();
            setCurrentUser(null);
          }
        }
      } else {
        setCurrentUser(null);
      }

      // 3. Nếu Backend online, lấy bài viết thật từ GET /articles
      if (online) {
        try {
          const realArticles = await articleApi.getArticles();
          if (realArticles && realArticles.length > 0) {
            setArticles(realArticles);
          }
        } catch (err) {
          console.warn('Lỗi lấy articles từ BE:', err);
        }

        // Lấy danh sách khóa học thật từ GET /courses
        try {
          const realCourses = await courseApi.getCourses();
          if (realCourses && realCourses.length > 0) {
            const formatted = realCourses.map((c, i) => formatCourseFromBackend(c, i));
            setCourses(formatted);
          }
        } catch (err) {
          console.warn('Lỗi lấy courses từ BE:', err);
        }
      }
    }

    initData();
  }, []);

  // Handle Auth open
  const handleOpenAuth = (mode) => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    await loadUserEnrollments();
    await loadUserNotifications(user);
    await loadCartAndWishlist(user);
    await loadConversationsCount(user);
  };

  const handleLogout = () => {
    authApi.logout();
    setCurrentUser(null);
    setEnrolledCourseIds([]);
    setNotificationCount(0);
    setConversationCount(0);
    setCartItems([]);
    setWishlistItems([]);
    alert('Đã đăng xuất thành công!');
  };

  // ==================== CART ACTIONS (CSDL PostgreSQL) ====================
  const handleAddToCart = async (course) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    try {
      await cartApi.addToCart(course.id);
      await loadCartAndWishlist(currentUser);
      alert(`🛒 Đã thêm khóa học "${course.title}" vào giỏ hàng (lưu vào CSDL)!`);
    } catch (err) {
      alert('Không thể thêm vào giỏ hàng: ' + (err.data?.message || err.message));
    }
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      await cartApi.removeFromCart(courseId);
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa khỏi giỏ hàng:', err);
    }
  };

  const handleClearCart = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa toàn bộ khóa học trong giỏ hàng?')) return;
    try {
      await cartApi.clearCart();
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa sạch giỏ hàng:', err);
    }
  };

  const handleCheckoutCart = async () => {
    try {
      await cartApi.checkout();
      await loadUserEnrollments();
      await loadCartAndWishlist(currentUser);
      alert('🎉 Thanh toán & Ghi danh thành công tất cả khóa học trong giỏ hàng! Các phòng học Google Meet đã được mở khóa.');
    } catch (err) {
      alert('Lỗi thanh toán giỏ hàng: ' + (err.data?.message || err.message));
      throw err;
    }
  };

  // ==================== WISHLIST ACTIONS (CSDL PostgreSQL) ====================
  const handleToggleWishlist = async (courseId) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const isWishlisted = wishlistItems.some(w => w.courseId === courseId);
    try {
      if (isWishlisted) {
        await wishlistApi.removeFromWishlist(courseId);
      } else {
        await wishlistApi.addToWishlist(courseId);
      }
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi cập nhật danh sách yêu thích:', err);
    }
  };

  const handleRemoveFromWishlist = async (courseId) => {
    try {
      await wishlistApi.removeFromWishlist(courseId);
      await loadCartAndWishlist(currentUser);
    } catch (err) {
      console.error('Lỗi xóa khỏi danh sách yêu thích:', err);
    }
  };

  // Book Tutor (Đặt lịch gia sư 1-1 qua Modal thương lượng & chọn gói)
  const handleBookTutor = (tutor) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setSelectedTutorForBooking(tutor);
  };

  // Chat Tutor (Học viên nhắn tin với Gia sư)
  const handleChatTutor = (tutor) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setChatTutor(tutor);
    setChatTargetStudent(null);
    setChatModalOpen(true);
  };

  // Gia sư mở chat với học viên từ đơn đặt lịch
  const handleOpenChatWithStudent = (student) => {
    setChatTutor(null);
    setChatTargetStudent(student);
    setChatTargetConversation(null);
    setChatModalOpen(true);
  };

  // Chọn cuộc trò chuyện từ Messenger Modal
  const handleSelectConversation = (conv, partnerInfo) => {
    setConversationsModalOpen(false);
    setChatTargetConversation(conv);
    if (partnerInfo?.tutorObject) {
      setChatTutor(partnerInfo.tutorObject);
      setChatTargetStudent(null);
    } else if (partnerInfo?.studentObject) {
      setChatTutor(null);
      setChatTargetStudent(partnerInfo.studentObject);
    } else {
      setChatTutor(null);
      setChatTargetStudent(null);
    }
    setChatModalOpen(true);
  };

    // Enroll Course & Payment Workflow
  const handleEnrollCourse = async (course) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return false;
    }
    try {
      if (isBackendOnline) {
        // Nếu khóa học miễn phí
        if (!course.price || course.price === 0) {
          await courseApi.enrollCourse(course.id);
          setEnrolledCourseIds(prev => [...prev, course.id]);
          alert(`🎉 Chúc mừng! Bạn đã đăng ký thành công khóa học miễn phí "${course.title}". Toàn bộ phòng học Google Meet đã được kích hoạt!`);
          return true;
        }

        // Kiểm tra xem đã có đơn ghi danh trước đó chưa
        let enrollment = null;
        try {
          const myEnrolls = await courseApi.getMyEnrollments();
          enrollment = (myEnrolls || []).find(e => e.courseId === course.id);
        } catch (e) {
          // ignore
        }

        if (enrollment) {
          if (enrollment.status === 'ACTIVE' || enrollment.status === 'COMPLETED') {
            setEnrolledCourseIds(prev => [...prev, course.id]);
            alert(`Bạn đã đăng ký khóa học "${course.title}" rồi! Toàn bộ phòng học Google Meet đã sẵn sàng.`);
            return true;
          }

          // Khóa học đang ở trạng thái PENDING -> mở Checkout thanh toán
          handleOpenCheckout({
            type: 'course',
            item: course,
            enrollmentId: enrollment.id,
            amount: course.price
          });
          return false;
        }

        // Tạo đơn ghi danh mới (status PENDING từ Backend)
        const res = await courseApi.enrollCourse(course.id);
        handleOpenCheckout({
          type: 'course',
          item: course,
          enrollmentId: res?.id,
          amount: course.price
        });
        return false;
      } else {
        setEnrolledCourseIds(prev => [...prev, course.id]);
        alert(`[Chế độ UI] Đã kích hoạt khóa học "${course.title}" thành công!`);
        return true;
      }
    } catch (err) {
      const errMsg = err?.data?.message || err.message;
      if (errMsg.includes('already enrolled') || errMsg.includes('đã đăng ký') || err.status === 400) {
        // Thử mở checkout nếu có pending
        try {
          const myEnrolls = await courseApi.getMyEnrollments();
          const pending = (myEnrolls || []).find(e => e.courseId === course.id && e.status === 'PENDING');
          if (pending) {
            handleOpenCheckout({
              type: 'course',
              item: course,
              enrollmentId: pending.id,
              amount: course.price
            });
            return false;
          }
        } catch (e) {}
        setEnrolledCourseIds(prev => [...prev, course.id]);
        alert(`Bạn đã ghi danh khóa học này trước đó rồi! Hãy tham gia các buổi học Google Meet trực tuyến.`);
        return true;
      }
      alert(`Đăng ký khóa học không thành công: ${errMsg}`);
      throw err;
    }
  };

  // Create Article
  const handleCreateArticle = async () => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    const title = prompt('Nhập tiêu đề bài viết:');
    if (!title) return;
    const content = prompt('Nhập nội dung bài viết:');
    if (!content) return;

    try {
      if (isBackendOnline) {
        await articleApi.createArticle({
          title,
          content,
          minRoleLevel: 0
        });
        alert('Đã đăng bài viết mới lên Backend thành công!');
        // Refresh articles
        const updated = await articleApi.getArticles();
        if (updated) setArticles(updated);
      } else {
        const newArt = {
          id: 'a' + Date.now(),
          title,
          excerpt: content.substring(0, 100) + '...',
          author: currentUser.displayName || currentUser.username,
          authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
          date: 'Hôm nay',
          commentsCount: 0,
          viewsCount: 1,
          category: 'Cộng Đồng',
          readTime: '3 phút'
        };
        setArticles([newArt, ...articles]);
        alert('Đã đăng bài viết mới thành công!');
      }
    } catch (err) {
      alert('Không thể đăng bài: ' + err.message);
    }
  };

  // Delete Article (Chỉ người đăng bài viết hoặc Quản trị viên mới có quyền xóa)
  const handleDeleteArticle = async (articleId) => {
    try {
      if (isBackendOnline) {
        await articleApi.deleteArticle(articleId);
      }
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
      if (selectedArticle && selectedArticle.id === articleId) {
        setSelectedArticle(null);
      }
      alert('Đã xóa bài viết thành công khỏi diễn đàn!');
    } catch (err) {
      console.error('Lỗi khi xóa bài viết:', err);
      const msg = err.data?.message || err.message || 'Không có quyền xóa bài viết này';
      alert(`Không thể xóa bài viết: ${msg}`);
      throw err;
    }
  };

  const wishlistCourseIds = wishlistItems.map(w => w.courseId);

  return (
    <div className="ud-app">
      {/* Backend Status indicator banner */}
      <div className={`backend-status-pill ${isBackendOnline ? 'online' : 'offline'}`}>
        {isBackendOnline ? (
          <>
            <Wifi size={14} /> <span>Backend Spring Boot: <strong>Đã kết nối (Online)</strong></span>
          </>
        ) : (
          <>
            <WifiOff size={14} /> <span>Backend: <strong>Chế độ Mock (Offline)</strong></span>
          </>
        )}
      </div>

      {/* 1. Header / Navbar */}
      <Navbar 
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
        notificationCount={notificationCount}
        conversationCount={conversationCount}
        onOpenBookings={() => setTutorBookingsModalOpen(true)}
        onOpenCart={() => setCartModalOpen(true)}
        onOpenWishlist={() => setWishlistModalOpen(true)}
        userWallet={userWallet}
        onOpenWallet={() => setWalletModalOpen(true)}
        onOpenConversations={() => {
          if (!currentUser) {
            handleOpenAuth('login');
          } else {
            setConversationsModalOpen(true);
          }
        }}
        onOpenAdmin={() => setAdminDashboardModalOpen(true)}
      />

      <main>
        {/* 2. Hero Udemy Banner */}
        <HeroBanner 
          onExploreCourses={() => {
            document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
          }}
          onFindTutor={() => {
            document.getElementById('tutors')?.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* 3. Value Props (Why choose EduTutor) */}
        <ValueProps />

        {/* 4. Filterable Courses Section (Connected to Backend Courses) */}
        <CourseTabs 
          courses={courses}
          onSelectCourse={(course) => setSelectedCourse(course)}
          onAddToCart={handleAddToCart}
          wishlist={wishlistCourseIds}
          onToggleWishlist={handleToggleWishlist}
        />

        {/* 5. Featured 1-on-1 Tutors Section */}
        <section className="ud-tutors-section" id="tutors">
          <div className="container">
            <div className="ud-section-header">
              <div className="ud-header-left">
                <span className="ud-section-tag">
                  <GraduationCap size={14} /> Gia sư dạy kèm 1-1
                </span>
                <h2 className="ud-section-title">Gia sư chất lượng cao hàng đầu</h2>
                <p className="ud-section-desc">
                  Đội ngũ thủ khoa, thạc sĩ và chuyên gia sư phạm hàng đầu đã được xác thực hồ sơ và bằng cấp nghiêm ngặt.
                </p>
              </div>
              <button className="ud-view-all-btn">
                Xem tất cả gia sư <ArrowRight size={16} />
              </button>
            </div>

            <div className="ud-tutors-grid">
              {topTutors.map((tutor) => (
                <TutorCard 
                  key={tutor.id} 
                  tutor={tutor}
                  onBookTutor={handleBookTutor}
                  onChatTutor={handleChatTutor}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 6. Top Categories Grid */}
        <CategoriesGrid onSelectCategory={(catId) => alert(`Lọc theo danh mục: ${catId}`)} />

        {/* 7. Community Articles & Forum (Connected to Backend Articles) */}
        <ArticlesSection 
          articles={articles}
          onOpenArticle={(art) => setSelectedArticle(art)}
          onCreateArticle={handleCreateArticle}
          onDeleteArticle={handleDeleteArticle}
          currentUser={currentUser}
        />

        {/* 8. Become Instructor Banner */}
        <BecomeTutorBanner onApplyTutor={() => handleOpenAuth('register')} />

        {/* 9. Student Testimonials */}
        <Testimonials />
      </main>

      {/* 10. Udemy Footer */}
      <Footer />

      {/* Modals */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />

      <CourseDetailModal 
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        onEnroll={handleEnrollCourse}
        onAddToCart={handleAddToCart}
        isEnrolled={selectedCourse ? enrolledCourseIds.includes(selectedCourse.id) : false}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
      />

      <BookTutorModal 
        tutor={selectedTutorForBooking}
        isOpen={!!selectedTutorForBooking}
        onClose={() => {
          setSelectedTutorForBooking(null);
          loadUserNotifications(currentUser);
        }}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onOpenChat={handleChatTutor}
        onOpenCheckout={handleOpenCheckout}
      />

      <TutorBookingsModal 
        isOpen={tutorBookingsModalOpen}
        onClose={() => setTutorBookingsModalOpen(false)}
        currentUser={currentUser}
        onOpenChat={handleOpenChatWithStudent}
        onOpenCheckout={handleOpenCheckout}
        onWalletUpdated={() => loadUserWallet(currentUser)}
      />

      <ChatModal 
        isOpen={chatModalOpen}
        onClose={() => {
          setChatModalOpen(false);
          setChatTargetConversation(null);
          if (currentUser) loadConversationsCount(currentUser);
        }}
        tutor={chatTutor}
        targetStudent={chatTargetStudent}
        targetConversation={chatTargetConversation}
        currentUser={currentUser}
        onOpenBook={(t) => {
          setChatModalOpen(false);
          handleBookTutor(t);
        }}
      />

      <ConversationsModal 
        isOpen={conversationsModalOpen}
        onClose={() => setConversationsModalOpen(false)}
        currentUser={currentUser}
        onSelectConversation={handleSelectConversation}
        onNavigateToTutors={() => {
          document.getElementById('tutors')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <CartModal 
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onCheckout={handleCheckoutCart}
        onSelectCourse={(course) => setSelectedCourse(course)}
        courses={courses}
      />

      <WishlistModal 
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onSelectCourse={(course) => setSelectedCourse(course)}
        courses={courses}
      />

      <ArticlePostModal 
        article={selectedArticle}
        isOpen={!!selectedArticle}
        onClose={() => setSelectedArticle(null)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onDeleteArticle={handleDeleteArticle}
      />

      <AdminDashboardModal 
        isOpen={adminDashboardModalOpen}
        onClose={() => setAdminDashboardModalOpen(false)}
        currentUser={currentUser}
        onDeleteArticle={handleDeleteArticle}
      />

      <PaymentCheckoutModal 
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        type={checkoutData.type}
        item={checkoutData.item}
        enrollmentId={checkoutData.enrollmentId}
        bookingId={checkoutData.bookingId}
        amount={checkoutData.amount}
        currentUser={currentUser}
        onSuccess={handlePaymentSuccess}
        onOpenTopUp={() => setWalletModalOpen(true)}
      />

      <WalletTopUpModal 
        isOpen={walletModalOpen}
        onClose={() => setWalletModalOpen(false)}
        currentUser={currentUser}
        onWalletUpdated={(w) => setUserWallet(w)}
      />
    </div>
  );
}
