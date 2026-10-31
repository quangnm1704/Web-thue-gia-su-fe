import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  Bell, 
  Globe, 
  Menu, 
  ChevronDown, 
  GraduationCap, 
  BookOpen, 
  User, 
  Sparkles,
  LogOut,
  X,
  MessageCircle,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { categories } from '../data/mockData';

export default function Navbar({ 
  onOpenAuth, 
  onSearch, 
  cartCount = 0, 
  wishlistCount = 0, 
  currentUser, 
  onLogout,
  notificationCount = 0,
  conversationCount = 0,
  onOpenBookings,
  onOpenCart,
  onOpenWishlist,
  onOpenConversations,
  onOpenAdmin,
  userWallet,
  onOpenWallet
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);
  const categoriesTimeoutRef = useRef(null);
  const userMenuTimeoutRef = useRef(null);

  const handleCategoriesEnter = () => {
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setShowCategories(true);
  };

  const handleCategoriesLeave = () => {
    categoriesTimeoutRef.current = setTimeout(() => {
      setShowCategories(false);
    }, 200);
  };

  const handleCategoriesToggle = (e) => {
    e.preventDefault();
    if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
    setShowCategories((prev) => !prev);
  };

  const handleUserMenuEnter = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setShowUserMenu(true);
  };

  const handleUserMenuLeave = () => {
    userMenuTimeoutRef.current = setTimeout(() => {
      setShowUserMenu(false);
    }, 200);
  };

  const handleUserMenuToggle = (e) => {
    e.preventDefault();
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setShowUserMenu((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setShowCategories(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (categoriesTimeoutRef.current) clearTimeout(categoriesTimeoutRef.current);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    };
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchTerm);
  };

  return (
    <header className="ud-navbar-wrapper">
      {/* Top promotional bar */}
      <div className="ud-top-bar">
        <div className="container ud-top-bar-content">
          <p>
            <Sparkles size={14} className="inline-icon" /> 
            <strong>Ưu đãi tháng 10:</strong> Giảm tới <strong>60%</strong> các khóa học và tặng <strong>1 buổi học thử 1-1</strong> với Gia sư đạt chuẩn!
          </p>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="ud-navbar">
        <div className="container ud-navbar-inner">
          {/* Logo */}
          <a href="#" className="ud-logo">
            <div className="ud-logo-icon">
              <GraduationCap size={28} />
            </div>
            <span className="ud-logo-text">Edu<span>Tutor</span></span>
          </a>

          {/* Categories Button with Dropdown */}
          <div 
            ref={categoriesRef}
            className="ud-categories-wrapper" 
            onMouseEnter={handleCategoriesEnter}
            onMouseLeave={handleCategoriesLeave}
          >
            <button 
              className="ud-nav-link ud-categories-btn"
              onClick={handleCategoriesToggle}
            >
              <span>Khám phá</span>
              <ChevronDown size={16} />
            </button>

            {showCategories && (
              <div 
                className="ud-categories-dropdown animate-fade-in"
                onMouseEnter={handleCategoriesEnter}
                onMouseLeave={handleCategoriesLeave}
              >
                <div className="ud-cat-header">Danh mục đào tạo & gia sư</div>
                <div className="ud-cat-list">
                  {categories.map((cat) => (
                    <a 
                      key={cat.id} 
                      href={`#category-${cat.id}`} 
                      className="ud-cat-item"
                      onClick={() => setShowCategories(false)}
                    >
                      <BookOpen size={16} className="cat-icon" />
                      <div className="cat-info">
                        <span className="cat-name">{cat.name}</span>
                        <span className="cat-count">{cat.count}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search bar */}
          <form className={`ud-search-form ${isSearchFocused ? 'focused' : ''}`} onSubmit={handleSearchSubmit}>
            <Search size={18} className="ud-search-icon" />
            <input 
              type="text" 
              placeholder="Tìm kiếm môn học, khóa học, tên gia sư..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <button type="button" className="ud-search-clear" onClick={() => setSearchTerm('')}>
                <X size={16} />
              </button>
            )}
          </form>

          {/* Navigation Links */}
          <div className="ud-nav-actions">
            <a href="#tutors" className="ud-nav-link hide-mobile">
              Gia sư 1-1
            </a>
            <a href="#courses" className="ud-nav-link hide-mobile">
              Khóa học
            </a>
            <a href="#articles" className="ud-nav-link hide-mobile">
              Diễn đàn
            </a>
            <a href="#become-tutor" className="ud-nav-link ud-tutor-cta hide-mobile">
              Trở thành Gia sư
            </a>

            {/* Icon buttons */}
            <div className="ud-icon-buttons">
              {currentUser && (
                <button 
                  className="ud-wallet-btn" 
                  title={`Ví EduTutor - Số dư: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userWallet?.availableBalance || 0)} (Bấm để nạp/xem chi tiết)`}
                  onClick={onOpenWallet}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px',
                    borderRadius: 20,
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    color: '#1d4ed8',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginRight: 6
                  }}
                >
                  <Wallet size={16} color="#2563eb" />
                  <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userWallet?.availableBalance || 0)}</span>
                </button>
              )}
              <button 
                className="ud-icon-btn" 
                title="Danh sách yêu thích"
                onClick={() => {
                  if (onOpenWishlist) onOpenWishlist();
                  else if (!currentUser && onOpenAuth) onOpenAuth('login');
                }}
              >
                <Heart size={20} fill={wishlistCount > 0 ? '#db2777' : 'none'} color={wishlistCount > 0 ? '#db2777' : 'currentColor'} />
                {wishlistCount > 0 && <span className="ud-badge-count" style={{ background: '#db2777' }}>{wishlistCount}</span>}
              </button>

              <button 
                className="ud-icon-btn" 
                title="Giỏ hàng"
                onClick={() => {
                  if (onOpenCart) onOpenCart();
                  else if (!currentUser && onOpenAuth) onOpenAuth('login');
                }}
              >
                <ShoppingCart size={20} color={cartCount > 0 ? '#a435f0' : 'currentColor'} />
                {cartCount > 0 && <span className="ud-badge-count">{cartCount}</span>}
              </button>

              {/* Messenger / Tin nhắn icon */}
              <button 
                className="ud-icon-btn" 
                title={conversationCount > 0 ? `Tin nhắn (${conversationCount} cuộc trò chuyện)` : "Tin nhắn & Trò chuyện"}
                onClick={() => {
                  if (onOpenConversations) onOpenConversations();
                  else if (!currentUser && onOpenAuth) onOpenAuth('login');
                }}
                style={{ position: 'relative' }}
              >
                <MessageCircle size={20} color={conversationCount > 0 ? '#a435f0' : 'currentColor'} />
                {conversationCount > 0 && (
                  <span 
                    className="ud-badge-count" 
                    style={{ backgroundColor: '#a435f0', color: '#fff' }}
                  >
                    {conversationCount}
                  </span>
                )}
              </button>

              <button 
                className="ud-icon-btn" 
                title={notificationCount > 0 ? `Bạn có ${notificationCount} thông báo mới!` : "Thông báo"}
                onClick={() => {
                  if (onOpenBookings) onOpenBookings();
                  else if (!currentUser && onOpenAuth) onOpenAuth('login');
                }}
                style={{ position: 'relative' }}
              >
                <Bell size={20} color={notificationCount > 0 ? '#a435f0' : 'currentColor'} />
                {notificationCount > 0 && (
                  <span 
                    className="ud-badge-count" 
                    style={{ backgroundColor: '#a435f0', color: '#fff', animation: 'pulse 2s infinite' }}
                  >
                    {notificationCount}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile or Auth Buttons */}
            {currentUser ? (
              <div 
                ref={userMenuRef}
                className="ud-user-profile-wrapper" 
                onMouseEnter={handleUserMenuEnter}
                onMouseLeave={handleUserMenuLeave}
              >
                <button 
                  className="ud-user-avatar-btn"
                  onClick={handleUserMenuToggle}
                >
                  <div 
                    className="user-avatar-circle" 
                    style={{ 
                      background: currentUser.role === 'ADMIN' 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : (currentUser.role === 'TUTOR' 
                            ? 'linear-gradient(135deg, #a435f0 0%, #5624d0 100%)' 
                            : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)') 
                    }}
                  >
                    {currentUser.role === 'ADMIN' ? 'A' : (currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U')}
                  </div>
                  <div className="user-nav-details hide-mobile">
                    <span className="user-nav-name">{currentUser.displayName || currentUser.username}</span>
                    <span 
                      className="user-nav-role" 
                      style={{ 
                        color: currentUser.role === 'ADMIN' ? '#dc2626' : (currentUser.role === 'TUTOR' ? '#a435f0' : '#2563eb'),
                        fontWeight: 700 
                      }}
                    >
                      {currentUser.role === 'ADMIN' ? 'Quản trị viên' : (currentUser.role === 'TUTOR' ? 'Gia sư' : 'Học viên')}
                    </span>
                  </div>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div 
                    className="ud-user-menu-dropdown animate-fade-in"
                    onMouseEnter={handleUserMenuEnter}
                    onMouseLeave={handleUserMenuLeave}
                  >
                    <div className="menu-header">
                      <strong>{currentUser.displayName || currentUser.username}</strong>
                      <span className="menu-email">{currentUser.email || currentUser.username}</span>
                      <span 
                        style={{ 
                          marginTop: 6, 
                          display: 'inline-block', 
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 4,
                          backgroundColor: currentUser.role === 'ADMIN' 
                            ? '#fee2e2' 
                            : (currentUser.role === 'TUTOR' ? '#f3e8ff' : '#eff6ff'),
                          color: currentUser.role === 'ADMIN' 
                            ? '#b91c1c' 
                            : (currentUser.role === 'TUTOR' ? '#7e22ce' : '#1d4ed8'),
                          border: currentUser.role === 'ADMIN' 
                            ? '1px solid #fca5a5' 
                            : (currentUser.role === 'TUTOR' ? '1px solid #d8b4fe' : '1px solid #bfdbfe')
                        }}
                      >
                        Vai trò: {currentUser.role === 'ADMIN' ? 'Quản trị viên hệ thống (Admin)' : (currentUser.role === 'TUTOR' ? 'Gia sư chuyên nghiệp' : 'Học viên')}
                      </span>
                    </div>
                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item" 
                      onClick={() => { setShowUserMenu(false); if (onOpenWallet) onOpenWallet(); }}
                      style={{ width: '100%', textAlign: 'left', background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', marginBottom: 6 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Wallet size={16} color="#2563eb" />
                        <span style={{ fontWeight: 600, color: '#1d4ed8' }}>Ví tiền EduTutor</span>
                      </div>
                      <strong style={{ color: '#1d4ed8', fontSize: '0.85rem' }}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userWallet?.availableBalance || 0)}
                      </strong>
                    </button>

                    {/* Admin Dashboard Entry */}
                    {currentUser.role === 'ADMIN' && (
                      <>
                        <button 
                          className="menu-item" 
                          onClick={() => { setShowUserMenu(false); if (onOpenAdmin) onOpenAdmin(); }}
                          style={{ width: '100%', textAlign: 'left', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 4, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: '#dc2626', fontWeight: 700, marginBottom: 4 }}
                        >
                          <ShieldCheck size={16} color="#dc2626" />
                          <span>Bảng điều khiển Quản trị</span>
                        </button>
                        <div className="menu-divider"></div>
                      </>
                    )}

                    <a 
                      href="#courses" 
                      className="menu-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <BookOpen size={16} /> Danh sách khóa học
                    </a>
                    
                    {currentUser.role === 'TUTOR' ? (
                      <button 
                        className="menu-item" 
                        onClick={() => { setShowUserMenu(false); if (onOpenBookings) onOpenBookings(); }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <GraduationCap size={16} color="#a435f0" />
                          <span>Yêu cầu học viên đặt lịch</span>
                        </div>
                        {notificationCount > 0 && (
                          <span style={{ background: '#a435f0', color: '#fff', fontSize: '0.75rem', padding: '2px 7px', borderRadius: 10, fontWeight: 700 }}>
                            {notificationCount} mới
                          </span>
                        )}
                      </button>
                    ) : currentUser.role === 'STUDENT' ? (
                      <button 
                        className="menu-item" 
                        onClick={() => { setShowUserMenu(false); if (onOpenBookings) onOpenBookings(); }}
                        style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                      >
                        <GraduationCap size={16} />
                        <span>Đơn thuê gia sư của tôi</span>
                      </button>
                    ) : null}

                    <div className="menu-divider"></div>
                    <button 
                      className="menu-item logout" 
                      onClick={() => {
                        setShowUserMenu(false);
                        if (onLogout) onLogout();
                      }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ud-auth-btns">
                <button className="btn btn-outline" onClick={() => onOpenAuth('login')}>
                  Đăng nhập
                </button>
                <button className="btn btn-dark" onClick={() => onOpenAuth('register')}>
                  Đăng ký
                </button>
              </div>
            )}

            {/* Language Globe */}
            <button className="ud-globe-btn" title="Chọn ngôn ngữ">
              <Globe size={18} />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
