import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export enum VoteType {
  UP = 'up',
  DOWN = 'down'
}

export class VoteResourceDto {
  @ApiProperty({
    description: 'Type of vote',
    enum: VoteType,
    example: VoteType.UP
  })
  @IsEnum(VoteType)
  @IsNotEmpty()
  voteType: VoteType;
}

export class VoteFolderDto {
  @ApiProperty({
    description: 'Type of vote',
    enum: VoteType,
    example: VoteType.UP
  })
  @IsEnum(VoteType)
  @IsNotEmpty()
  voteType: VoteType;
}

export class VoteDataDto {
  @ApiProperty({
    description: 'Number of upvotes',
    example: 15,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  upvotes: number;

  @ApiProperty({
    description: 'Number of downvotes',
    example: 3,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  downvotes: number;

  @ApiProperty({
    description: 'Current user vote status',
    enum: [...Object.values(VoteType), null],
    example: VoteType.UP,
    required: false
  })
  @IsOptional()
  @IsEnum(VoteType)
  userVote: VoteType | null;
}

export class VoteResultDto {
  @ApiProperty({
    description: 'Operation success status',
    example: true
  })
  success: boolean;

  @ApiProperty({
    description: 'Updated vote data',
    type: VoteDataDto
  })
  voteData: VoteDataDto;

  @ApiProperty({
    description: 'Success message',
    example: 'Upvoted successfully',
    required: false
  })
  @IsOptional()
  @IsString()
  message?: string;
}

export class GetVotesQueryDto {
  @ApiProperty({
    description: 'Include user vote status (requires authentication)',
    example: 'true',
    required: false
  })
  @IsOptional()
  @IsString()
  includeUserVote?: string;
}

export class BulkVoteDataDto {
  @ApiProperty({
    description: 'Map of resource IDs to their vote data',
    type: 'object',
    additionalProperties: {
      type: 'object',
      $ref: '#/components/schemas/VoteDataDto'
    },
    example: {
      'resource-id-1': {
        upvotes: 15,
        downvotes: 3,
        userVote: 'up'
      },
      'resource-id-2': {
        upvotes: 8,
        downvotes: 1,
        userVote: null
      }
    }
  })
  votes: Record<string, VoteDataDto>;
}

export class BulkVotesQueryDto {
  @ApiProperty({
    description: 'Comma-separated list of resource IDs',
    example: 'resource-id-1,resource-id-2,resource-id-3'
  })
  @IsString()
  @IsNotEmpty()
  resourceIds: string;

  @ApiProperty({
    description: 'Include user vote status (requires authentication)',
    example: 'true',
    required: false
  })
  @IsOptional()
  @IsString()
  includeUserVote?: string;
}

// DTO cho hàm voteResource (userId, resourceId, voteType)
export class VoteResourceRequestDto {
  @ApiProperty({
    description: 'Resource ID to vote on',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  resourceId: string;

  @ApiProperty({
    description: 'Type of vote',
    enum: VoteType,
    example: VoteType.UP
  })
  @IsEnum(VoteType)
  @IsNotEmpty()
  voteType: VoteType;
}

// DTO cho hàm voteFolder (userId, folderId, voteType) 
export class VoteFolderRequestDto {
  @ApiProperty({
    description: 'Folder ID to vote on',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsString()
  @IsNotEmpty()
  folderId: string;

  @ApiProperty({
    description: 'Type of vote',
    enum: VoteType,
    example: VoteType.UP
  })
  @IsEnum(VoteType)
  @IsNotEmpty()
  voteType: VoteType;
}

// DTO cho hàm getMultipleResourceVotes (resourceIds[], userId?)
export class GetMultipleResourceVotesRequestDto {
  @ApiProperty({
    description: 'Array of resource IDs to get votes for',
    type: [String],
    example: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001']
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  resourceIds: string[];

  @ApiProperty({
    description: 'Include user vote status (requires authentication)',
    example: 'true',
    required: false
  })
  @IsOptional()
  @IsString()
  includeUserVote?: string;
}