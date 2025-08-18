"use client";

import React, { useCallback, useMemo } from 'react';
import * as lucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import SearchSection from '@/components/homepage/SearchSection';
import FileCard from '@/components/homepage/FileCard';
import FolderCard from '@/components/homepage/FolderCard';
import useHomepageData from '@/hooks/useHomepageData';
import useFileSearch from '@/hooks/useFileSearch';

const getIcons = (iconName: string, size: number, className?: string) => {
  const IconComponent = lucideIcons[iconName as keyof typeof lucideIcons] as LucideIcon;
  return IconComponent ? <IconComponent className={className} size={size} /> : null;
};
const getActionIcon = (id: number) => {
  switch (id) {
    case 1: return "Book";
    case 2: return "Brain";
    case 3: return "Pencil";
    default: return "Zap";
  }
};

// Quick action cards data with enhanced designs - Memoized for performance
const quickActions = [
  {
    id: 1,
    title: "Create a quiz",
    icon: "Book"
  },
  {
    id: 2,
    title: "Ask a Question",
    icon: "Brain"
  },
  {
    id: 3,
    title: "Summarize your notes",
    icon: "Pencil"
  }
] as const;
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

// Memoized QuickActionCard component for performance
const QuickActionCard = React.memo(({ action }: { action: typeof quickActions[number] }) => (
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
    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#6A994E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-b-xl"></div>
  </button>
));

QuickActionCard.displayName = 'QuickActionCard';

// Loading skeleton component
const LoadingSkeleton = React.memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded mb-2 w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

export default function HomePage() {
  // Hooks for data fetching
  const { data: homepageData, isLoading, error } = useHomepageData();
  const { query, setQuery } = useFileSearch();

  // Memoized handlers for performance
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);
    console.log("Searching for:", searchQuery);
  }, [setQuery]);

  const handleCategoryChange = useCallback((category: string) => {
    console.log("Category changed to:", category);
  }, []);

  const handleFileView = useCallback((fileId: string) => {
    console.log("Viewing file:", fileId);
    // Navigate to file detail page
  }, []);

  const handleFolderView = useCallback((folderId: string) => {
    console.log("Viewing folder:", folderId);
    // Navigate to folder page
  }, []);

  // Memoized data for performance
  const { recentFiles, popularFiles, folders } = useMemo(() => {
    return {
      recentFiles: homepageData?.recentFiles || [],
      popularFiles: homepageData?.popularFiles || [],
      folders: homepageData?.folders || []
    };
  }, [homepageData]);

  // Memoized quick actions to prevent recreation
  const memoizedQuickActions = useMemo(() => quickActions, []);

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">We couldn't load the homepage data. Please try refreshing the page.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#386641] text-white px-6 py-3 rounded-lg hover:bg-[#2d4f31] transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 md:px-8 py-8'>
        {/* Search Section */}
        <SearchSection 
          onSearch={handleSearch}
          onCategoryChange={handleCategoryChange}
        />
        {/* Quick Actions Section */}
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {memoizedQuickActions.map(action => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </section>
        {/* Recent Files Section */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Recent Files
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

          {isLoading ? (
            <LoadingSkeleton />
          ) : recentFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recentFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onView={handleFileView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {getIcons("FileX", 48)}
              </div>
              <p className="text-gray-600">No recent files found</p>
            </div>
          )}
        </section>

        {/* Popular Files Section */}
        <section className="mb-20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Most Downloaded
            </h2>
          </div>

          {isLoading ? (
            <LoadingSkeleton />
          ) : popularFiles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {popularFiles.map(file => (
                <FileCard 
                  key={file.id} 
                  file={file} 
                  onView={handleFileView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {getIcons("TrendingDown", 48)}
              </div>
              <p className="text-gray-600">No popular files found</p>
            </div>
          )}
        </section>
        {/* Popular Folders Section */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-gray-800 mb-10">
            Popular Folders
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl h-60 animate-pulse">
                  <div className="p-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : folders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {folders.map(folder => (
                <FolderCard 
                  key={folder.id} 
                  folder={folder} 
                  onView={handleFolderView}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                {getIcons("FolderX", 48)}
              </div>
              <p className="text-gray-600">No popular folders found</p>
            </div>
          )}
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
