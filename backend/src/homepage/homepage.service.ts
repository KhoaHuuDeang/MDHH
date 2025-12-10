import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomepageResponseDto, FileDataDto, FolderDataDto, SearchFilesQueryDto, SearchFilesResponseDto } from './dto/homepage.dto';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getHomepageData(recentLimit?: number, popularLimit?: number, folderLimit?: number): Promise<HomepageResponseDto> {
    try {
      const [recentFiles, popularFiles, popularFolders] = await Promise.all([
        this.getRecentFiles(recentLimit || 4),
        this.getPopularFiles(popularLimit || 4),
        this.getPopularFolders(folderLimit || 5)
      ]);

      const response = new HomepageResponseDto();
      response.recentFiles = recentFiles;
      response.popularFiles = popularFiles;
      response.folders = popularFolders;

      return response;
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      throw new InternalServerErrorException('Failed to fetch homepage data');
    }
  }

  private async getRecentFiles(limit: number = 4): Promise<FileDataDto[]> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        r.id,
        r.title,
        r.description,
        r.category,
        r.created_at as "createdAt",
        u.displayname as author,
        up.mime_type as "fileType",
        COALESCE(dc.download_count, 0)::integer as "downloadCount",
        f.name as "folderName",
        cl.name as "classificationLevel",
        COALESCE(
          json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM resources r
      LEFT JOIN folder_files ff ON r.id = ff.resource_id
      LEFT JOIN folders f ON ff.folder_id = f.id
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN classification_levels cl ON f.classification_level_id = cl.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      LEFT JOIN uploads up ON r.id = up.resource_id
        AND up.status = 'COMPLETED'
        AND up.moderation_status = 'APPROVED'
      LEFT JOIN (
        SELECT resource_id, COUNT(*)::integer as download_count
        FROM downloads
        GROUP BY resource_id
      ) dc ON r.id = dc.resource_id
      WHERE r.visibility = 'PUBLIC'
        AND up.id IS NOT NULL
      GROUP BY r.id, r.title, r.description, r.category, r.created_at,
               u.displayname, up.mime_type, dc.download_count, f.name, cl.name
      ORDER BY r.created_at DESC
      LIMIT ${limit}
    `;

    return result.map(row => {
      const dto = new FileDataDto();
      dto.id = row.id;
      dto.title = row.title || '';
      dto.description = row.description || '';
      dto.category = row.category || '';
      dto.author = row.author || 'Unknown';
      dto.createdAt = row.createdAt;
      dto.fileType = row.fileType || 'application/octet-stream';
      dto.downloadCount = Math.max(0, row.downloadCount || 0);
      dto.folderName = row.folderName || undefined;
      dto.classificationLevel = row.classificationLevel || undefined;
      dto.tags = Array.isArray(row.tags) && row.tags.length > 0 && row.tags[0] !== null 
        ? row.tags 
        : undefined;
      return dto;
    });
  }

  private async getPopularFiles(limit: number = 4): Promise<FileDataDto[]> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        r.id,
        r.title,
        r.description,
        r.category,
        r.created_at as "createdAt",
        u.displayname as author,
        up.mime_type as "fileType",
        dc.download_count::integer as "downloadCount",
        f.name as "folderName",
        cl.name as "classificationLevel",
        COALESCE(
          json_agg(DISTINCT t.name) FILTER (WHERE t.id IS NOT NULL),
          '[]'::json
        ) as tags
      FROM resources r
      LEFT JOIN folder_files ff ON r.id = ff.resource_id
      LEFT JOIN folders f ON ff.folder_id = f.id
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN classification_levels cl ON f.classification_level_id = cl.id
      LEFT JOIN resource_tags rt ON r.id = rt.resource_id
      LEFT JOIN tags t ON rt.tag_id = t.id
      LEFT JOIN uploads up ON r.id = up.resource_id
        AND up.status = 'COMPLETED'
        AND up.moderation_status = 'APPROVED'
      INNER JOIN (
        SELECT resource_id, COUNT(*)::integer as download_count
        FROM downloads
        GROUP BY resource_id
        HAVING COUNT(*) > 0
      ) dc ON r.id = dc.resource_id
      WHERE r.visibility = 'PUBLIC'
        AND up.id IS NOT NULL
      GROUP BY r.id, r.title, r.description, r.category, r.created_at,
               u.displayname, up.mime_type, dc.download_count, f.name, cl.name
      ORDER BY dc.download_count DESC
      LIMIT ${limit}
    `;

    return result.map(row => {
      const dto = new FileDataDto();
      dto.id = row.id;
      dto.title = row.title || '';
      dto.description = row.description || '';
      dto.category = row.category || '';
      dto.author = row.author || 'Unknown';
      dto.createdAt = row.createdAt;
      dto.fileType = row.fileType || 'application/octet-stream';
      dto.downloadCount = Math.max(0, row.downloadCount || 0);
      dto.folderName = row.folderName || undefined;
      dto.classificationLevel = row.classificationLevel || undefined;
      dto.tags = Array.isArray(row.tags) && row.tags.length > 0 && row.tags[0] !== null 
        ? row.tags 
        : undefined;
      return dto;
    });
  }

  private async getPopularFolders(limit: number = 5): Promise<FolderDataDto[]> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT
        f.id,
        f.name,
        f.description,
        u.displayname as author,
        fc.follow_count::integer as "followCount",
        COUNT(DISTINCT CASE
          WHEN up.moderation_status = 'APPROVED'
            AND up.status = 'COMPLETED'
          THEN r.id
        END)::integer as approved_file_count
      FROM folders f
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN folder_files ff ON f.id = ff.folder_id
      LEFT JOIN resources r ON ff.resource_id = r.id
      LEFT JOIN uploads up ON r.id = up.resource_id
      INNER JOIN (
        SELECT folder_id, COUNT(*)::integer as follow_count
        FROM follows
        GROUP BY folder_id
        HAVING COUNT(*) > 0
      ) fc ON f.id = fc.folder_id
      WHERE f.visibility = 'PUBLIC'
      GROUP BY f.id, f.name, f.description, u.displayname, fc.follow_count
      HAVING COUNT(DISTINCT CASE
        WHEN up.moderation_status = 'APPROVED'
          AND up.status = 'COMPLETED'
        THEN r.id
      END) > 0
      ORDER BY fc.follow_count DESC
      LIMIT ${limit}
    `;

    return result.map(row => {
      const dto = new FolderDataDto();
      dto.id = row.id;
      dto.name = row.name || '';
      dto.description = row.description || '';
      dto.author = row.author || 'Unknown';
      dto.followCount = Math.max(0, row.followCount || 0);
      return dto;
    });
  }


  async getPublicStats() {
    try {
      const stats = await this.prisma.$queryRaw<any[]>`
        SELECT 
          (SELECT COUNT(*)::int FROM "resources" WHERE visibility = 'PUBLIC') as "documents",
          (SELECT COUNT(*)::int FROM "users" WHERE is_disabled = false) as "users",
          (SELECT COUNT(*)::int FROM "downloads") as "downloads",
          (SELECT COUNT(*)::int FROM "comments" WHERE is_deleted = false) as "discussions"
      `;

      return stats[0];
    } catch (error) {
      console.error('Error fetching public stats:', error);
      throw new InternalServerErrorException('Failed to fetch public stats');
    }
  }

  async searchFiles(queryDto: SearchFilesQueryDto): Promise<SearchFilesResponseDto> {
    try {
      const page = queryDto.page || 1;
      const limit = queryDto.limit || 20;
      const offset = (page - 1) * limit;

      // Parse tag IDs from comma-separated string
      const tagIds = queryDto.tags ? queryDto.tags.split(',').filter(Boolean) : [];

      // Build dynamic WHERE conditions
      let whereConditions: string[] = [`r.visibility = 'PUBLIC'`];
      let joinConditions: string[] = [];

      // Add search query condition
      if (queryDto.query?.trim()) {
        whereConditions.push(`(
          r.title ILIKE '%' || $1 || '%' OR
          r.description ILIKE '%' || $1 || '%' OR
          r.category ILIKE '%' || $1 || '%'
        )`);
      }

      // Add classification level filter via folder
      if (queryDto.classificationLevelId) {
        whereConditions.push(`f.classification_level_id = $${queryDto.query ? 2 : 1}::uuid`);
      }

      // Add tag filter
      if (tagIds.length > 0) {
        joinConditions.push(`
          INNER JOIN resource_tags rt ON r.id = rt.resource_id
        `);
        const tagParamIndex = (queryDto.query ? 1 : 0) + (queryDto.classificationLevelId ? 1 : 0) + 1;
        whereConditions.push(`rt.tag_id = ANY($${tagParamIndex}::uuid[])`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const joinClause = joinConditions.join(' ');

      // Count total matching files
      const countQuery = `
        SELECT COUNT(DISTINCT r.id)::integer as total
        FROM resources r
        LEFT JOIN folder_files ff ON r.id = ff.resource_id
        LEFT JOIN folders f ON ff.folder_id = f.id
        LEFT JOIN uploads up ON r.id = up.resource_id 
          AND up.status = 'COMPLETED'
          AND up.moderation_status = 'APPROVED'
        ${joinClause}
        ${whereClause}
          AND up.id IS NOT NULL
      `;

      // Build params array dynamically
      const params: any[] = [];
      if (queryDto.query?.trim()) params.push(queryDto.query.trim());
      if (queryDto.classificationLevelId) params.push(queryDto.classificationLevelId);
      if (tagIds.length > 0) params.push(tagIds);

      const countResult = await this.prisma.$queryRawUnsafe<Array<{ total: number }>>(
        countQuery,
        ...params
      );
      const total = countResult[0]?.total || 0;

      // Fetch paginated results
      const searchQuery = `
        SELECT DISTINCT ON (r.id)
          r.id,
          r.title,
          r.description,
          r.category,
          r.created_at as "createdAt",
          u.displayname as author,
          up.mime_type as "fileType",
          COALESCE(dc.download_count, 0)::integer as "downloadCount",
          f.name as "folderName"
        FROM resources r
        LEFT JOIN folder_files ff ON r.id = ff.resource_id
        LEFT JOIN folders f ON ff.folder_id = f.id
        LEFT JOIN users u ON f.user_id = u.id
        LEFT JOIN uploads up ON r.id = up.resource_id 
          AND up.status = 'COMPLETED'
          AND up.moderation_status = 'APPROVED'
        LEFT JOIN (
          SELECT resource_id, COUNT(*)::integer as download_count
          FROM downloads
          GROUP BY resource_id
        ) dc ON r.id = dc.resource_id
        ${joinClause}
        ${whereClause}
          AND up.id IS NOT NULL
        ORDER BY r.id, r.created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const result = await this.prisma.$queryRawUnsafe<any[]>(
        searchQuery,
        ...params
      );

      const files = result.map(row => {
        const dto = new FileDataDto();
        dto.id = row.id;
        dto.title = row.title || '';
        dto.description = row.description || '';
        dto.category = row.category || '';
        dto.author = row.author || 'Unknown';
        dto.createdAt = row.createdAt;
        dto.fileType = row.fileType || 'application/octet-stream';
        dto.downloadCount = Math.max(0, row.downloadCount || 0);
        dto.folderName = row.folderName || undefined;
        return dto;
      });

      const hasMore = offset + files.length < total;

      return {
        message: 'Search completed successfully',
        status: 200,
        result: {
          files,
          total,
          hasMore,
          page,
          limit
        }
      };
    } catch (error) {
      console.error('Error searching files:', error);
      throw new InternalServerErrorException('Failed to search files');
    }
  }
}