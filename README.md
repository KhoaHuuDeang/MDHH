# MDHH Document Management Platform

> Enterprise-grade document management system built with modern full-stack architecture, featuring advanced file upload, role-based access control, and comprehensive document organization capabilities.

## 🏗️ **Project Architecture**

```
MDHH/
├── frontend/           # Next.js 15 + React 19 + TypeScript
├── backend/            # NestJS + Prisma + PostgreSQL + AWS S3
├── docs/               # Documentation and guidelines
├── CLAUDE.md          # Development guidelines & patterns
└── package.json       # Root workspace configuration
```

## 🚀 **Tech Stack**

### **Frontend (Next.js 15)**
- **Framework**: Next.js 15 with App Router & React Server Components
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS v4 with custom design system
- **Authentication**: NextAuth.js v4 (Credentials + Discord OAuth)
- **State Management**: Zustand with performance optimizations
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with custom interceptors
- **File Upload**: Direct S3 upload with progress tracking

### **Backend (NestJS)**
- **Framework**: NestJS with dependency injection
- **Database**: PostgreSQL with Prisma ORM
- **File Storage**: AWS S3 with pre-signed URLs
- **Authentication**: JWT + NextAuth integration
- **Validation**: Class Validator with comprehensive DTOs
- **Documentation**: Swagger/OpenAPI with auto-generation
- **Security**: bcrypt, input sanitization, rate limiting
- **Health Monitoring**: Built-in health checks and logging

### **Database Schema** (Enterprise-Ready)
- **Users**: Multi-provider auth, role management, profile data
- **Roles**: Granular permissions (USER, ADMIN)
- **Documents**: File metadata, classification, visibility
- **Folders**: Hierarchical organization with tags
- **Upload Sessions**: Multi-file upload tracking
- **Classifications**: Security levels and access control

## 📦 **Features**

### **🔐 Authentication & Authorization**
- ✅ Multi-provider authentication (Credentials + Discord OAuth)
- ✅ NextAuth.js v4 with session management
- ✅ JWT-based API authentication
- ✅ Role-based access control (USER, ADMIN)
- ✅ Protected routes and API endpoints
- ✅ User disable/enable system with tracking

### **📁 Document Management**
- ✅ Multi-file upload with drag & drop interface
- ✅ AWS S3 integration with pre-signed URLs
- ✅ Real-time upload progress tracking
- ✅ Document classification and tagging system
- ✅ Folder hierarchical organization
- ✅ File metadata management
- ✅ Document visibility controls (PUBLIC/PRIVATE)

### **👨‍💼 Admin Management**
- ✅ Comprehensive user management interface
- ✅ Hybrid pagination system (offset + cursor)
- ✅ Real-time user search and filtering
- ✅ User disable/enable with reason tracking
- ✅ Admin-only route protection
- ✅ User status monitoring

### **🎨 User Interface**
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Custom design system (Green theme: #6A994E, #386641, #A7C957)
- ✅ Loading states and error handling
- ✅ Form validation with real-time feedback
- ✅ Interactive upload wizard (3-step process)
- ✅ Mobile-first responsive design

### **⚡ Performance & Development**
- ✅ Zustand state management with optimizations
- ✅ TypeScript throughout the stack
- ✅ ESLint configuration with strict rules
- ✅ Concurrent development setup
- ✅ API documentation with Swagger
- ✅ Health monitoring and logging

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### **Quick Start**

1. **Clone the repository**
```bash
git clone <repository-url>
cd MDHH
```

2. **Install all dependencies**
```bash
npm run install:all
```

3. **Environment Configuration**
```
Remember to Create `.env` files in both frontend and backend directories
```
```
Frontend 

# Discord OAuth Configuration
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_BOT_TOKEN=
DISCORD_GUILD_ID=

# Existing configuration
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXTAUTH_BACKEND_URL=
NEXT_PUBLIC_API_URL=

```
```
Backend
DATABASE_URL=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN="7d"

# App
PORT=3001
```
4. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed  # Optional: seed with default roles
```

5. **Start Development Servers**
```bash
# From root directory - starts both frontend and backend
npm run dev

# Or start individually:
npm run dev:frontend  # Starts Next.js on http://localhost:3000
npm run dev:backend   # Starts NestJS on http://localhost:3001
```

## 📚 **API Documentation**

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api/docs
- **API Base URL**: http://localhost:3001

## 🎨 **UI/UX Design**

### **Color Palette**
- **Primary Green**: `#6A994E`
- **Dark Green**: `#386641`
- **Light Green**: `#A7C957`
- **Error Red**: `#BC4749`
- **White**: `#FFFFFF`

### **Key Pages**
- `/` - Landing page with session status
- `/auth` - Authentication (Login/Register)
- `/profile` - User profile management
- `/uploads` - Document upload interface
- `/uploads/resources` - Document library
- `/admin/users` - Admin user management (admin only)

### **Form Validation**
- **Email**: Standard email format validation
- **Username**: 3+ characters, alphanumeric + underscore/period
- **Password**: 6+ characters minimum
- **Files**: PDF, DOC, DOCX support with 50MB limit
- **Real-time validation** with Zod schema

## 🔧 **Development Scripts**

### **Root Level**
```bash
npm run dev              # Start both frontend and backend
npm run build            # Build both applications
npm run install:all      # Install dependencies for all packages
```

### **Frontend**
```bash
npm run dev              # Start Next.js development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
```

### **Backend**
```bash
npm run start:dev        # Start NestJS in watch mode
npm run build            # Build for production
npm run start:prod       # Start production server
npm run test             # Run tests
npm run db:seed          # Seed database with default data
```

## 🗄️ **Database Management**

### **Prisma Commands**
```bash
cd backend

npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema to database
npx prisma db pull       # Pull schema from database
npx prisma studio        # Open Prisma Studio (GUI)
npx prisma migrate dev   # Create and apply migration
npx prisma db seed       # Run database seeding
```

### **Database Schema**
Modern PostgreSQL database with comprehensive document management schema supporting:
- User authentication and role management
- Document classification and organization
- File upload session tracking
- Hierarchical folder structure
- Administrative user controls

## 🚦 **Project Status**

### **Current Status**
✅ **Production Ready Features:**
- Multi-provider authentication system
- Document upload and management
- Role-based admin controls
- User profile management
- Responsive modern UI/UX
- File organization with folders/tags
- Real-time upload progress
- Security and validation

🚧 **In Development:**
- Performance optimizations
- Advanced search capabilities
- Enhanced mobile experience
- Additional file format support

🔮 **Planned Features:**
- Public document preview pages
- Advanced analytics dashboard
- Enhanced collaboration tools
- API rate limiting improvements

## 🔒 **Security Features**

- **Multi-layer Authentication**: NextAuth.js + JWT integration
- **Password Security**: bcrypt hashing with salt rounds
- **File Upload Security**: Pre-signed URLs, file type validation
- **Input Sanitization**: Comprehensive validation on all inputs
- **Role-based Access Control**: Granular permission system
- **Protected Routes**: Authentication guards throughout app
- **CORS & Headers**: Security headers and origin policies

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create a Pull Request

## 📝 **License**

This project is licensed under the MIT License.

## 📞 **Support**

For questions or issues, please:
1. Check the existing issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

**Built with ❤️**
