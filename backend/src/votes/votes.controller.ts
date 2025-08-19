import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam,
  ApiQuery
} from '@nestjs/swagger';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  VoteResourceDto,
  VoteFolderDto,
  VoteResultDto,
  VoteDataDto,
  BulkVoteDataDto,
  GetVotesQueryDto,
  BulkVotesQueryDto,
  VoteResourceRequestDto,
  VoteFolderRequestDto
} from './votes.dto';

@ApiTags('Votes')
@Controller('votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  // === RESOURCE VOTING ENDPOINTS ===

  @Post('resources/:resourceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Vote on a resource (file)',
    description: 'Cast an upvote or downvote on a public resource. Voting again with the same type will remove the vote (toggle).'
  })
  @ApiParam({
    name: 'resourceId',
    description: 'ID of the resource to vote on',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Vote cast successfully',
    type: VoteResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid vote type or resource not public'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required'
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found'
  })
  async voteResource(
    @Param('resourceId') resourceId: string,
    @Body() voteDto: VoteResourceDto,
    @Request() req: any
  ): Promise<VoteResultDto> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    const requestDto: VoteResourceRequestDto = {
      resourceId,
      voteType: voteDto.voteType
    };

    return this.votesService.voteResource(userId, requestDto);
  }

  @Get('resources/:resourceId')
  @ApiOperation({ 
    summary: 'Get vote statistics for a resource',
    description: 'Retrieve upvote/downvote counts for a resource. Include user vote status if authenticated.'
  })
  @ApiParam({
    name: 'resourceId',
    description: 'ID of the resource to get votes for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'includeUserVote',
    required: false,
    description: 'Include current user vote status (requires authentication)',
    example: 'true'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Vote statistics retrieved successfully',
    type: VoteDataDto
  })
  @ApiResponse({
    status: 404,
    description: 'Resource not found'
  })
  async getResourceVotes(
    @Param('resourceId') resourceId: string,
    @Query() query: GetVotesQueryDto,
    @Request() req?: any
  ): Promise<VoteDataDto> {
    // Get userId if user is authenticated and wants user vote status
    let userId: string | undefined;
    if (query.includeUserVote === 'true' && req?.user) {
      userId = req.user?.sub || req.user?.id;
    }

    return this.votesService.getResourceVotes(resourceId, userId);
  }

  // === FOLDER VOTING ENDPOINTS ===

  @Post('folders/:folderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Vote on a folder',
    description: 'Cast an upvote or downvote on a public folder. Voting again with the same type will remove the vote (toggle).'
  })
  @ApiParam({
    name: 'folderId',
    description: 'ID of the folder to vote on',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Vote cast successfully',
    type: VoteResultDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid vote type or folder not public'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - authentication required'
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found'
  })
  async voteFolder(
    @Param('folderId') folderId: string,
    @Body() voteDto: VoteFolderDto,
    @Request() req: any
  ): Promise<VoteResultDto> {
    const userId = req.user?.sub || req.user?.id;
    if (!userId) {
      throw new BadRequestException('User ID not found in token');
    }

    const requestDto: VoteFolderRequestDto = {
      folderId,
      voteType: voteDto.voteType
    };

    return this.votesService.voteFolder(userId, requestDto);
  }

  @Get('folders/:folderId')
  @ApiOperation({ 
    summary: 'Get vote statistics for a folder',
    description: 'Retrieve upvote/downvote counts for a folder. Include user vote status if authenticated.'
  })
  @ApiParam({
    name: 'folderId',
    description: 'ID of the folder to get votes for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiQuery({
    name: 'includeUserVote',
    required: false,
    description: 'Include current user vote status (requires authentication)',
    example: 'true'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Vote statistics retrieved successfully',
    type: VoteDataDto
  })
  @ApiResponse({
    status: 404,
    description: 'Folder not found'
  })
  async getFolderVotes(
    @Param('folderId') folderId: string,
    @Query() query: GetVotesQueryDto,
    @Request() req?: any
  ): Promise<VoteDataDto> {
    // Get userId if user is authenticated and wants user vote status
    let userId: string | undefined;
    if (query.includeUserVote === 'true' && req?.user) {
      userId = req.user?.sub || req.user?.id;
    }

    return this.votesService.getFolderVotes(folderId, userId);
  }

  // === BULK OPERATIONS ===

  @Get('resources/bulk')
  @ApiOperation({ 
    summary: 'Get vote statistics for multiple resources',
    description: 'Retrieve upvote/downvote counts for multiple resources at once. Useful for homepage/list views.'
  })
  @ApiQuery({
    name: 'resourceIds',
    description: 'Comma-separated list of resource IDs',
    example: 'id1,id2,id3'
  })
  @ApiQuery({
    name: 'includeUserVote',
    required: false,
    description: 'Include current user vote status (requires authentication)',
    example: 'true'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Bulk vote statistics retrieved successfully',
    type: BulkVoteDataDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid resource IDs format'
  })
  async getBulkResourceVotes(
    @Query() query: BulkVotesQueryDto,
    @Request() req?: any
  ): Promise<BulkVoteDataDto> {
    // Parse comma-separated resource IDs
    const resourceIds = query.resourceIds.split(',').map(id => id.trim()).filter(id => id.length > 0);
    
    if (resourceIds.length === 0) {
      throw new BadRequestException('At least one resource ID is required');
    }

    if (resourceIds.length > 50) {
      throw new BadRequestException('Maximum 50 resource IDs allowed per request');
    }

    // Get userId if user is authenticated and wants user vote status
    let userId: string | undefined;
    if (query.includeUserVote === 'true' && req?.user) {
      userId = req.user?.sub || req.user?.id;
    }

    const requestDto = {
      resourceIds,
      includeUserVote: query.includeUserVote
    };

    return this.votesService.getMultipleResourceVotes(requestDto, userId);
  }
}