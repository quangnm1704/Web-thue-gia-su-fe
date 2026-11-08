const BASE_URL = '/api';

/**
 * Helper giải mã JWT payload và trích xuất vai trò (Role)
 */
export function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function getRoleFromToken(token) {
  const payload = parseJwtPayload(token);
  if (!payload) return null;
  const scope = payload.scope || '';
  if (scope.includes('ADMIN')) return 'ADMIN';
  if (scope.includes('TUTOR')) return 'TUTOR';
  if (scope.includes('STUDENT')) return 'STUDENT';
  return null;
}

/**
 * Helper to make HTTP requests with JWT token attachment
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMsg = data?.message || `Lỗi HTTP: ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    // Spring Boot ApiResponse format: { code: 1000, message: "...", result: ... }
    return data?.result !== undefined ? data.result : data;
  } catch (error) {
    console.warn(`[API] Gọi ${endpoint} thất bại:`, error.message);
    throw error;
  }
}

/* ==================== 1. AUTHENTICATION & USERS ==================== */
export const authApi = {
  // POST /auth/login (Backend requires displayName & password)
  login: async (displayName, password) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ displayName, password }),
    });
    // Backend Spring Boot returns result.accessToken
    const token = res?.accessToken || res?.token;
    if (token) {
      localStorage.setItem('token', token);
    }
    if (res?.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    return res;
  },

  // POST /users (Register requires email, password, displayName, role)
  register: async (userData) => {
    return await request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // GET /users (Get current user)
  getMyInfo: async () => {
    const res = await request('/users');
    const token = localStorage.getItem('token');
    const tokenRole = getRoleFromToken(token);
    if (res && tokenRole) {
      res.role = tokenRole;
    }
    return res;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token'),

  // GET /auth/verify-email?token=... (Xác thực Email tài khoản mới CN01.03)
  verifyEmail: async (token) => {
    return await request(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  },
};

/* ==================== 2. ARTICLES & COMMENTS ==================== */
export const articleApi = {
  // GET /articles (Public)
  getArticles: async () => {
    return await request('/articles');
  },

  // GET /articles/:id
  getArticle: async (id) => {
    return await request(`/articles/${id}`);
  },

  // GET /articles/my-articles
  getMyArticles: async () => {
    return await request('/articles/my-articles');
  },

  // POST /articles (Create new article)
  createArticle: async (articleData) => {
    return await request('/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  // DELETE /articles/:id (Chỉ tác giả hoặc Admin mới có quyền xóa)
  deleteArticle: async (id) => {
    return await request(`/articles/${id}`, {
      method: 'DELETE',
    });
  },

  // GET /article-comments/article/:articleId
  getComments: async (articleId) => {
    return await request(`/article-comments/article/${articleId}`);
  },

  // POST /article-comments/:articleId
  createComment: async (articleId, content, parentId = null) => {
    return await request(`/article-comments/${articleId}`, {
      method: 'POST',
      body: JSON.stringify({ content, parentId }),
    });
  },
};

/* ==================== 3. COURSES & ENROLLMENT ==================== */
export const courseApi = {
  // POST /courses (Gia sư tạo khóa học / lớp học mới)
  createCourse: async (data) => {
    return await request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /courses
  getCourses: async () => {
    return await request('/courses');
  },

  // POST /courses (Gia sư tạo khóa học / lớp học mới)
  createCourse: async (data) => {
    return await request('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /courses/:id
  getCourse: async (id) => {
    return await request(`/courses/${id}`);
  },

  // GET /courses/tutor/:tutorId (Lấy danh sách khóa học do gia sư tạo)
  getByTutorId: async (tutorId) => {
    return await request(`/courses/tutor/${tutorId}`);
  },

  // GET /lessons/course/:courseId (Lấy danh sách bài học của khóa học)
  getLessons: async (courseId) => {
    return await request(`/lessons/course/${courseId}`);
  },

  // POST /course-enrollments (Đăng ký ghi danh khóa học)
  enrollCourse: async (courseId) => {
    return await request('/course-enrollments', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  },

  // GET /course-enrollments/me (Lấy danh sách khóa học của học sinh hiện tại)
  getMyEnrollments: async () => {
    return await request('/course-enrollments/me');
  },

  // GET /course-enrollments/me/course/:courseId (Lấy thông tin ghi danh khóa học của học sinh hiện tại)
  getMyEnrollmentByCourse: async (courseId) => {
    return await request(`/course-enrollments/me/course/${courseId}`);
  },

  // PATCH /course-enrollments/:id/progress (Cập nhật tiến độ theo enrollmentId)
  updateProgress: async (enrollmentId, progressPercent) => {
    return await request(`/course-enrollments/${enrollmentId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercent }),
    });
  },

  // PATCH /course-enrollments/course/:courseId/progress (Cập nhật tiến độ theo courseId)
  updateProgressByCourse: async (courseId, progressPercent) => {
    return await request(`/course-enrollments/course/${courseId}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progressPercent }),
    });
  },

  // PATCH /course-enrollments/tutor/:enrollmentId/complete (Gia sư xác nhận hoàn tất khóa học)
  completeEnrollment: async (enrollmentId) => {
    return await request(`/course-enrollments/tutor/${enrollmentId}/complete`, {
      method: 'PATCH',
    });
  },
};

/* ==================== 4. CONVERSATION & AGREEMENT ==================== */
export const conversationApi = {
  // POST /conversations/direct (Tạo hoặc lấy hội thoại trực tiếp với gia sư)
  createDirect: async (tutorId) => {
    return await request('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ tutorId }),
    });
  },

  // GET /conversations/me (Lấy danh sách cuộc trò chuyện của tôi)
  getMyConversations: async () => {
    return await request('/conversations/me');
  },

  // GET /conversations/:id
  getConversation: async (id) => {
    return await request(`/conversations/${id}`);
  },

  // PATCH /conversations/:id/agreement/student (Xác nhận đồng ý điều kiện thương lượng)
  agreeAsStudent: async (id) => {
    return await request(`/conversations/${id}/agreement/student`, {
      method: 'PATCH',
    });
  },

  // PATCH /conversations/:id/decline/student (Từ chối điều kiện)
  declineAsStudent: async (id) => {
    return await request(`/conversations/${id}/decline/student`, {
      method: 'PATCH',
    });
  },
};

/* ==================== 4.1. MESSAGES & REALTIME ==================== */
export const messageApi = {
  // GET /messages/conversation/:conversationId
  getMessages: async (conversationId) => {
    return await request(`/messages/conversation/${conversationId}`);
  },

  // POST /messages
  sendMessage: async (conversationId, content) => {
    return await request('/messages', {
      method: 'POST',
      body: JSON.stringify({ conversationId, content }),
    });
  },
};

/* ==================== 5. BROKERAGE PACKAGES ==================== */
export const brokeragePackageApi = {
  // GET /brokerage-packages/tutor/:tutorId
  getPackagesByTutor: async (tutorId) => {
    return await request(`/brokerage-packages/tutor/${tutorId}`);
  },

  // GET /brokerage-packages/:id
  getPackage: async (id) => {
    return await request(`/brokerage-packages/${id}`);
  },
};

/* ==================== 6. BOOKING & TUTORING ==================== */
export const bookingApi = {
  // POST /bookings/me (Tạo đơn thuê gia sư)
  createBooking: async (packageId) => {
    return await request('/bookings/me', {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    });
  },

  // GET /bookings/me (Lấy các đơn đặt lịch của học sinh hiện tại)
  getMyBookings: async () => {
    return await request('/bookings/me');
  },

  // GET /bookings/tutor (Lấy các đơn học viên đặt lịch với gia sư hiện tại)
  getTutorBookings: async () => {
    return await request('/bookings/tutor');
  },

  // PATCH /bookings/:id/cancel
  cancelBooking: async (id) => {
    return await request(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // PATCH /bookings/:id/complete (Học viên hoàn thành & giải ngân ký quỹ cho gia sư)
  completeBooking: async (id) => {
    return await request(`/bookings/${id}/complete`, {
      method: 'PATCH',
    });
  },

  // GET /bookings/:id (Chi tiết đơn booking)
  getBooking: async (id) => {
    return await request(`/bookings/${id}`);
  },
};

/* ==================== 7. HEALTH CHECK ==================== */
export const checkBackendHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/articles`, { method: 'GET' });
    return res.ok;
  } catch {
    return false;
  }
};

/* ==================== 8. CART ==================== */
export const cartApi = {
  // GET /cart (Lấy danh sách khóa học trong giỏ hàng)
  getCart: async () => {
    return await request('/cart');
  },

  // POST /cart (Thêm khóa học vào giỏ hàng)
  addToCart: async (courseId) => {
    return await request('/cart', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  },

  // DELETE /cart/:courseId (Xóa khóa học khỏi giỏ hàng)
  removeFromCart: async (courseId) => {
    return await request(`/cart/${courseId}`, {
      method: 'DELETE',
    });
  },

  // DELETE /cart (Xóa sạch giỏ hàng)
  clearCart: async () => {
    return await request('/cart', {
      method: 'DELETE',
    });
  },

  // POST /cart/checkout (Thanh toán & Đăng ký tất cả khóa học trong giỏ)
  checkout: async () => {
    return await request('/cart/checkout', {
      method: 'POST',
    });
  },
};

/* ==================== 9. WISHLIST ==================== */
export const wishlistApi = {
  // GET /wishlist (Lấy danh sách yêu thích)
  getWishlist: async () => {
    return await request('/wishlist');
  },

  // POST /wishlist/:courseId (Thêm vào yêu thích)
  addToWishlist: async (courseId) => {
    return await request(`/wishlist/${courseId}`, {
      method: 'POST',
    });
  },

  // DELETE /wishlist/:courseId (Xóa khỏi yêu thích)
  removeFromWishlist: async (courseId) => {
    return await request(`/wishlist/${courseId}`, {
      method: 'DELETE',
    });
  },
};

/* ==================== 10. ADMIN MANAGEMENT ==================== */
export const adminApi = {
  // GET /users/admin (Lấy danh sách tất cả người dùng trong hệ thống)
  getAllUsers: async () => {
    return await request('/users/admin');
  },

  // PUT /users/admin/:userId/status (Khóa hoặc Mở khóa tài khoản)
  updateUserStatus: async (userId, status) => {
    return await request(`/users/admin/${userId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // GET /tutor-applications/admin (Lấy danh sách đơn đăng ký gia sư)
  getTutorApplications: async () => {
    return await request('/tutor-applications/admin');
  },

  // PATCH /tutor-applications/admin/:applicationId/approve (Duyệt đơn gia sư)
  approveTutorApplication: async (applicationId) => {
    return await request(`/tutor-applications/admin/${applicationId}/approve`, {
      method: 'PATCH',
    });
  },

  // PATCH /tutor-applications/admin/:applicationId/reject (Từ chối đơn gia sư)
  rejectTutorApplication: async (applicationId, adminNote = '') => {
    return await request(`/tutor-applications/admin/${applicationId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ adminNote }),
    });
  },

  // GET /brokerage-packages/admin/get-all (Lấy tất cả gói môi giới)
  getAllPackages: async () => {
    return await request('/brokerage-packages/admin/get-all');
  },

  // GET /admin/disputes (Lấy danh sách khiếu nại tranh chấp cho Admin)
  getDisputes: async (status) => {
    return await request(status ? `/admin/disputes?status=${status}` : '/admin/disputes');
  },

  // GET /admin/disputes/:id (Xem chi tiết khiếu nại)
  getDisputeDetail: async (id) => {
    return await request(`/admin/disputes/${id}`);
  },

  // PATCH /admin/disputes/:id/approve (Chấp thuận khiếu nại & hoàn tiền)
  approveDispute: async (id) => {
    return await request(`/admin/disputes/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // PATCH /admin/disputes/:id/reject (Từ chối / Bác bỏ khiếu nại)
  rejectDispute: async (id) => {
    return await request(`/admin/disputes/${id}/reject`, {
      method: 'PATCH',
    });
  },

  // GET /admin/action-logs (Lấy nhật ký kiểm toán hệ thống)
  getActionLogs: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return await request(`/admin/action-logs${queryString ? `?${queryString}` : ''}`);
  },

  // GET /admin/action-logs/:id
  getActionLogById: async (id) => {
    return await request(`/admin/action-logs/${id}`);
  },

  // GET /admin/withdrawals (Lấy danh sách yêu cầu rút tiền của gia sư)
  getWithdrawals: async () => {
    return await request('/admin/withdrawals');
  },

  // GET /admin/reviews (CN06.09: Quản lý phản hồi & đánh giá)
  getReviews: async () => {
    return await request('/admin/reviews');
  },

  // DELETE /admin/reviews/:id (CN06.09: Xóa / Gỡ đánh giá vi phạm)
  deleteReview: async (id) => {
    return await request(`/admin/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // GET /admin/lessons (CN06.03: Quản lý bài học khóa học)
  getLessons: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.courseId) query.append('courseId', params.courseId);
    if (params.keyword) query.append('keyword', params.keyword);
    const queryString = query.toString();
    return await request(`/admin/lessons${queryString ? `?${queryString}` : ''}`);
  },

  // GET /admin/settlement (CN06.12: Phân bổ tiền dịch vụ)
  getSettlement: async (serviceType, serviceId) => {
    return await request(`/admin/settlement?serviceType=${serviceType}&serviceId=${serviceId}`);
  },

  // POST /admin/settlement/release (CN06.12: Giải ngân ký quỹ thủ công)
  releaseSettlement: async (serviceType, serviceId) => {
    return await request('/admin/settlement/release', {
      method: 'POST',
      body: JSON.stringify({ serviceType, serviceId }),
    });
  },

  // GET /admin/reconciliation/summary (CN06.13: Đối soát tài chính)
  getReconciliationSummary: async () => {
    return await request('/admin/reconciliation/summary');
  },

  // GET /admin/reconciliation/transactions (CN06.13: Danh sách bút toán đối soát)
  getReconciliationTransactions: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.status) query.append('status', params.status);
    if (params.referenceCode) query.append('referenceCode', params.referenceCode);
    const queryString = query.toString();
    return await request(`/admin/reconciliation/transactions${queryString ? `?${queryString}` : ''}`);
  },
};

/* ==================== 11. WALLET & DEPOSIT ==================== */
export const walletApi = {
  // GET /wallets/user/:userId
  getWalletByUserId: async (userId) => {
    return await request(`/wallets/user/${userId}`);
  },

  // GET /wallets/:id
  getWallet: async (id) => {
    return await request(`/wallets/${id}`);
  },

  // POST /wallet/deposits
  createDeposit: async (amount) => {
    return await request('/wallet/deposits', {
      method: 'POST',
      body: JSON.stringify({ amount: Number(amount) }),
    });
  },

  // POST /wallet/deposits/:referenceCode/confirm
  confirmDeposit: async (referenceCode) => {
    return await request(`/wallet/deposits/${referenceCode}/confirm`, {
      method: 'POST',
    });
  },
};

/* ==================== 12. MOCK PAYMENT GATEWAY ==================== */
export const mockPaymentApi = {
  // POST /mock-payments/:referenceCode/success
  simulateSuccess: async (referenceCode) => {
    return await request(`/mock-payments/${referenceCode}/success`, {
      method: 'POST',
    });
  },

  // POST /mock-payments/:referenceCode/failure
  simulateFailure: async (referenceCode) => {
    return await request(`/mock-payments/${referenceCode}/failure`, {
      method: 'POST',
    });
  },
};

/* ==================== 13. PAYMENT (ESCROW HOLD) ==================== */
export const paymentApi = {
  // POST /enrollment-payments/:enrollmentId/payment
  payForEnrollment: async (enrollmentId) => {
    return await request(`/enrollment-payments/${enrollmentId}/payment`, {
      method: 'POST',
    });
  },

  // POST /booking-payments/:bookingId/payment
  payForBooking: async (bookingId) => {
    return await request(`/booking-payments/${bookingId}/payment`, {
      method: 'POST',
    });
  },
};

/* ==================== 14. TUTOR APPLICATION API ==================== */
export const tutorApplicationApi = {
  // POST /tutor-applications (Nộp đơn ứng tuyển gia sư)
  createApplication: async (data) => {
    return await request('/tutor-applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /tutor-applications (Lấy đơn ứng tuyển của tôi)
  getMyApplication: async () => {
    return await request('/tutor-applications');
  },

  // DELETE /tutor-applications (Hủy đơn ứng tuyển của tôi)
  deleteMyApplication: async () => {
    return await request('/tutor-applications', {
      method: 'DELETE',
    });
  },
};


/* ==================== 15. DISPUTE API (STUDENT) ==================== */
export const disputeApi = {
  // POST /disputes (Tạo khiếu nại mới)
  createDispute: async (data) => {
    return await request('/disputes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /disputes/me (Danh sách khiếu nại của học sinh hiện tại)
  getMyDisputes: async () => {
    return await request('/disputes/me');
  },

  // GET /disputes/:id (Xem chi tiết khiếu nại)
  getMyDispute: async (id) => {
    return await request(`/disputes/${id}`);
  },

  // PATCH /disputes/:id/cancel (Hủy khiếu nại)
  cancelDispute: async (id) => {
    return await request(`/disputes/${id}/cancel`, {
      method: 'PATCH',
    });
  },
};

/* ==================== 16. TUTOR PROFILE API ==================== */
export const tutorProfileApi = {
  // GET /tutor-profiles (Hồ sơ của chính gia sư hiện tại)
  getMyProfile: async () => {
    return await request('/tutor-profiles');
  },

  // GET /tutor-profiles/:userId (Xem hồ sơ công khai của 1 gia sư)
  getTutorProfile: async (userId) => {
    return await request(`/tutor-profiles/${userId}`);
  },

  // PATCH /tutor-profiles (Cập nhật môn dạy & lịch rảnh của gia sư)
  updateMyProfile: async (data) => {
    return await request('/tutor-profiles', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

/* ==================== 17. USER PROFILE API ==================== */
export const userApi = {
  // PATCH /users/:userId (Cập nhật hồ sơ cá nhân: tên, SĐT, avatar, link Zalo)
  updateProfile: async (userId, data) => {
    return await request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // GET /users (Thông tin cá nhân của tôi)
  getMyUser: async () => {
    return await request('/users');
  },
};

/* ==================== 18. PAYMENT METHOD / BANK ACCOUNT API ==================== */
export const paymentMethodApi = {
  // GET /payment-methods/user/:userId
  getByUserId: async (userId) => {
    return await request(`/payment-methods/user/${userId}`);
  },

  // POST /payment-methods
  create: async (data) => {
    return await request('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PUT /payment-methods/:id/default
  setDefault: async (id) => {
    return await request(`/payment-methods/${id}/default`, {
      method: 'PUT',
    });
  },

  // DELETE /payment-methods/:id
  delete: async (id) => {
    return await request(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  },
};

/* ==================== 19. WITHDRAWAL API ==================== */
export const withdrawalApi = {
  // POST /withdrawals (Gia sư gửi yêu cầu rút tiền về STK ngân hàng)
  create: async (data) => {
    return await request('/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /withdrawals/me (Lấy lịch sử rút tiền của tôi)
  getMyWithdrawals: async () => {
    return await request('/withdrawals/me');
  },

  // GET /admin/withdrawals (Admin lấy toàn bộ yêu cầu rút tiền)
  getAllAdmin: async () => {
    return await request('/admin/withdrawals');
  },

  // PATCH /admin/withdrawals/:id/approve (Admin duyệt lệnh rút tiền)
  approve: async (id) => {
    return await request(`/admin/withdrawals/${id}/approve`, {
      method: 'PATCH',
    });
  },

  // PATCH /admin/withdrawals/:id/reject (Admin từ chối lệnh rút tiền kèm lý do)
  reject: async (id, reason) => {
    return await request(`/admin/withdrawals/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },
};

/* ==================== 20. LESSON MANAGEMENT API (CN04.02) ==================== */
export const lessonApi = {
  // GET /lessons/course/:courseId
  getByCourse: async (courseId) => {
    return await request(`/lessons/course/${courseId}`);
  },

  // POST /lessons/courses/:courseId (Gia sư thêm bài học mới)
  create: async (courseId, data) => {
    return await request(`/lessons/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // PATCH /lessons/:id (Gia sư chỉnh sửa bài học)
  update: async (id, data) => {
    return await request(`/lessons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // DELETE /lessons/:id (Gia sư xóa bài học)
  delete: async (id) => {
    return await request(`/lessons/${id}`, {
      method: 'DELETE',
    });
  },
};

/* ==================== 21. REVIEWS & FEEDBACK API (CN02.18) ==================== */
export const reviewApi = {
  // POST /reviews (Học viên đánh giá sau khi hoàn tất buổi học/khóa học)
  create: async (data) => {
    return await request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // GET /reviews/tutor/:tutorId (Xem các đánh giá của 1 gia sư)
  getByTutor: async (tutorId) => {
    return await request(`/reviews/tutor/${tutorId}`);
  },

  // GET /reviews/tutor (Gia sư tự xem đánh giá của mình)
  getMyReviews: async () => {
    return await request('/reviews/tutor');
  },
};
