# SubTrack - Subscription Manager

A modern web application for tracking and managing subscriptions efficiently. Built with React (frontend) and Express.js (backend) with MySQL database.

## 🚀 Features

- **Dashboard**: Visual calendar of subscription billing dates
- **Smart Add**: Natural language input for quick subscription entry (e.g., "Netflix 15.99 every 15th")
- **Insights**: Get recommendations for savings and spending analysis
- **Monthly Analytics**: Track total monthly and yearly spending
- **Data Persistence**: All subscriptions stored in MySQL database
- **Responsive Design**: Works on desktop and mobile devices

## 📁 Project Structure

```
SubTrack/
├── frontend/                 # React + Vite frontend app
│   ├── src/
│   ├── components/
│   ├── services/
│   ├── types.ts
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # Express.js + TypeScript backend API
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── database/         # Database connection & initialization
│   │   ├── middleware/       # Express middleware
│   │   ├── models/           # Data models & types
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic (Gemini service)
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **FontAwesome** - Icons

### Backend

- **Express.js** - Web framework
- **TypeScript** - Type safety
- **MySQL** - Database
- **CORS** - Cross-origin requests

## 📋 Prerequisites

- **Node.js** >= 18.0.0
- **MySQL** >= 5.7

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm run install-all
```

This installs dependencies for both frontend and backend.

### 2. Setup Database

First, make sure MySQL is running. Then initialize the database:

```bash
npm run backend:db
```

This will:

- Create the `subtrack_db` database
- Create the `subscriptions` table
- Insert sample data (Netflix, Spotify, Adobe CC, iCloud+, Dropbox)

### 3. Configure Environment Variables

Both `.env.local` files are pre-configured with database settings.

**Frontend** (`frontend/.env.local`):

```
VITE_API_URL=http://localhost:5000/api
```

**Backend** (`backend/.env.local`):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=subtrack_db
PORT=5000
```

### 4. Run the Application

Open **two separate terminals**:

**Terminal 1 - Frontend:**

```bash
npm run frontend:dev
```

Runs on: http://localhost:5173

**Terminal 2 - Backend:**

```bash
npm run backend:dev
```

Runs on: http://localhost:3001

## 📚 API Endpoints

### Subscriptions

- `GET /api/subscriptions` - Get all subscriptions
- `POST /api/subscriptions` - Create a subscription
- `GET /api/subscriptions/:id` - Get subscription by ID
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/subscriptions/date/:date` - Get subscriptions by billing date
- `GET /api/stats/monthly-total` - Get monthly total spending

### Insights

- `GET /api/ai/insights` - Get spending insights
- `POST /api/ai/parse-smart-add` - Parse natural language input

## 🗄️ Database Schema

### subscriptions table

```sql
CREATE TABLE subscriptions (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  cycle ENUM('MONTHLY', 'YEARLY') NOT NULL,
  billing_date INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
```

## 🔧 Development

### Running Tests

```bash
# Frontend
cd frontend && npm run test

# Backend
cd backend && npm run test
```

### Building for Production

```bash
npm run build
```

Creates optimized builds in:

- `frontend/dist/`
- `backend/dist/`

## 📝 Project Maintenance

### Code Organization

- **Frontend**: Components are in `frontend/components/`, services in `frontend/services/`
- **Backend**: Clear separation of concerns with controllers, models, services, and routes
- **Database**: Schema is versioned through `backend/src/database/init.ts`

### Adding New Features

1. Create new API endpoint in `backend/src/routes/`
2. Create controller method in `backend/src/controllers/`
3. Update model/database queries if needed
4. Call API from frontend service in `frontend/services/geminiService.ts`
5. Update React components to use new data

### Environment Variables

Use `.env.local` for local development. Never commit `.env.local` to git (it's in `.gitignore`).

## 🐛 Troubleshooting

### Database Connection Failed

- Ensure MySQL is running: `brew services start mysql` (macOS)
- Check credentials in `backend/.env.local`
- Verify `subtrack_db` exists: `mysql -u root -e "SHOW DATABASES;"`

### Frontend Can't Connect to API

- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `frontend/.env.local`
- Check browser console for CORS errors

### Gemini API Errors

- Verify network connectivity to API services
- Check API response status in browser console
- Ensure backend is running correctly

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please follow the project structure and coding conventions.

## 📞 Support

For issues or questions, create an issue on the repository or check the GitHub discussions.
