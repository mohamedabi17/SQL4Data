# SQL4Data - Full Stack MVP Implementation Guide

## 🎯 Project Overview

**SQL4Data** is a comprehensive SQL training platform focused on Data Engineering, featuring:
- **Frontend**: Existing Next.js/React application (Vite-based)
- **Backend**: NEW FastAPI service with secure SQL execution
- **Database**: PostgreSQL with realistic datasets
- **AI**: OpenAI-powered explanations for errors

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vite/React)  │  ← Existing UI
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │
│   (FastAPI)     │  ← NEW
│   Port: 8000    │
└────────┬────────┘
         │
         │ SQL/Async
         │
┌────────▼────────┐
│   PostgreSQL    │
│   Port: 5432    │  ← NEW
└─────────────────┘
```

---

## 📦 What's Been Created

### 1. Database Layer (`/database`)
✅ **init.sql** - Complete database schema with:
- **Music Store**: tracks, albums, artists, genres, media_types
- **E-commerce**: customers, orders, order_items  
- **Dirty Data**: Realistic data quality issues (nulls, duplicates)
- **Indexes & Views**: Performance optimizations
- **Security**: Read-only user for safe query execution

### 2. Backend API (`/backend`)
✅ **FastAPI Application** with:
- `/api/execute` - Secure SQL query execution
- `/api/explain` - AI-powered error explanations
- `/api/tasks` - Task listing and filtering
- `/health` - Service health check

✅ **Security Features**:
- Read-only database user
- Query validation (blocks DROP, DELETE, UPDATE)
- Transaction rollback after execution
- 30-second timeout protection
- SQL injection prevention

✅ **Key Files**:
- `main.py` - FastAPI routes and endpoints
- `query_executor.py` - Safe SQL execution engine
- `ai_explainer.py` - OpenAI integration
- `models.py` - SQLAlchemy models
- `schemas.py` - Pydantic request/response schemas
- `config.py` - Environment configuration
- `database.py` - Database connection management

### 3. Docker Setup (`/`)
✅ **docker-compose.yml** - Complete stack orchestration
✅ **Dockerfile** - Backend container definition
✅ **start.sh** - One-command deployment script

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Setup Environment
```bash
# Navigate to project
cd sql-trainer

# Create backend environment file
cp backend/.env.example backend/.env

# (Optional) Add your OpenAI API key to backend/.env
nano backend/.env
```

### Step 2: Start Everything
```bash
# Make startup script executable
chmod +x start.sh

# Start all services
./start.sh
```

This will:
1. Build Docker images
2. Start PostgreSQL database
3. Initialize database with sample data
4. Start FastAPI backend
5. Display service URLs

### Step 3: Verify Services

**Test Backend**:
```bash
curl http://localhost:8000/health
```

**Expected Response**:
```json
{
  "status": "healthy",
  "database": "connected",
  "ai_service": "available"
}
```

**Test Query Execution**:
```bash
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM customers LIMIT 3;",
    "task_id": 1
  }'
```

### Step 4: Open API Documentation
Visit: http://localhost:8000/docs

---

## 🔌 Frontend Integration

### Current Status
✅ Frontend exists at `http://localhost:5173` (Vite dev server)
⏳ Needs to connect to backend API

### Integration Steps

#### 1. Create API Client (`frontend/src/lib/api.ts`)
```typescript
const API_BASE_URL = 'http://localhost:8000';

export interface ExecuteQueryRequest {
  query: string;
  task_id: number;
}

export interface ExecuteQueryResponse {
  is_correct: boolean;
  user_data: any[];
  expected_data: any[];
  user_columns: string[];
  expected_columns: string[];
  error_message?: string;
  execution_time_ms?: number;
  row_count: number;
  expected_row_count: number;
}

export async function executeQuery(
  request: ExecuteQueryRequest
): Promise<ExecuteQueryResponse> {
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getAIExplanation(
  query: string,
  task_id: number,
  error_message?: string
): Promise<{ explanation: string; hints: string[]; suggested_concepts: string[] }> {
  const response = await fetch(`${API_BASE_URL}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, task_id, error_message }),
  });
  
  return response.json();
}

export async function getTasks(
  category?: string,
  difficulty?: string
): Promise<{ tasks: any[]; total: number }> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (difficulty) params.append('difficulty', difficulty);
  
  const response = await fetch(
    `${API_BASE_URL}/api/tasks?${params.toString()}`
  );
  
  return response.json();
}
```

#### 2. Update "Check Answer" Button
```typescript
// In your component where the "Check Answer" button exists
import { executeQuery } from '@/lib/api';

const handleCheckAnswer = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await executeQuery({
      query: userQuery,
      task_id: currentTaskId,
    });
    
    // Update UI with results
    setUserOutput(result.user_data);
    setExpectedOutput(result.expected_data);
    setIsCorrect(result.is_correct);
    
    if (!result.is_correct) {
      setErrorMessage(result.error_message);
    }
  } catch (err) {
    setError('Failed to execute query. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

#### 3. Add "Get AI Help" Button
```typescript
const handleGetAIHelp = async () => {
  setLoadingAI(true);
  
  try {
    const explanation = await getAIExplanation(
      userQuery,
      currentTaskId,
      errorMessage
    );
    
    // Display AI explanation in modal or sidebar
    setAIExplanation(explanation.explanation);
    setAIHints(explanation.hints);
    setAIConcepts(explanation.suggested_concepts);
    setShowAIModal(true);
  } catch (err) {
    setError('Failed to get AI explanation.');
  } finally {
    setLoadingAI(false);
  }
};
```

#### 4. Load Tasks from Backend
```typescript
// Replace hardcoded tasks with API call
useEffect(() => {
  const loadTasks = async () => {
    const { tasks } = await getTasks();
    setTasks(tasks);
  };
  
  loadTasks();
}, []);
```

---

## 🗄️ Database Details

### Connection Strings
```
Main User:
postgresql://sql4data_user:sql4data_password@localhost:5432/sql4data_db

Read-Only User (for query execution):
postgresql://readonly_user:readonly_password@localhost:5432/sql4data_db
```

### Available Tables

**Music Store**:
- `artists` (artist_id, name)
- `albums` (album_id, title, artist_id)
- `tracks` (track_id, name, album_id, genre_id, composer, milliseconds, bytes, unit_price)
- `genres` (genre_id, name)
- `media_types` (media_type_id, name)

**E-commerce**:
- `customers` (customer_id, first_name, last_name, email, country, loyalty_tier, ...)
- `orders` (order_id, customer_id, order_date, total, status, ...)
- `order_items` (order_item_id, order_id, track_id, quantity, unit_price)

**Exercise Tracking**:
- `tasks` (task_id, title, description, difficulty, category, gold_query, ...)
- `user_query_executions` (execution_id, task_id, user_query, is_correct, ...)

### Sample Queries
```sql
-- Get all customers
SELECT * FROM customers;

-- Join customers with orders
SELECT c.first_name, c.last_name, COUNT(o.order_id) as order_count
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name;

-- Find tracks with missing composers (dirty data)
SELECT name, composer FROM tracks WHERE composer IS NULL;
```

---

## 🧪 Testing the System

### 1. Test Database Connection
```bash
docker exec -it sql4data_postgres psql -U sql4data_user -d sql4data_db
```

```sql
-- Check tables
\dt

-- Query sample data
SELECT * FROM customers LIMIT 5;
```

### 2. Test Backend API
```bash
# Health check
curl http://localhost:8000/health

# Get all tasks
curl http://localhost:8000/api/tasks

# Execute a correct query
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM customers;", "task_id": 1}'

# Execute an incorrect query
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM customer;", "task_id": 1}'

# Get AI explanation
curl -X POST http://localhost:8000/api/explain \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM customer;",
    "task_id": 1,
    "error_message": "relation customer does not exist"
  }'
```

### 3. Test Security Features
```bash
# This should be blocked (dangerous query)
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "DROP TABLE customers;", "task_id": 1}'
```

**Expected**: Validation error preventing execution

---

## 📊 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Database only
docker-compose logs -f postgres
```

### Check Service Status
```bash
docker-compose ps
```

### Database Stats
```bash
docker exec -it sql4data_postgres psql -U sql4data_user -d sql4data_db -c "\l"
docker exec -it sql4data_postgres psql -U sql4data_user -d sql4data_db -c "\dt"
```

---

## 🔧 Configuration

### Environment Variables
Edit `backend/.env`:

```env
# Required
DATABASE_URL=postgresql+asyncpg://...
READONLY_DATABASE_URL=postgresql://readonly_user:...

# Optional (for AI explanations)
OPENAI_API_KEY=sk-...

# CORS (add your frontend URL if different)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
MAX_QUERY_LENGTH=5000
QUERY_TIMEOUT_SECONDS=30
```

---

## 🚨 Troubleshooting

### Backend won't start
```bash
# Check logs
docker-compose logs backend

# Rebuild
docker-compose build backend
docker-compose up -d backend
```

### Database connection errors
```bash
# Restart database
docker-compose restart postgres

# Check if port 5432 is available
lsof -i :5432

# Verify database is running
docker-compose ps postgres
```

### CORS errors in browser
Add your frontend URL to `backend/.env`:
```env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Query execution timeout
Increase timeout in `backend/config.py`:
```python
QUERY_TIMEOUT_SECONDS: int = 60  # Increase from 30
```

---

## 📝 Next Steps

### Immediate (MVP)
1. ✅ Backend API running
2. ✅ Database with sample data
3. ⏳ **Connect frontend to backend** (see Frontend Integration section)
4. ⏳ Test end-to-end user flow

### Short-term Enhancements
- [ ] Add all 78 tasks to database
- [ ] Implement user authentication
- [ ] Add progress tracking
- [ ] Create admin dashboard
- [ ] Add query history

### Long-term Features
- [ ] Multiple database types (MySQL, SQLite)
- [ ] Collaborative learning
- [ ] Leaderboards
- [ ] Custom datasets
- [ ] Advanced analytics

---

## 📚 API Reference

Full API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🤝 Support

### Issues
- Check logs: `docker-compose logs -f`
- Verify all services are running: `docker-compose ps`
- Test health endpoint: `curl http://localhost:8000/health`

### Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

---

**Your SQL4Data MVP is ready! 🚀**

Start with `./start.sh` and begin building the future of SQL education!
