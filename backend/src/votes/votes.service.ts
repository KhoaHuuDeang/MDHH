import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { 
  VoteType, 
  VoteDataDto, 
  VoteResultDto, 
  BulkVoteDataDto,
  VoteResourceRequestDto,
  VoteFolderRequestDto,
  GetMultipleResourceVotesRequestDto
} from './votes.dto';

@Injectable()
export class VotesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vote for a resource (file)
   */
  async voteResource(userId: string, dto: VoteResourceRequestDto): Promise<VoteResultDto> {
    // Validate resource exists
    const resource = await this.prisma.resources.findUnique({
      where: { id: dto.resourceId },
      select: { id: true, visibility: true }
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${dto.resourceId} not found`);
    }

    if (resource.visibility !== 'PUBLIC') {
      throw new BadRequestException('Can only vote on public resources');
    }

    const voteValue = dto.voteType === VoteType.UP ? 1 : -1;

    try {
      // Check if user already voted on this resource
      const existingVote = await this.prisma.ratings.findFirst({
        where: {
          user_id: userId,
          ratings_resources: {
            some: {
              resource_id: dto.resourceId
            }
          }
        },
        include: {
          ratings_resources: {
            where: { resource_id: dto.resourceId }
          }
        }
      });

      if (existingVote) {
        // User already voted - update or remove vote
        if (existingVote.value === voteValue) {
          // Same vote - remove it (toggle off)
          await this.prisma.ratings.delete({
            where: { id: existingVote.id }
          });
        } else {
          // Different vote - update it
          await this.prisma.ratings.update({
            where: { id: existingVote.id },
            data: { 
              value: voteValue,
              rated_at: new Date()
            }
          });
        }
      } else {
        // New vote - create it
        await this.prisma.ratings.create({
          data: {
            user_id: userId,
            value: voteValue,
            rated_at: new Date(),
            ratings_resources: {
              create: {
                resource_id: dto.resourceId
              }
            }
          }
        });
      }

      // Get updated vote counts and user's current vote
      const voteData = await this.getResourceVotes(dto.resourceId, userId);

      return {
        success: true,
        voteData,
        message: dto.voteType === VoteType.UP ? 'Upvoted successfully' : 'Downvoted successfully'
      };

    } catch (error) {
      console.error('Error voting on resource:', error);
      throw new BadRequestException('Failed to vote on resource');
    }
  }

  /**
   * Get vote statistics for a resource
   */
  async getResourceVotes(resourceId: string, userId?: string): Promise<VoteDataDto> {
    // Validate resource exists
    const resource = await this.prisma.resources.findUnique({
      where: { id: resourceId },
      select: { id: true }
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID ${resourceId} not found`);
    }

    // Get vote counts using aggregation
    const [upvoteCount, downvoteCount, userVote] = await Promise.all([
      // Count upvotes (value = 1)
      this.prisma.ratings.count({
        where: {
          value: 1,
          ratings_resources: {
            some: { resource_id: resourceId }
          }
        }
      }),

      // Count downvotes (value = -1)  
      this.prisma.ratings.count({
        where: {
          value: -1,
          ratings_resources: {
            some: { resource_id: resourceId }
          }
        }
      }),

      // Get user's vote if userId provided
      userId ? this.prisma.ratings.findFirst({
        where: {
          user_id: userId,
          ratings_resources: {
            some: { resource_id: resourceId }
          }
        },
        select: { value: true }
      }) : null
    ]);

    // Determine user's vote status
    let userVoteStatus: VoteType | null = null;
    if (userVote) {
      userVoteStatus = userVote.value === 1 ? VoteType.UP : userVote.value === -1 ? VoteType.DOWN : null;
    }

    return {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      userVote: userVoteStatus
    };
  }

  /**
   * Get vote statistics for multiple resources (for homepage/lists)
   */
  async getMultipleResourceVotes(dto: GetMultipleResourceVotesRequestDto, userId?: string): Promise<BulkVoteDataDto> {
    if (dto.resourceIds.length === 0) {
      return { votes: {} };
    }

    // Get all votes for these resources
    const votes = await this.prisma.ratings.findMany({
      where: {
        ratings_resources: {
          some: {
            resource_id: { in: dto.resourceIds }
          }
        }
      },
      select: {
        id: true,
        user_id: true,
        value: true,
        ratings_resources: {
          select: { resource_id: true }
        }
      }
    });

    // Process votes into grouped data
    const voteMap: Record<string, VoteDataDto> = {};
    
    // Initialize all resources with zero votes
    dto.resourceIds.forEach(resourceId => {
      voteMap[resourceId] = {
        upvotes: 0,
        downvotes: 0,
        userVote: null
      };
    });

    // Count votes for each resource
    votes.forEach(vote => {
      const resourceId = vote.ratings_resources[0]?.resource_id;
      if (!resourceId) return;

      const voteData = voteMap[resourceId];
      if (!voteData) return;

      // Count upvotes/downvotes
      if (vote.value === 1) {
        voteData.upvotes++;
      } else if (vote.value === -1) {
        voteData.downvotes++;
      }

      // Set user's vote status
      if (userId && vote.user_id === userId) {
        voteData.userVote = vote.value === 1 ? VoteType.UP : vote.value === -1 ? VoteType.DOWN : null;
      }
    });

    return { votes: voteMap };
  }

  /**
   * Vote for a folder 
   */
  async voteFolder(userId: string, dto: VoteFolderRequestDto): Promise<VoteResultDto> {
    // Validate folder exists
    const folder = await this.prisma.folders.findUnique({
      where: { id: dto.folderId },
      select: { id: true, visibility: true }
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${dto.folderId} not found`);
    }

    if (folder.visibility !== 'PUBLIC') {
      throw new BadRequestException('Can only vote on public folders');
    }

    const voteValue = dto.voteType === VoteType.UP ? 1 : -1;

    try {
      // Check if user already voted on this folder
      const existingVote = await this.prisma.ratings.findFirst({
        where: {
          user_id: userId,
          ratings_folders: {
            some: {
              folder_id: dto.folderId
            }
          }
        }
      });

      if (existingVote) {
        // User already voted - update or remove vote
        if (existingVote.value === voteValue) {
          // Same vote - remove it (toggle off)
          await this.prisma.ratings.delete({
            where: { id: existingVote.id }
          });
        } else {
          // Different vote - update it
          await this.prisma.ratings.update({
            where: { id: existingVote.id },
            data: { 
              value: voteValue,
              rated_at: new Date()
            }
          });
        }
      } else {
        // New vote - create it
        await this.prisma.ratings.create({
          data: {
            user_id: userId,
            value: voteValue,
            rated_at: new Date(),
            ratings_folders: {
              create: {
                folder_id: dto.folderId
              }
            }
          }
        });
      }

      // Get updated vote counts
      const voteData = await this.getFolderVotes(dto.folderId, userId);

      return {
        success: true,
        voteData,
        message: dto.voteType === VoteType.UP ? 'Folder upvoted successfully' : 'Folder downvoted successfully'
      };

    } catch (error) {
      console.error('Error voting on folder:', error);
      throw new BadRequestException('Failed to vote on folder');
    }
  }

  /**
   * Get vote statistics for a folder
   */
  async getFolderVotes(folderId: string, userId?: string): Promise<VoteDataDto> {
    // Validate folder exists
    const folder = await this.prisma.folders.findUnique({
      where: { id: folderId },
      select: { id: true }
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${folderId} not found`);
    }

    // Get vote counts
    const [upvoteCount, downvoteCount, userVote] = await Promise.all([
      // Count upvotes (value = 1)
      this.prisma.ratings.count({
        where: {
          value: 1,
          ratings_folders: {
            some: { folder_id: folderId }
          }
        }
      }),

      // Count downvotes (value = -1)
      this.prisma.ratings.count({
        where: {
          value: -1,
          ratings_folders: {
            some: { folder_id: folderId }
          }
        }
      }),

      // Get user's vote if userId provided
      userId ? this.prisma.ratings.findFirst({
        where: {
          user_id: userId,
          ratings_folders: {
            some: { folder_id: folderId }
          }
        },
        select: { value: true }
      }) : null
    ]);

    // Determine user's vote status
    let userVoteStatus: VoteType | null = null;
    if (userVote) {
      userVoteStatus = userVote.value === 1 ? VoteType.UP : userVote.value === -1 ? VoteType.DOWN : null;
    }

    return {
      upvotes: upvoteCount,
      downvotes: downvoteCount,
      userVote: userVoteStatus
    };
  }
}