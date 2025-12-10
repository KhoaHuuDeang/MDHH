"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Book,
  Brain,
  Pencil,
  ChevronLeft,
  ChevronRight,
  FileX,
  TrendingDown,
  FolderX,
  Plus,
  LucideIcon,
} from "lucide-react";
import useNotifications from "@/hooks/useNotifications";

import SearchSection from "@/components/homepage/SearchSection";
import FileCard from "@/components/homepage/FileCard";
import FolderCard from "@/components/homepage/FolderCard";
import useHomepageData from "@/hooks/useHomepageData";
import { FilterChangeParams } from "@/components/homepage/CategoryFilter";
import {
  homepageService,
  SearchFilesParams,
  FileData,
} from "@/services/homepageService";

// 2. Định nghĩa Types rõ ràng
interface QuickAction {
  id: number;
  title: string;
  icon: LucideIcon; // Lưu component icon trực tiếp thay vì string name
  colorClass: string;
}

// 3. Di chuyển dữ liệu tĩnh ra ngoài component (Tránh khởi tạo lại bộ nhớ)

// 4. Component con tách biệt để cô lập render
const QuickActionCard = React.memo(({ action }: { action: QuickAction }) => {
  const Icon = action.icon;

  return (
    <button
      className="group relative h-24 w-full rounded-xl border border-gray-200 bg-white p-8 flex items-center cursor-pointer
                 hover:shadow-lg
                 transition-shadow duration-300 ease-out" // Chỉ animate shadow, nhẹ cho CPU
    >
      {/* Icon Container */}
      <div
        className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50
                      group-hover:bg-[#6A994E]/10
                      transition-colors duration-300 ease-in-out"
      >
        {" "}
        {/* Chỉ animate color */}
        <Icon
          size={24}
          className={`${action.colorClass} group-hover:text-[#386641] transition-colors duration-300`}
        />
      </div>

      {/* Title */}
      <span
        className="ml-6 text-xl font-semibold text-gray-700
                       group-hover:text-[#386641]
                       transition-colors duration-300"
      >
        {action.title}
      </span>

      {/* Border Bottom Animation
          Sử dụng scale-x (GPU) thay vì width (CPU) để không gây reflow layout */}
      <div
        className="absolute bottom-0 left-0 h-1 w-full rounded-b-xl bg-[#6A994E]
                      origin-left scale-x-0 opacity-0
                      group-hover:scale-x-100 group-hover:opacity-100
                      transition-transform duration-300 ease-out
                      will-change-transform" // Gợi ý trình duyệt tối ưu
      />

      {/* Border Color Fake (Để tránh animate border-color gây paint lại toàn bộ box) */}
      <div
        className="absolute inset-0 rounded-xl border border-transparent
                      group-hover:border-[#6A994E] pointer-events-none
                      transition-colors duration-300"
      />
    </button>
  );
});
QuickActionCard.displayName = "QuickActionCard";

// Skeleton nhẹ nhàng hơn
const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[...Array(4)].map((_, i) => (
      <div
        key={i}
        className="overflow-hidden rounded-lg border border-gray-200 bg-white"
      >
        <div className="h-48 bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-2">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-gray-200 animate-pulse" />
          <div className="h-3 w-1/2 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

import { useTranslation } from "react-i18next";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useNotifications();
  const { data: homepageData, isLoading, error } = useHomepageData();

  // Search/filter state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterParams, setFilterParams] = useState<FilterChangeParams | null>(
    null
  );
  const [searchResults, setSearchResults] = useState<FileData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Load more state
  const [recentCount, setRecentCount] = useState(4);
  const [popularCount, setPopularCount] = useState(4);
  const [folderCount, setFolderCount] = useState(5);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Dynamic homepage data
  const [dynamicHomepageData, setDynamicHomepageData] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth");
  }, [status, router]);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized") {
      toast.error("Access denied. Admin privileges required.");
    }
  }, [searchParams, toast]);

  // Fetch homepage data with custom limits
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const response = await homepageService.getHomepageData(
          recentCount,
          popularCount,
          folderCount
        );
        setDynamicHomepageData(response);
      } catch (err) {
        console.error("Error fetching homepage data:", err);
      }
    };

    if (recentCount > 4 || popularCount > 4 || folderCount > 5) {
      setIsLoadingMore(true);
      fetchHomepageData().finally(() => setIsLoadingMore(false));
    } else {
      setDynamicHomepageData(homepageData);
    }
  }, [recentCount, popularCount, folderCount, homepageData]);

  // Unified search/filter handler
  const performSearch = useCallback(
    async (query: string, filters: FilterChangeParams | null) => {
      // Check if user has intentionally applied filters (even if "All Classifications")
      // filters will be non-null when user clicks "Apply Filters" button
      const hasQuery = query.trim().length > 0;
      const hasFiltersApplied = filters !== null;

      // If no query and no filters applied, reset to homepage data
      if (!hasQuery && !hasFiltersApplied) {
        setHasSearched(false);
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const params: SearchFilesParams = {
          query: query.trim() || undefined,
          // Only send classificationLevelId if it's not empty string
          classificationLevelId:
            filters?.classificationLevelId &&
            filters.classificationLevelId.trim() !== ""
              ? filters.classificationLevelId
              : undefined,
          tags: filters?.selectedTags.length
            ? filters.selectedTags.join(",")
            : undefined,
          page: 1,
          limit: 20,
        };

        const response = await homepageService.searchFiles(params);

        // Follow message/status/result pattern
        if (response.status === 200) {
          setSearchResults(response.result.files);
        } else {
          console.error("Search failed:", response.message);
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error during search:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      performSearch(query, filterParams);
    },
    [filterParams, performSearch]
  );

  const handleFilterChange = useCallback(
    (filters: FilterChangeParams) => {
      setFilterParams(filters);
      performSearch(searchQuery, filters);
    },
    [searchQuery, performSearch]
  );

  // Destructuring an toàn với default values
  const {
    recentFiles = [],
    popularFiles = [],
    folders = [],
  } = dynamicHomepageData || homepageData || {};

  // Determine which files to display
  const displayFiles = hasSearched ? searchResults : recentFiles;

  // Loading State
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#386641]" />
        </div>
      </div>
    );
  }

  if (!session?.user?.id) return null;

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">
            Không thể tải dữ liệu
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-[#386641] px-6 py-3 text-white transition-colors hover:bg-[#2d4f31]"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <SearchSection
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {/* Recent Files / Search Results */}
        <SectionHeader
          title={hasSearched ? "Kết quả tìm kiếm" : "Tệp gần đây"}
          hasNav={!hasSearched}
        />
        <ContentGrid
          isLoading={isSearching || (isLoading && !dynamicHomepageData)}
          isEmpty={displayFiles.length === 0}
          icon={FileX}
          emptyText={
            hasSearched
              ? "No files found matching your search"
              : "No recent files found"
          }
        >
          {displayFiles.map((file: any) => (
            <FileCard key={file.id} file={file} onView={() => {}} />
          ))}
        </ContentGrid>

        {/* Load More Recent Files */}
        {!hasSearched && recentFiles.length === recentCount && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setRecentCount(recentCount + 4)}
              disabled={isLoadingMore}
              className="rounded-lg bg-[#386641] px-8 py-3 text-white transition-colors hover:bg-[#2d4f31] disabled:opacity-50"
            >
              {isLoadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}

        {/* Popular Files - Hide when searching */}
        {!hasSearched && (
          <div className="mt-20">
            <SectionHeader title="Được tải nhiều nhất" />
            <ContentGrid
              isLoading={isLoading && !dynamicHomepageData}
              isEmpty={popularFiles.length === 0}
              icon={TrendingDown}
              emptyText="Không tìm thấy tệp phổ biến"
            >
              {popularFiles.map((file: any) => (
                <FileCard key={file.id} file={file} onView={() => {}} />
              ))}
            </ContentGrid>

            {/* Load More Popular Files */}
            {popularFiles.length === popularCount && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setPopularCount(popularCount + 4)}
                  disabled={isLoadingMore}
                  className="rounded-lg bg-[#386641] px-8 py-3 text-white transition-colors hover:bg-[#2d4f31] disabled:opacity-50"
                >
                  {isLoadingMore ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Popular Folders - Hide when searching */}
        {!hasSearched && (
          <div className="mt-20">
            <h2 className="mb-10 text-4xl font-bold text-gray-800">
              Thư mục phổ biến
            </h2>
            {isLoading && !dynamicHomepageData ? (
              /* Skeleton Folders */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-60 rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : folders.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {folders.map((folder: any) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onView={() => {}}
                    />
                  ))}
                </div>

                {/* Load More Folders */}
                {folders.length === folderCount && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setFolderCount(folderCount + 5)}
                      disabled={isLoadingMore}
                      className="rounded-lg bg-[#386641] px-8 py-3 text-white transition-colors hover:bg-[#2d4f31] disabled:opacity-50"
                    >
                      {isLoadingMore ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={FolderX}
                text="Không tìm thấy thư mục phổ biến"
              />
            )}
          </div>
        )}

        {/* CTA Section */}
        <section className="relative mt-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="p-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-800">
              Khám phá thêm các khóa học
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600">
              Mở rộng kiến thức của bạn với tài liệu học tập phong phú của
              website
            </p>
            <button className="group inline-flex items-center justify-center rounded-xl bg-[#386641] px-12 py-5 text-xl font-semibold text-white shadow-lg transition-all hover:bg-[#2d4f31] hover:shadow-xl">
              <Plus
                size={22}
                className="mr-4 transition-transform duration-300 group-hover:rotate-90"
              />
              Khám phá các khóa học
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

// Sub-components để code gọn hơn
const SectionHeader = ({
  title,
  hasNav,
}: {
  title: string;
  hasNav?: boolean;
}) => (
  <div className="mb-6 flex items-center justify-between">
    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    {hasNav && (
      <div className="flex space-x-2">
        <button className="rounded-md border border-gray-200 bg-gray-100 p-2 text-gray-600 transition-colors hover:bg-[#6A994E] hover:text-white">
          <ChevronLeft size={20} />
        </button>
        <button className="rounded-md border border-[#6A994E] bg-[#6A994E] p-2 text-white transition-colors hover:bg-[#386641]">
          <ChevronRight size={20} />
        </button>
      </div>
    )}
  </div>
);

const EmptyState = ({ icon: Icon, text }: { icon: any; text: string }) => (
  <div className="py-12 text-center">
    <div className="mb-4 inline-flex text-gray-400">
      <Icon size={48} />
    </div>
    <p className="text-gray-600">{text}</p>
  </div>
);

const ContentGrid = ({
  isLoading,
  isEmpty,
  children,
  icon,
  emptyText,
}: any) => {
  if (isLoading) return <LoadingSkeleton />;
  if (isEmpty) return <EmptyState icon={icon} text={emptyText} />;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
};
