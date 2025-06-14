# MDHH Full-Stack Application

> Modern web application built with Next.js frontend and NestJS backend, featuring user authentication, role-based access control, and modern UI components.

## 🏗️ **Project Architecture**

```
MDHH/
├── frontend/           # Next.js 15 + React 19 + TypeScript
├── backend/           # NestJS + Prisma + PostgreSQL
└── package.json      # Root workspace configuration
```

## 🚀 **Tech Stack**

### **Frontend**
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Authentication**: NextAuth.js v4
- **Form Handling**: React Hook Form + Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios

### **Backend**
- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js
- **Validation**: Class Validator
- **Documentation**: Swagger/OpenAPI
- **Security**: bcrypt for password hashing

### **Database Schema** (Current, Code First)
- **Users**: Email, username, displayname, password, role
- **Roles**: Role-based access control (user, admin)

## 📦 **Features** (Current)

### **Authentication & Authorization**
- ✅ User registration with email validation (@gmail.com only)
- ✅ JWT-based authentication
- ✅ NextAuth.js integration for session management
- ✅ Role-based access control
- ✅ Protected routes and API endpoints

### **User Interface**
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Custom color scheme (Green theme: #6A994E, #386641, #A7C957)
- ✅ Loading states and error handling
- ✅ Form validation with real-time feedback
- ✅ Dashboard with user profile

### **Development Experience**
- ✅ TypeScript throughout the stack
- ✅ Shared types between frontend and backend
- ✅ ESLint configuration
- ✅ Concurrent development setup
- ✅ API documentation with Swagger

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

Remember to Create `.env` files in both frontend and backend directories:
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

### **Main Endpoints**
```
POST /auth/login      # User login
POST /auth/register   # User registration
GET  /users           # Get all users (protected)
GET  /users/:id       # Get user by ID (protected)
PATCH /users/:id      # Update user (protected)
DELETE /users/:id     # Delete user (protected)
```

## 🎨 **UI/UX Design**

### **Color Palette**
- **Primary Green**: `#6A994E`
- **Dark Green**: `#386641`
- **Light Green**: `#A7C957`
- **Error Red**: `#BC4749`
- **White**: `#FFFFFF`

### **Key Pages**
- `/` - Landing page with session status
- `/auth/signin` - Login form
- `/auth/register` - Registration form
- `/dashboard` - Protected user dashboard

### **Form Validation**
- **Email**: Must be @gmail.com format
- **Username**: 3+ characters, alphanumeric + underscore/period
- **Password**: 6+ characters minimum
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
```sql
-- Users table
users {
  id          String   @id @default(cuid())
  email       String   @unique
  username    String?   
  displayname String   
  password    String
  roleId      String  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

-- Roles table
roles {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## 🚦 **Project Status**

### **Completed Features**
- ✅ Full authentication system (login/register)
- ✅ Role-based access control
- ✅ Protected routes and API endpoints
- ✅ Form validation with Zod
- ✅ Modern UI with Tailwind CSS
- ✅ Error handling and loading states
- ✅ Swagger API documentation
- ✅ TypeScript integration
- ✅ Concurrent development setup

### **Known Issues**
- Username uniqueness validation needs improvement in backend
- Global error display could be optimized
- Toast notifications not yet implemented

### **Future Enhancements**
- [ ] shadcn/ui component integration
- [ ] Toast notification system
- [ ] Password reset functionality
- [ ] Email verification
- [ ] User profile editing
- [ ] Admin dashboard
- [ ] File upload capabilities
- [ ] Advanced search and filtering

## 🔒 **Security Features**

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **CORS Configuration**: Proper cross-origin setup
- **Input Validation**: Both client and server-side
- **Protected Routes**: Route guards for sensitive pages
- **Role-based Access**: Different permissions per user role

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
