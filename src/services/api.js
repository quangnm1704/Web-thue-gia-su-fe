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
  // GET /courses
  getCourses: async () => {
    return await request('/courses');
  },

  // GET /courses/:id
  getCourse: async (id) => {
    return await request(`/courses/${id}`);
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
};
