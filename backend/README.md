# SQL4Data Backend API

FastAPI-based backend for the SQL training platform.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- OpenAI API Key (optional, for AI explanations)

### Setup

1. **Clone and navigate to the project**
```bash
cd sql-trainer
```

2. **Create environment file**
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and add your OpenAI API key (optional).

3. **Start services with Docker Compose**
```bash
docker-compose up --build
```

This will start:
- PostgreSQL database on port 5432
- FastAPI backend on port 8000

4. **Verify services are running**
```bash
curl http://localhost:8000/health
```

### Manual Setup (without Docker)

1. **Install PostgreSQL locally**

2. **Create database**
```bash
createdb sql4data_db
psql sql4data_db < database/init.sql
```

3. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

4. **Run the server**
```bash
uvicorn main:app --reload
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔌 API Endpoints

### Health Check
```http
GET /health
```

### Execute SQL Query
```http
POST /api/execute
Content-Type: application/json

{
  "query": "SELECT * FROM customers;",
  "task_id": 1
}
```

**Response:**
```json
{
  "is_correct": true,
  "user_data": [...],
  "expected_data": [...],
  "user_columns": ["customer_id", "first_name", ...],
  "expected_columns": ["customer_id", "first_name", ...],
  "error_message": null,
  "execution_time_ms": 45,
  "row_count": 12,
  "expected_row_count": 12
}
```

### Get AI Explanation
```http
POST /api/explain
Content-Type: application/json

{
  "query": "SELECT * FROM customer;",  // Wrong table name
  "task_id": 1,
  "error_message": "relation \"customer\" does not exist"
}
```

**Response:**
```json
{
  "explanation": "It looks like you're trying to access a table that doesn't exist...",
  "hints": [
    "Check the table name spelling",
    "Review the database schema"
  ],
  "suggested_concepts": [
    "SQL Table Names",
    "Database Schema"
  ]
}
```

### Get All Tasks
```http
GET /api/tasks?category=select&difficulty=beginner
```

**Response:**
```json
{
  "tasks": [
    {
      "task_id": 1,
      "title": "Select all customers",
      "description": "Select all columns from the customers table",
      "difficulty": "beginner",
      "category": "select",
      "database_schema": "ecommerce",
      "tables_involved": ["customers"]
    }
  ],
  "total": 78,
  "categories": ["select", "join", "subquery", "cte", "window"],
  "difficulties": ["beginner", "intermediate", "advanced", "expert"]
}
```

### Get Single Task
```http
GET /api/tasks/1
```

## 🔒 Security Features

### Read-Only Execution
All user queries are executed with a read-only database user. This prevents:
- `DROP TABLE`
- `DELETE`
- `UPDATE`
- `INSERT`
- Any data modification

### Query Validation
Multiple layers of validation:
1. **Pydantic validation** - Request structure
2. **Regex validation** - Dangerous keyword detection
3. **Database transaction** - `SET TRANSACTION READ ONLY`
4. **Timeout protection** - 30-second query timeout

### SQL Injection Prevention
- Parameterized queries
- Keyword blocking
- Input sanitization
- Connection pooling with limits

## 🗄️ Database Schema

### Exercise Tracking Tables
- `tasks` - All SQL exercises
- `user_query_executions` - Query history and results

### Music Store Schema
- `artists`, `albums`, `tracks`
- `genres`, `media_types`

### E-commerce Schema
- `customers`, `orders`, `order_items`

## 🧪 Testing

### Run tests
```bash
cd backend
pytest tests/ -v
```

### Test query execution
```bash
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT * FROM customers LIMIT 5;", "task_id": 1}'
```

## 📊 Monitoring

### View logs
```bash
docker-compose logs -f backend
```

### Database connection test
```bash
docker exec -it sql4data_postgres psql -U sql4data_user -d sql4data_db
```

## 🛠️ Development

### Project Structure
```
backend/
├── main.py              # FastAPI app & routes
├── config.py            # Settings & environment
├── database.py          # SQLAlchemy setup
├── models.py            # Database models
├── schemas.py           # Pydantic schemas
├── query_executor.py    # SQL execution logic
├── ai_explainer.py      # OpenAI integration
├── requirements.txt     # Python dependencies
├── Dockerfile           # Container definition
└── .env.example         # Environment template
```

### Adding New Tasks

Edit `main.py` and add to the `seed_tasks()` function:

```python
Task(
    task_id=79,
    title="Your Task Title",
    description="Your task description",
    difficulty="intermediate",
    category="join",
    database_schema="music",
    gold_query="SELECT * FROM ...",
    tables_involved="tracks,albums"
)
```

### Extending AI Explanations

Modify `ai_explainer.py` to customize:
- Prompt templates
- Model selection (gpt-4, gpt-3.5-turbo)
- Response formatting
- Fallback logic

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Restart database
docker-compose restart postgres

# View database logs
docker-compose logs postgres
```

### Backend Not Starting
```bash
# Check environment variables
cat backend/.env

# Rebuild container
docker-compose build backend
docker-compose up backend
```

### Query Execution Errors
1. Check database schema: `\dt` in psql
2. Verify read-only user permissions
3. Check query timeout settings in config.py

## 📈 Performance

### Optimizations Implemented
- Connection pooling (10 connections)
- Query timeout (30 seconds)
- Async SQLAlchemy
- Pandas for efficient data comparison
- Read-only replicas for safety

### Recommended Settings
- Max 100 concurrent requests
- 30-second query timeout
- 5-second health check interval

## 🔄 Updates & Maintenance

### Update dependencies
```bash
pip install -r requirements.txt --upgrade
pip freeze > requirements.txt
```

### Database migrations
```bash
alembic revision --autogenerate -m "description"
alembic upgrade head
```

## 📝 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

---

**Built with ❤️ for Data Engineering Education**
