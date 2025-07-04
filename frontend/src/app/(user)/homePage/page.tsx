"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as lucideIcons from 'lucide-react'

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = (lucideIcons as any)[iconName];
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
}
const getActionIcon = (id: number) => {
  switch (id) {
    case 1: return "Book";
    case 2: return "Brain";
    case 3: return "Pencil";
    default: return "Zap";
  }
};
// Mock data for documents
const recentDocuments = [
  {
    id: 1,
    title: "Lab 1: Khám Phá Dữ Liệu và Trực Quan Hóa Trong Deep Learning",
    course: "Cấu trúc dữ liệu và giải thuật",
    pages: 12,
    thumbnailUrl: "/doc1.jpg",
    rating: { positive: 100, count: 5 }
  },
  {
    id: 2,
    title: "A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90 that can be composed to build any design, directly in your markup.",
    course: "Web Design",
    pages: 16,
    thumbnailUrl: "/doc2.jpg",
    rating: { positive: 95, count: 12 }
  },
  {
    id: 3,
    title: "Skibidi dom dom yes yes ",
    course: "Brain rot traininng",
    pages: 60,
    thumbnailUrl: "/doc3.jpg",
    rating: { positive: 98, count: 8 }
  },
  {
    id: 4,
    title: "It's Going Down Now It's Going Down Now ",
    course: "Music ",
    pages: 2,
    thumbnailUrl: "/doc4.jpg",
    rating: { positive: 90, count: 3 }
  },
  {
    id: 5,
    title: "巌戸台分寮 -Reload- - Iwatodai Dorm -Reload-",
    course: "Japanese",
    pages: 20,
    thumbnailUrl: "/doc5.jpg",
    rating: { positive: 92, count: 7 }
  }
];

// Mock data for courses/folders
const recentCourses = [
  {
    id: 1,
    name: "Cấu trúc dữ liệu và giải thuật Cấu trúc dữ liệu và giải thuật",
    code: "CTDLGT",
    documentCount: 347,
    color: "#2cc302"
  },
  {
    id: 2,
    name: "CTDL & GT",
    institution: "Trường Đại học Bách Khoa",
    documentCount: 18,
    color: "#2cc302"
  },
  {
    id: 3,
    name: "Lập Trình Web",
    documentCount: 21,
    color: "#2cc302"
  },
  {
    id: 4,
    name: "Kĩ Thuật Lập Trình",
    code: "22DTH4C",
    documentCount: 39,
    color: "#2cc302"
  },
  {
    id: 5,
    name: "Kĩ thuật lập trình",
    code: "MI3310",
    documentCount: 399,
    color: "#2cc302"
  }
];

// Quick action cards data with enhanced designs
const quickActions = [
  {
    id: 1,
    title: "Create a quiz",
    icon: (
      <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-200">
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F064FC] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
          +
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#EFEEE8] to-[#E1DDD8] rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50">
          {getIcons("Book", 20, "text-[#B69DFC] group-hover:text-[#967fd6] transition-colors")}
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Ask a Question",
    icon: (
      <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-200">
        <div className="w-12 h-12 bg-gradient-to-br from-[#EFEEE8] to-[#E1DDD8] rounded-full flex items-center justify-center shadow-sm border border-gray-200/50">
          {getIcons("Brain", 20, "text-[#F064FC] group-hover:text-[#E054EC] transition-colors")}
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Summarize your notes",
    icon: (
      <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-200">
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#F064FC] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
          ✓
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-[#EFEEE8] to-[#E1DDD8] rounded-xl flex items-center justify-center shadow-sm border border-gray-200/50">
          {getIcons("Pencil", 20, "text-[#B69DFC] group-hover:text-[#967fd6] transition-colors")}
        </div>
      </div>
    )
  }
];
// Educational Color Palette
const colors = {
  primary: {
    green: '#6A994E',      // Hover states, secondary actions
    darkGreen: '#386641',  // CTA buttons, emphasis
    white: '#FFFFFF',      // Background, primary text
  },
  neutral: {
    lightGray: '#F8F9FA',
    mediumGray: '#6C757D',
    darkGray: '#343A40',
  }
}

