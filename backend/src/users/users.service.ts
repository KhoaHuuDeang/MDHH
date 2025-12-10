import {  BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto,CreateUserDto } from './user.dto';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }
  async findAll() {
    return this.prisma.users.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }
  async findOne(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        avatar : true,
        banner : true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  async create(createUserDto: CreateUserDto) {
    // Kiểm tra email đã tồn tại
    const existingUser = await this.prisma.users.findUnique({
      where: { email: createUserDto.email }
    })

    if (existingUser) {
      throw new BadRequestException('User already exists with this email');
    }
    // Tìm role 'user' mặc định
    const defaultRole = await this.prisma.roles.findUnique({
      where: { name: 'USER' }
    });

    if (!defaultRole) {
      throw new BadRequestException('Default user role not found');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); 
    return this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
        roles: { connect: { id: defaultRole.id } }
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayname: true,
        birth: true,
        roles: {
          select: {
            id: true,
            name: true,
          },
        },
        created_at: true,
        updated_at: true,
      },
    });
  }
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Parallel validation - chạy song song để tối ưu tốc độ
    const [existingUser, emailCheck, roleCheck] = await Promise.all([
      this.prisma.users.findUnique({
        where: { id },
        select: {
          id: true, email: true, username: true, password: true
        }
      }),

      updateUserDto.email ? this.prisma.users.findUnique({
        where: {
          email: updateUserDto.email,
          NOT: { id } // ngoại trừ người dùng hiện tại
        },
        select: {
          id: true, // id của người dùng nếu tồn tại
        }
      }) : null, // trả về null nếu không có email bị duplicate

      updateUserDto.role_id ? this.prisma.roles.findUnique({
        where: { id: updateUserDto.role_id },
        select: { id: true }
      }) : null // trả về null nếu không có roleId 
    ])

   
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (emailCheck && updateUserDto.email) {
      throw new ConflictException('Email already exists');
    }
    if (!roleCheck && updateUserDto.role_id) {
      throw new NotFoundException(`Role with ID ${updateUserDto.role_id} not found`);
    }
    
    const updateUser = await this.prisma.users.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: updateUserDto.password ? await bcrypt.hash(updateUserDto.password, 10) : existingUser.password,
      },
      include: { roles: true }
    })
    const { password, ...result } = updateUser;
    return result;
  }

  async getUserStats(id: string) {
    await this.findOne(id);
    const [uploadsCount, upvotesCount, commentsCount, downloadsCount] = await Promise.all([
      // Simplified uploads count - count resources owned by user that have completed uploads
      this.prisma.uploads.count({
        where: {
          status: 'COMPLETED',
          resources: {
            folder_files: {
              some: {
                folders: {
                  user_id: id
                }
              }
            }
          }
        }
      }),

      // Fixed upvotes count - use new vote system (value: 1 for upvotes)
      this.prisma.ratings.count({
        where: {
          value: 1, 
          OR: [
            // Upvotes on user's folders
            {
              ratings_folders: {
                some: {
                  folders: {
                    user_id: id
                  }
                }
              }
            },
            // Upvotes on user's resources
            {
              ratings_resources: {
                some: {
                  resources: {
                    folder_files: {
                      some: {
                        folders: {
                          user_id: id
                        }
                      }
                    }
                  }
                }
              }
            }
          ]
        }
      }),

      // Comments count 
      this.prisma.comments.count({
        where: {
          user_id: id,
          is_deleted: false
        }
      }),

      // Downloads count - count downloads of user's resources
      this.prisma.downloads.count({
        where: {
          resources: {
            folder_files: {
              some: {
                folders: {
                  user_id: id
                }
              }
            }
          }
        }
      })
    ]);
    return {
      uploads: uploadsCount,
      upvotes: upvotesCount,
      comments: commentsCount,
      downloads: downloadsCount
    };
  }
  
  // async getUserActivities(id: string) {
  //   await this.findOne(id);

  //   const [uploads, comments, ratings] = await Promise.all([
  //     this.prisma.uploads.findMany({
  //       where: {
  //         status: 'COMPLETED',
  //         resources: {
  //           folder_files: {
  //             some: {
  //               folders: {
  //                 user_id: id
  //               }
  //             }
  //           }
  //         }
  //       },
  //       include: {
  //         resources: {
  //           select: {
  //             title: true
  //           }
  //         }
  //       },
  //       orderBy: { created_at: 'desc' },
  //       take: 5
  //     }),

  //     this.prisma.comments.findMany({
  //       where: {
  //         user_id: id,
  //         is_deleted: false
  //       },
  //       include: {
  //         resources: {
  //           select: {
  //             title: true
  //           }
  //         },
  //         folders: {
  //           select: {
  //             name: true
  //           }
  //         }
  //       },
  //       orderBy: { created_at: 'desc' },
  //       take: 3
  //     }),

  //     // TODO: Update this query to use new rating schema when enabling getUserActivities
  //     // Need to replace rating_targets with ratings_resources/ratings_folders
  //     this.prisma.ratings.findMany({
  //       where: {
  //         user_id: id,
  //         // FIXME: rating_targets table no longer exists
  //         // Need to update with new schema:
  //         // OR: [
  //         //   {
  //         //     ratings_folders: {
  //         //       some: {
  //         //         folders: { user_id: { not: id } }
  //         //       }
  //         //     }
  //         //   },
  //         //   {
  //         //     ratings_resources: {
  //         //       some: {
  //         //         resources: {
  //         //           folder_files: {
  //         //             some: { folders: { user_id: { not: id } } }
  //         //           }
  //         //         }
  //         //       }
  //         //     }
  //         //   }
  //         // ]
  //       },
  //       // FIXME: Update include to use new relations
  //       orderBy: { created_at: 'desc' },
  //       take: 2
  //     })
  //   ]);

  //   const activities = [
  //     ...uploads.map(upload => ({
  //       id: upload.id,
  //       type: 'upload',
  //       title: `Tải lên "${upload.resources?.title || 'Tài liệu'}"`,
  //       time: upload.created_at,
  //       icon: 'Upload'
  //     })),
  //     ...comments.map(comment => ({
  //       id: comment.id,
  //       type: 'comment',
  //       title: `Bình luận về "${comment.resources?.title || comment.folders?.name || 'Tài liệu'}"`,
  //       time: comment.created_at,
  //       icon: 'MessageCircle'
  //     })),
  //     ...ratings.map(rating => ({
  //       id: rating.id,
  //       type: 'rating',
  //       // FIXME: Update to use new rating relations
  //       // title: `Đánh giá "${rating.ratings_resources[0]?.resources?.title || rating.ratings_folders[0]?.folders?.name || 'Tài liệu'}"`,
  //       title: `Đánh giá tài liệu`, // Temporary fallback
  //       time: rating.created_at,
  //       icon: 'Star'
  //     }))
  //   ];

  //   return activities
  //     .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  //     .slice(0, 10);
  // }

  async getUserStatus(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        is_disabled: true,
        disabled_until: true,
        disabled_reason: true,
      }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      is_disabled: user.is_disabled,
      disabled_until: user.disabled_until,
      disabled_reason: user.disabled_reason,
    };
  }

  async delete(id: string) {
    await this.findOne(id)
    return this.prisma.users.delete({
      where: { id }
    });
  }
}
