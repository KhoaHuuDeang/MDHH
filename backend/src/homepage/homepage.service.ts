import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HomepageResponseDto, FileDataDto, FolderDataDto } from './dto/homepage.dto';

@Injectable()
export class HomepageService {
  constructor(private prisma: PrismaService) {}

  async getHomepageData(): Promise<HomepageResponseDto> {
    try {
      const [recentFiles, popularFiles, popularFolders] = await Promise.all([
        this.getRecentFiles(),
        this.getPopularFiles(),
        this.getPopularFolders()
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

  private async getRecentFiles(): Promise<FileDataDto[]> {
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
        f.name as "folderName"
      FROM resources r
      LEFT JOIN folder_files ff ON r.id = ff.resource_id
      LEFT JOIN folders f ON ff.folder_id = f.id  
      LEFT JOIN users u ON f.user_id = u.id
      LEFT JOIN uploads up ON r.id = up.resource_id AND up.status = 'COMPLETED'
      LEFT JOIN (
        SELECT resource_id, COUNT(*)::integer as download_count 
        FROM downloads 
        GROUP BY resource_id
      ) dc ON r.id = dc.resource_id
      WHERE r.visibility = 'PUBLIC'
      ORDER BY r.created_at DESC
      LIMIT 4
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
      return dto;
    });
  }

  private async getPopularFiles(): Promise<FileDataDto[]> {
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
        f.name as "folderName"
      FROM resources r
      LEFT JOIN folder_files ff ON r.id = ff.resource_id
      LEFT JOIN folders f ON ff.folder_id = f.id
      LEFT JOIN users u ON f.user_id = u.id  
      LEFT JOIN uploads up ON r.id = up.resource_id AND up.status = 'COMPLETED'
      INNER JOIN (
        SELECT resource_id, COUNT(*)::integer as download_count
        FROM downloads 
        GROUP BY resource_id
        HAVING COUNT(*) > 0
      ) dc ON r.id = dc.resource_id
      WHERE r.visibility = 'PUBLIC'
      ORDER BY dc.download_count DESC
      LIMIT 4
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
      return dto;
    });
  }

  private async getPopularFolders(): Promise<FolderDataDto[]> {
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        f.id,
        f.name,
        f.description,
        u.displayname as author,
        fc.follow_count::integer as "followCount"
      FROM folders f
      LEFT JOIN users u ON f.user_id = u.id
      INNER JOIN (
        SELECT folder_id, COUNT(*)::integer as follow_count
        FROM follows
        GROUP BY folder_id  
        HAVING COUNT(*) > 0
      ) fc ON f.id = fc.folder_id
      WHERE f.visibility = 'PUBLIC'
      ORDER BY fc.follow_count DESC
      LIMIT 5
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
}