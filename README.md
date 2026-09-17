# Meta AutoPost Pro - Multi-Account Facebook & Instagram Automation Platform

Production-ready, multi-tenant SaaS application for automated posting across Facebook Pages and Instagram Business Accounts. Built with React (Vite + Tailwind CSS), Node.js Express (Firebase Cloud Functions backend), MongoDB Atlas, and Cloudinary.

---

## 🌟 Key Features

- **👑 Super Admin Control Panel**:
  - Super Admin can create Client Users and assign Passwords.
  - Reset Passwords, Suspend/Activate users, and delete user data.
  - Global overview of platform stats (Total Users, Connected Meta Accounts, Scheduled Posts, Live Posts).

- **👥 Multi-Tenant Data Isolation**:
  - Every client user sees ONLY their own connected Facebook Pages, Instagram Accounts, and Posts.

- **🏢 SMM Agency Multi-Account Support**:
  - Connect unlimited Facebook Pages & Instagram Business Accounts under one user login.
  - Multi-select target accounts when creating or scheduling posts.

- **🖼️ Cloudinary Media Upload & Live Preview**:
  - Upload images and videos directly to Cloudinary.

- **⏰ Automated Background Scheduler**:
  - Background Cron Worker processes due posts automatically every 1-5 minutes.
  - Instant "Post Now" execution option.

---

## 🚀 Quick Setup & Local Execution

### 1. Environment Configuration
Edit `.env` file in the project root to update your domains or credentials:
```env
VITE_API_BASE_URL=http://localhost:5000/api
PORT=5000
MONGODB_URI=your_mongodb_connection_string
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_name
VITE_META_APP_ID=your_meta_app_id
```

### 2. Backend Installation & Run
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Installation & Run
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Production Firebase Deployment

### 1. Deploy Frontend to Firebase Hosting
```bash
firebase deploy --only hosting
```

### 2. Deploy Backend Functions to Firebase Cloud Functions
```bash
firebase deploy --only functions
```
