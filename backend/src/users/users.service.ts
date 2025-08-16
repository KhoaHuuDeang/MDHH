import {  BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import * as bcrypt from 'bcrypt';
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
    console.log('USER BACKENDDD : ', user)
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

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); return this.prisma.users.create({
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
    // ✅ 1. Parallel validation - chạy song song để tối ưu tốc độ
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

    // ✅ 2.Validate 
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    if (emailCheck && updateUserDto.email) {
      throw new ConflictException('Email already exists');
    }
    if (!roleCheck && updateUserDto.role_id) {
      throw new NotFoundException(`Role with ID ${updateUserDto.role_id} not found`);
    }
    // ✅ 3.update user
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
    //parallel fetching 
    const [uploadsCount, upvotesCount, commentsCount, downloadsCount] = await Promise.all([
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

      this.prisma.ratings.count({
        where: {
          value: { gte: 4 },
          rating_targets: {
            some: {
              OR: [
                {
                  folders: {
                    user_id: id
                  }
                },
                {
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
              ]
            }
          }
        }
      }),

      this.prisma.comments.count({
        where: {
          user_id: id,
          is_deleted: false
        }
      }),

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

  //     this.prisma.ratings.findMany({
  //       where: {
  //         user_id: id,
  //         rating_targets: {
  //           some: {
  //             OR: [
  //               {
  //                 folders: {
  //                   user_id: { not: id }
  //                 }
  //               },
  //               {
  //                 resources: {
  //                   folder_files: {
  //                     some: {
  //                       folders: {
  //                         user_id: { not: id }
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             ]
  //           }
  //         }
  //       },
  //       include: {
  //         rating_targets: {
  //           include: {
  //             folders: {
  //               select: {
  //                 name: true
  //               }
  //             },
  //             resources: {
  //               select: {
  //                 title: true
  //               }
  //             }
  //           }
  //         }
  //       },
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
  //       title: `Đánh giá "${rating.rating_targets[0]?.resources?.title || rating.rating_targets[0]?.folders?.name || 'Tài liệu'}"`,
  //       time: rating.created_at,
  //       icon: 'Star'
  //     }))
  //   ];

  //   return activities
  //     .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  //     .slice(0, 10);
  // }

  async delete(id: string) {
    await this.findOne(id)
    return this.prisma.users.delete({
      where: { id }
    });
  }
}
