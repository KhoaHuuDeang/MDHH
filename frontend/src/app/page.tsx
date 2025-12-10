"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import useNotifications from "@/hooks/useNotifications";
// Giả định utility này nhập các icon từ thư viện như lucide-react hoặc feather-icons
import { getIcon } from "@/utils/getIcon";
import Link from "next/link";
import { homepageService } from "@/services/homepageService";
import { classificationService } from "@/services/classificationService";

/**
 * MDHH Landing Page - Educational Document Management Platform
 * Following MDHH Design UI Conventions:
 * - Educational Green Palette: #6A994E (primary), #386641 (dark), #F8F9FA (light)
 * - Mobile-first progressive enhancement
 * - WCAG AAA touch targets (44x44px minimum)
 * - Centralized icon system with getIcon utility
 * - Responsive typography scaling
 */

function MDHHLandingPageContent() {
  const searchParams = useSearchParams();
  const toast = useNotifications();
  const [scrollY, setScrollY] = useState(0);
  const [activeCategory, setActiveCategory] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const [classificationLevels, setClassificationLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State cho hiệu ứng đếm số
  const [counter, setCounter] = useState({
    documents: 0,
    users: 0,
    downloads: 0,
    discussions: 0
  });

  // State rỗng để lưu vị trí ngẫu nhiên của các trang trí sau khi mount
  const [heroDecorations, setHeroDecorations] = useState<Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>>([]);

  const [ctaDecorations, setCtaDecorations] = useState<Array<{
    left: number;
    top: number;
    delay: number;
    duration: number;
  }>>([]);

  // --- EFFECTs CHẠY MỘT LẦN SAU KHI COMPONENT MOUNT (CLIENT-SIDE) ---

  // Check for unauthorized error
  useEffect(() => {
    const error = searchParams.get('error');
    if (error === 'unauthorized') {
      toast.error('Access denied. Admin privileges required.');
    }
  }, [searchParams, toast]);

  // Logic Parallax Scroll & Khởi tạo Decorations (chỉ chạy 1 lần)
  useEffect(() => {
    // Khởi tạo Parallax Scroll Listener
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Khởi tạo các vị trí ngẫu nhiên cho Decorative elements
    setHeroDecorations(
      Array.from({ length: 15 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 2 + Math.random() * 3
      }))
    );

    setCtaDecorations(
      Array.from({ length: 20 }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 5,
        duration: 5 + Math.random() * 10
      }))
    );
    
    // Cleanup function để loại bỏ listener khi component unmount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Dependency array rỗng đảm bảo chỉ chạy MỘT LẦN

  // Fetch real classification levels and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch classification levels
        const levels = await classificationService.getClassificationLevels();
        setClassificationLevels(levels);

        // Fetch stats
        const stats = await homepageService.getPublicStats();
        const targets = {
          documents: stats.documents || 0,
          users: stats.users || 0,
          downloads: stats.downloads || 0,
          discussions: stats.discussions || 0
        };

        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
          currentStep++;
          const progress = currentStep / steps;
          const easeOutQuart = 1 - Math.pow(1 - progress, 4);

          setCounter({
            documents: Math.floor(targets.documents * easeOutQuart),
            users: Math.floor(targets.users * easeOutQuart),
            downloads: Math.floor(targets.downloads * easeOutQuart),
            discussions: Math.floor(targets.discussions * easeOutQuart)
          });

          if (currentStep >= steps) {
            clearInterval(timer);
            setCounter(targets);
          }
        }, interval);

        setLoading(false);
        return () => clearInterval(timer);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- DATA ---

  // Transform classification levels into categories
  const categories = [
    { id: 'all', name: 'Tất cả', icon: 'Globe' },
    ...classificationLevels.map(level => ({
      id: level.id,
      name: level.name,
      icon: 'FolderOpen'
    }))
  ];

  const features = [
    {
      icon: 'Folder',
      title: 'Phân loại thông minh',
      description: 'Hệ thống classification levels giúp tổ chức tài liệu theo cấp độ bảo mật và chủ đề',
      color: 'from-[#386641] to-[#6A994E]'
    },
    {
      icon: 'Shield',
      title: 'Bảo mật đa lớp',
      description: 'NextAuth.js + JWT + OAuth đảm bảo an toàn tuyệt đối cho dữ liệu người dùng',
      color: 'from-[#6A994E] to-[#386641]'
    },
    {
      icon: 'Tags',
      title: 'Tag System',
      description: 'Gắn thẻ thông minh giúp tìm kiếm và phân loại tài liệu hiệu quả',
      color: 'from-[#386641] to-[#6A994E]'
    },
    {
      icon: 'MessageSquare',
      title: 'Thảo luận sôi nổi',
      description: 'Comment đa cấp, rating và follow để tạo cộng đồng học tập tương tác',
      color: 'from-[#6A994E] to-[#386641]'
    }
  ];

  const popularDocuments = [
    {
      id: 1,
      title: 'Đề thi thử THPT Quốc gia 2024 - Toán học',
      category: 'THPT',
      level: 'Nâng cao',
      downloads: 2345,
      rating: 4.8,
      discussions: 156,
      author: 'ThS. Nguyễn Văn A',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'IELTS Writing Task 2 - Sample Essays Band 8+',
      category: 'IELTS',
      level: 'Advanced',
      downloads: 3456,
      rating: 4.9,
      discussions: 234,
      author: 'Ms. Sarah Johnson',
      image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Giải tích 1 - Bài tập và lời giải chi tiết',
      category: 'Đại học',
      level: 'Cơ bản',
      downloads: 1890,
      rating: 4.7,
      discussions: 89,
      author: 'PGS.TS Trần Văn B',
      image: 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      title: 'Ngữ pháp Tiếng Anh THCS - Full chương trình',
      category: 'THCS',
      level: 'Cơ bản',
      downloads: 4567,
      rating: 4.6,
      discussions: 312,
      author: 'Cô Phạm Thị C',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      title: 'TOEIC 990 - Strategies & Practice Tests',
      category: 'english', // Đổi category để khớp với filter
      level: 'Expert',
      downloads: 2678,
      rating: 4.9,
      discussions: 178,
      author: 'Mr. David Lee',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      title: 'Vật lý 12 - Tổng hợp công thức và bài tập',
      category: 'THPT',
      level: 'Nâng cao',
      downloads: 3234,
      rating: 4.8,
      discussions: 267,
      author: 'Thầy Lê Văn D',
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop'
    }
  ];

  const testimonials = [
    {
      name: 'Nguyễn Thị Mai',
      role: 'Sinh viên ĐH Bách Khoa',
      avatar: 'https://i.pravatar.cc/150?img=1',
      content: 'MDHH đã giúp tôi tìm được tài liệu học tập chất lượng cao. Hệ thống phân loại và đánh giá rất hữu ích!',
      rating: 5
    },
    {
      name: 'Trần Văn Hùng',
      role: 'Học sinh THPT',
      avatar: 'https://i.pravatar.cc/150?img=3',
      content: 'Cộng đồng trên MDHH rất nhiệt tình. Tôi được giải đáp mọi thắc mắc và tìm thấy nhiều tài liệu quý.',
      rating: 5
    },
    {
      name: 'Phạm Thị Lan',
      role: 'Giáo viên THCS',
      avatar: 'https://i.pravatar.cc/150?img=5',
      content: 'Platform tuyệt vời cho việc chia sẻ và tìm kiếm tài liệu giảng dạy. Giao diện đẹp và dễ sử dụng.',
      rating: 5
    }
  ];

  // --- JSX RENDER ---

  return (
    <main className="min-h-screen bg-[#F8F9FA] overflow-hidden">
      
      {/* 1. Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8F9FA] to-white">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-[#6A994E]/10 via-[#386641]/5 to-[#6A994E]/10"></div>
          {heroDecorations.length > 0 && (
            <div
              className="absolute inset-0"
              style={{ transform: `translateY(${scrollY * 0.3}px)` }}
            >
              {heroDecorations.map((decoration, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${decoration.left}%`,
                    top: `${decoration.top}%`,
                    animationDelay: `${decoration.delay}s`,
                    animationDuration: `${decoration.duration}s`
                  }}
                >
                  <div className="w-2 h-2 bg-[#6A994E] rounded-full opacity-40"></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-[#6A994E]/10 backdrop-blur-sm rounded-full border border-[#6A994E]/20">
              {getIcon('Sparkles', 16, 'text-[#6A994E] mr-2')}
              <span className="text-sm sm:text-base font-medium text-[#386641]">
                Platform Học Tập Cộng Đồng #1 Việt Nam
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
              MDHH - Kho Tàng
              <br />
              <span className="text-[#6A994E]">Tri Thức Số</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Nơi hội tụ hàng nghìn tài liệu học tập chất lượng cao từ THCS đến Đại học. 
              Cộng đồng học tập sôi động với hệ thống đánh giá và thảo luận tương tác.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link href="/home" className="group min-h-[44px] min-w-[44px] px-8 py-4 bg-[#386641] text-white font-semibold rounded-xl shadow-lg hover:bg-[#2d4f31] hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6A994E]/50 flex items-center justify-center">
                <span className="flex items-center justify-center">
                  Khám phá ngay
                  {getIcon('ArrowRight', 20, 'ml-2 group-hover:translate-x-1 transition-transform')}
                </span>
              </Link>

              <Link href="/home" className="group min-h-[44px] min-w-[44px] px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl border border-gray-200 hover:border-[#6A994E]/30 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 flex items-center justify-center">
                {getIcon('Play', 20, 'w-5 h-5 mr-2 text-[#6A994E] group-hover:scale-110 transition-transform')}
                Xem Demo
              </Link>
            </div>
          </div>

          {/* Stats Counter */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-12 sm:mt-16 px-4">
            {[
              { label: 'Tài liệu', value: counter.documents, icon: 'FileText', color: 'from-[#386641] to-[#6A994E]' },
              { label: 'Người dùng', value: counter.users, icon: 'Users', color: 'from-[#6A994E] to-[#386641]' },
              { label: 'Lượt tải', value: counter.downloads, icon: 'Download', color: 'from-[#386641] to-[#6A994E]' },
              { label: 'Thảo luận', value: counter.discussions, icon: 'MessageSquare', color: 'from-[#6A994E] to-[#386641]' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-[#6A994E]/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                <div className="relative text-center">
                  <div className={`inline-flex p-3 bg-gradient-to-br ${stat.color} rounded-xl mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {getIcon(stat.icon, 24, 'text-white')}
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
                    {stat.value.toLocaleString()}+
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="flex flex-col items-center text-gray-400">
            <span className="text-sm mb-2 hidden sm:block">Cuộn xuống</span>
            {getIcon('ChevronDown', 20, 'rotate-0')}
          </div>
        </div>
      </section>

      {/* 2. Categories Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Khám phá theo cấp độ
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Tài liệu được phân loại chi tiết theo từng cấp học và chủ đề
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-8 sm:mb-12">
            {loading ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : (
              categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`group flex items-center min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-[#386641] text-white shadow-lg scale-105'
                      : 'bg-white text-gray-600 hover:text-gray-800 hover:shadow-md hover:scale-105 border border-gray-200 hover:border-[#6A994E]/30'
                  }`}
                >
                  {getIcon(cat.icon, 18, `mr-2 ${
                    activeCategory === cat.id ? 'text-white' : 'text-gray-400 group-hover:text-[#6A994E]'
                  }`)}
                  <span className="text-sm sm:text-base">{cat.name}</span>
                </button>
              ))
            )}
          </div>

          {/* Classification Levels Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-gray-500">Đang tải cấp độ phân loại...</div>
            ) : (
              (activeCategory === 'all' ? classificationLevels : classificationLevels.filter(l => l.id === activeCategory)).map((level) => (
                <Link
                  key={level.id}
                  href="/home"
                  className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden p-6"
                >
                  {/* Icon */}
                  <div className="inline-flex p-4 bg-gradient-to-br from-[#386641] to-[#6A994E] rounded-xl mb-4 shadow-lg group-hover:scale-110 transition-transform">
                    {getIcon('FolderOpen', 32, 'text-white')}
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-[#6A994E] transition-colors">
                    {level.name}
                  </h3>

                  <p className="text-sm text-gray-600 mb-4">
                    {level.description}
                  </p>

                  {/* Tags */}
                  {level.tags && level.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {level.tags.slice(0, 3).map((tag: any) => (
                        <span
                          key={tag.id}
                          className="px-3 py-1 bg-[#6A994E]/10 text-[#386641] text-xs font-medium rounded-full"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {level.tags.length > 3 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          +{level.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Arrow */}
                  <div className="flex items-center text-[#6A994E] font-medium group-hover:text-[#386641] transition-colors mt-4">
                    <span className="text-sm">Khám phá</span>
                    {getIcon('ArrowRight', 16, 'ml-2 group-hover:translate-x-2 transition-transform')}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-12 sm:py-20 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Tính năng nổi bật
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Hệ thống quản lý tài liệu thông minh với công nghệ tiên tiến
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100 hover:border-[#6A994E]/30"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}></div>
                
                <div className="relative">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                    {getIcon(feature.icon, 32, 'text-white')}
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 group-hover:text-[#6A994E] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base mb-6">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-[#6A994E] font-medium hover:text-[#386641] transition-colors">
                    <span className="text-sm sm:text-base">Tìm hiểu thêm</span>
                    {getIcon('ArrowRight', 16, 'ml-2 group-hover:translate-x-2 transition-transform')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Cách hoạt động
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Quy trình đơn giản để bắt đầu hành trình học tập của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              { step: 1, title: 'Đăng ký tài khoản', icon: 'Users', description: 'Tạo tài khoản miễn phí trong 30 giây' },
              { step: 2, title: 'Tìm kiếm tài liệu', icon: 'Search', description: 'Khám phá kho tài liệu khổng lồ' },
              { step: 3, title: 'Đánh giá & Thảo luận', icon: 'MessageSquare', description: 'Tham gia cộng đồng học tập' },
              { step: 4, title: 'Tải về & Học tập', icon: 'Download', description: 'Download và bắt đầu học ngay' }
            ].map((item, index) => (
              <div key={index} className="relative">
                {/* Connection Line - Hidden on mobile */}
                {index < 3 && (
                  <div className="hidden lg:block absolute top-12 left-[calc(50%+1rem)] w-[calc(100%-2rem)] h-0.5 bg-gradient-to-r from-[#6A994E] to-[#386641] opacity-30 -translate-x-1/2 -z-10"></div>
                )}
                
                <div className="relative group">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-[#386641] to-[#6A994E] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform z-10">
                    {item.step}
                  </div>
                  
                  {/* Card */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-center border border-gray-100 hover:border-[#6A994E]/30">
                    <div className="inline-flex p-4 bg-[#6A994E]/10 rounded-xl mb-4 group-hover:rotate-6 transition-transform">
                      {getIcon(item.icon, 32, 'text-[#6A994E]')}
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-12 sm:py-20 bg-[#F8F9FA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 text-gray-800">
              Cộng đồng nói gì về MDHH
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Hàng nghìn học sinh, sinh viên và giáo viên tin tưởng sử dụng
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-gray-100"
              >
                {/* Quote Icon */}
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-[#386641] to-[#6A994E] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-white text-2xl font-serif">&quot;</span>
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Stars */}
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, starIndex) => (
                      <div key={starIndex}>
                        {getIcon('Star', 20, 'text-yellow-400 fill-current mr-1')}
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-600 mb-6 italic leading-relaxed text-sm sm:text-base">
                    &quot;{testimonial.content}&quot;
                  </p>

                  {/* Author */}
                  <div className="flex items-center">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4 border-2 border-[#6A994E]/20"
                    />
                    <div>
                      <div className="font-semibold text-gray-800 text-sm sm:text-base">{testimonial.name}</div>
                      <div className="text-xs sm:text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-[#386641] via-[#6A994E] to-[#386641] relative overflow-hidden">
        {/* Animated Background Elements */}
        {ctaDecorations.length > 0 && (
          <div className="absolute inset-0">
            {ctaDecorations.map((decoration, i) => (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  left: `${decoration.left}%`,
                  top: `${decoration.top}%`,
                  animationDelay: `${decoration.delay}s`,
                  animationDuration: `${decoration.duration}s`
                }}
              >
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            {getIcon('Rocket', 16, 'text-white mr-2')}
            <span className="text-sm font-medium text-white">
              Tham gia cùng {counter.users.toLocaleString()}+ người dùng
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Bắt đầu hành trình học tập
            <br />
            <span className="text-yellow-300">hoàn toàn miễn phí</span>
          </h2>

          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Truy cập ngay vào kho tài liệu khổng lồ và cộng đồng học tập sôi động của MDHH
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group min-h-[44px] px-8 py-4 bg-white text-gray-800 font-semibold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/40">
              <span className="flex items-center justify-center">
                Đăng ký ngay
                {getIcon('ArrowRight', 20, 'ml-2 group-hover:translate-x-1 transition-transform')}
              </span>
            </button>

            <button className="min-h-[44px] px-8 py-4 bg-white/20 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/50 hover:bg-white/30 transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/40">
              <span className="flex items-center justify-center">
                {getIcon('Coffee', 20, 'mr-2')}
                Tìm hiểu thêm
              </span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6 text-white/80">
            <div className="flex items-center">
              {getIcon('Shield', 20, 'mr-2')}
              <span className="text-xs sm:text-sm">Bảo mật tuyệt đối</span>
            </div>
            <div className="flex items-center">
              {getIcon('CheckCircle', 20, 'mr-2')}
              <span className="text-xs sm:text-sm">Miễn phí 100%</span>
            </div>
            <div className="flex items-center">
              {getIcon('Clock', 20, 'mr-2')}
              <span className="text-xs sm:text-sm">Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-gray-900 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center mb-4">
                {getIcon('Brain', 40, 'text-[#6A994E] mr-3')}
                <span className="text-2xl font-bold">MDHH</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
                Nền tảng học tập cộng đồng hàng đầu Việt Nam. Kết nối tri thức, chia sẻ tài liệu, cùng nhau phát triển.
              </p>
              <div className="flex space-x-4">
                {['facebook', 'twitter', 'linkedin', 'youtube'].map((social) => (
                  // Giả định getIcon có thể nhận tên social hoặc bạn cần thay thế bằng icon thực tế
                  <button
                    key={social}
                    className="min-h-[44px] min-w-[44px] w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#6A994E] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/40"
                  >
                    {getIcon('Globe', 20)} 
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Khám phá</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Tài liệu THCS</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Tài liệu THPT</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Tài liệu Đại học</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">IELTS/TOEIC</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-gray-400 text-sm sm:text-base">
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Hướng dẫn sử dụng</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Câu hỏi thường gặp</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Liên hệ</Link></li>
                <li><Link href="#" className="hover:text-[#6A994E] transition-colors">Điều khoản sử dụng</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 MDHH. All rights reserved. Made with ❤️ in Vietnam</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default function MDHHLandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
      <MDHHLandingPageContent />
    </Suspense>
  );
}