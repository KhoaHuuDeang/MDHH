"use client";

import React, { useState } from 'react';
import * as lucideIcons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import Image from 'next/image';
const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon
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
// const colors = {
//   primary: {
//     green: '#6A994E',      // Hover states, secondary actions
//     darkGreen: '#386641',  // CTA buttons, emphasis
//     white: '#FFFFFF',      // Background, primary text
//   },
//   neutral: {
//     lightGray: '#F8F9FA',
//     mediumGray: '#6C757D',
//     darkGray: '#343A40',
//   }
// }

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  }



  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
        {/* Enhanced Search Bar */}
        <div className='mb-12'>
          <form onSubmit={handleSearch} className="relative">
            <div className="bg-white border-2 border-gray-200 hover:border-[#6A994E] transition-all duration-200 rounded-xl shadow-sm">
              <input
                type="search"
                placeholder="Search documents, courses, quizzes..."
                className="w-full py-6 px-8 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none font-medium text-lg rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-[#386641] text-white p-4 hover:bg-[#2d4f31] transition-colors duration-200 rounded-lg shadow-md hover:shadow-lg"
              >
                {getIcons("Search", 20, "text-white")}
              </button>
            </div>
          </form>
        </div>
        {/* Quick Actions Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {quickActions.map(action => (
            <button
              key={action.id}
              className="group relative bg-white border border-gray-200 hover:border-[#6A994E] transition-all duration-200 hover:shadow-lg rounded-xl p-8 h-24 flex items-center cursor-pointer"
            >
              <div className="w-14 h-14 bg-gray-50 group-hover:bg-[#6A994E]/10 flex items-center justify-center transition-colors duration-200 rounded-lg">
                {getIcons(getActionIcon(action.id), 24, "text-[#6A994E] group-hover:text-[#386641] transition-colors")}
              </div>

              <span className="ml-6 font-semibold text-gray-700 group-hover:text-[#386641] text-xl transition-colors">
                {action.title}
              </span>

              {/* Enhanced hover accent */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6A994E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-b-xl"></div>
            </button>
          ))}
        </div>
        {/* Continue Reading */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Continue Reading
            </h2>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-100 text-gray-600 border border-gray-200 hover:bg-[#6A994E] hover:text-white transition-all duration-200 rounded-md cursor-pointer">
                {getIcons("ChevronLeft", 20)}
              </button>
              <button className="p-2 bg-[#6A994E] text-white border border-[#6A994E] hover:bg-[#386641] transition-all duration-200 rounded-md cursor-pointer">
                {getIcons("ChevronRight", 20)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {recentDocuments.map(document => (
              <div key={document.id} className="group">
                {/* Main Card Area */}
                <div className="bg-white border border-gray-200 hover:border-[#6A994E] hover:shadow-md transition-all duration-100 rounded-lg overflow-hidden">
                  <a href={`/document/${document.id}`} className="block">
                    {/* Document Preview Area */}
                    <div className="relative bg-gray-50">
                      {/* Page Count Badge */}
                      <div className="absolute top-2.5 left-2.5 bg-[#386641] text-white px-2.5 py-0.5 text-xs font-medium rounded-full z-10">
                        {document.pages}
                      </div>

                      {/* Document Thumbnail */}
                      <div className="w-full h-48 flex items-center justify-center">
                        {document.thumbnailUrl ? (
                          <Image
                            src={document.thumbnailUrl}
                            alt={document.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full 
                          h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                            {getIcons("FileText", 40, "text-gray-400")}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Document Info Area */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 mb-2 group-hover:text-[#386641] transition-colors">
                        {document.title}
                      </h3>
                      <div>
                        <span className="text-gray-500 text-xs">
                          {document.course}
                        </span>
                      </div>
                    </div>
                  </a>

                  {/* Actions Row */}
                  <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
                    {/* Rating */}
                    {document.rating && (
                      <div className="flex items-center text-xs text-[#6A994E] font-medium">
                        {getIcons("ThumbsUp", 14, "mr-1")}
                        <span>{document.rating.positive}%</span>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      className="flex items-center text-gray-500 hover:text-[#386641] text-xs font-bold transition-colors duration-200 px-4 py-2 border border-[#6A994E] rounded-lg bg-white cursor-pointer"
                      data-test-selector={`save-document-button-${document.id}`}
                      data-is-saved="false"
                    >
                      {getIcons("Bookmark", 14, "mr-1")}
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/*   Viewed Section*/}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-800 mb-10">
            Recently Viewed
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {recentCourses.map(course => (
              <div key={course.id} className="group">
                {/* Main Course Link */}
                <a
                  href={`/course/${course.id}`}
                  className="block bg-white border border-gray-200 hover:border-[#6A994E] hover:shadow-lg transition-all duration-100 rounded-xl overflow-hidden h-60"
                >
                  {/* Top Section - Icon & Title */}
                  <div className="p-6">
                    <div className="flex flex-col items-start">
                      {/* Course Icon */}
                      <div className='flex flex-row items-center'>
                        <div className="mb-4">
                          <div className="w-12 h-12 bg-[#6A994E] flex items-center justify-center rounded-lg group-hover:bg-[#386641] transition-colors duration-100">
                            {getIcons("Folder", 24, "text-white")}
                          </div>
                        </div>

                        {/* Bottom Section - Follow Button */}
                        <div className="px-6 pb-6">
                          <button
                            type="button"
                            className="w-full py-3 px-4 bg-gray-50 text-gray-700 hover:bg-[#6A994E] hover:text-white text-sm font-semibold transition-all duration-200 flex justify-center items-center group/btn border border-gray-200 hover:border-[#6A994E] rounded-lg cursor-pointer"
                          >
                            {getIcons("Plus", 16, "mr-2 group-hover/btn:rotate-90 transition-transform duration-100")}
                            <span>Follow</span>
                          </button>
                        </div>
                      </div>



                      {/* Course Title */}
                      <div className="w-full">
                        <h3 className="font-semibold text-gray-800 text-base line-clamp-1  group-hover:text-[#386641] transition-colors leading-tight">
                          {course.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                  {/* Middle Section - Meta Info */}
                  <div className="px-6 pb-4">
                    <div className="space-y-3">
                      {/* Course Code */}
                      {course.code && (
                        <div className="flex items-center">
                          {getIcons("Tag", 14, "mr-3 text-gray-400")}
                          <span className="text-sm text-gray-600 font-medium truncate">
                            {course.code}
                          </span>
                        </div>
                      )}

                      {/* Institution */}
                      {course.institution && (
                        <div className="flex items-center">
                          {getIcons("Building", 14, "mr-3 text-gray-400")}
                          <span className="text-sm text-gray-600 truncate">
                            {course.institution}
                          </span>
                        </div>
                      )}

                      {/* Document Count */}
                      <div className="flex items-center">
                        {getIcons("FileText", 14, "mr-3 text-gray-400")}
                        <span className="text-sm text-gray-600 font-medium">
                          {course.documentCount} documents
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </section>
        {/*  Call-to-Action Section */}
        <section className="bg-white border border-gray-200 relative overflow-hidden rounded-2xl shadow-lg">
          <div className="p-16 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Discover More Courses
            </h2>
            <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Expand your knowledge with our comprehensive course library and join thousands of learners
            </p>

            <button className="bg-[#386641] text-white px-12 py-5 font-semibold text-xl hover:bg-[#2d4f31] transition-colors duration-100 group rounded-xl shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-center">
                {getIcons("Plus", 22, "mr-4 group-hover:rotate-90 transition-transform duration-200")}
                Explore Courses
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
