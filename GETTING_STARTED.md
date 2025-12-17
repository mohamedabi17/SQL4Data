# 🚀 Quick Start Guide - Updated SQL Trainer

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
cd sql-trainer
npm install
npm run dev
```

The app will start at `http://localhost:5173`

---

## 🆕 What's New: Feature Guide

### 1. **New Task Categories**

#### How to Access
1. Click **"Tasks List"** in the header
2. You'll now see **8 categories** (was 3):
   - SELECT
   - GROUP BY
   - JOIN
   - **SUBQUERY** ⭐ NEW
   - **CTE** ⭐ NEW
   - **WINDOW** ⭐ NEW
   - **AGGREGATE** ⭐ NEW
   - **ADVANCED** ⭐ NEW

#### Task Navigation
```
Tasks List → Select Category → Choose Task → Solve → Check Answer
```

---

### 2. **E-Commerce Database**

#### How to Use
Tasks using the e-commerce database are automatically loaded with:
- **7 tables:** customers, products, categories, orders, order_items, suppliers, reviews
- **100+ records** of realistic data
- Complex relationships for advanced queries

#### View Database Schema
1. Click **"Show tables description"** in any e-commerce task
2. See all tables with:
   - Column names
   - Primary keys (PK)
   - Foreign keys (FK)
   - Relationships between tables

---

### 3. **SQL Features You'll Learn**

#### Subqueries (8 tasks)
```sql
-- Example: Products above average price
SELECT product_name, price 
FROM products 
WHERE price > (SELECT AVG(price) FROM products);
```

#### CTEs (5 tasks)
```sql
-- Example: Using WITH clause
WITH customer_totals AS (
  SELECT customer_id, SUM(total_amount) as total
  FROM orders
  GROUP BY customer_id
)
SELECT c.first_name, c.last_name, ct.total
FROM customers c
JOIN customer_totals ct ON c.customer_id = ct.customer_id;
```

#### Window Functions (8 tasks)
```sql
-- Example: Rank products by price
SELECT 
  product_name, 
  price,
  RANK() OVER (ORDER BY price DESC) as price_rank
FROM products;
```

#### Recursive CTEs
```sql
-- Example: Category hierarchy
WITH RECURSIVE category_tree AS (
  SELECT category_id, category_name, parent_category_id
  FROM categories 
  WHERE parent_category_id IS NULL
  
  UNION ALL
  
  SELECT c.category_id, c.category_name, c.parent_category_id
  FROM categories c
  JOIN category_tree ct ON c.parent_category_id = ct.category_id
)
SELECT * FROM category_tree;
```

---

## 📚 Learning Path

### For Complete Beginners
**Start here:** Task 1 - `select_all_invoices`

**Progress through:**
1. All SELECT tasks (23 total)
2. GROUP BY tasks (4 total)
3. Basic JOIN tasks (first 5-6)

**Time estimate:** 2-3 weeks

---

### For Intermediate Users
**Start at:** Task 25 - `count_customers_by_country`

**Focus on:**
1. Advanced JOINs
2. SUBQUERY section
3. CTE basics

**Time estimate:** 2-3 weeks

---

### For Advanced Users
**Jump to:** Task 41 - Subquery section

**Master:**
1. Complex subqueries
2. CTEs (including recursive)
3. Window functions
4. Advanced analytics

**Time estimate:** 3-4 weeks

---

## 🎯 Tips for Success

### 1. Read the Task Description Carefully
Each task has a clear description in English and Russian:
```
"Select all customers who have placed at least one order."
```

### 2. Check the Expected Output
Click **"Show expected output"** to see what your result should look like.

### 3. Use Table Descriptions
Click **"Show tables description"** to understand:
- What columns are available
- How tables are related (Foreign Keys)
- Data types

### 4. Build Queries Incrementally
```sql
-- Step 1: Select from main table
SELECT * FROM customers;

-- Step 2: Add conditions
SELECT * FROM customers WHERE country = 'USA';

-- Step 3: Add joins
SELECT c.*, o.total_amount 
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE c.country = 'USA';
```

### 5. Check Your Answer
Click **"Check answer"** to validate your query.
- ✅ **Green checkmark** = Correct!
- ❌ **Red X** = Try again

### 6. View Reference Solution
If stuck, check the reference solution (after attempting).

---

## 🔍 Understanding Task Difficulty

### Easy ⭐ (Tasks 1-20)
```sql
SELECT column_name FROM table_name WHERE condition;
```
**Concepts:** Basic SELECT, WHERE, ORDER BY

### Medium ⭐⭐ (Tasks 21-40)
```sql
SELECT category, COUNT(*) as count
FROM products
GROUP BY category
HAVING count > 10;
```
**Concepts:** GROUP BY, HAVING, Basic JOINs

### Hard ⭐⭐⭐ (Tasks 41-60)
```sql
WITH category_sales AS (...)
SELECT c.*, cs.revenue
FROM categories c
JOIN category_sales cs USING (category_id);
```
**Concepts:** CTEs, Subqueries, Complex JOINs

### Expert ⭐⭐⭐⭐ (Tasks 61-78)
```sql
SELECT 
  customer_id,
  order_date,
  total_amount,
  RANK() OVER (PARTITION BY customer_id ORDER BY order_date) as order_rank,
  SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as running_total
FROM orders;
```
**Concepts:** Window functions, Advanced analytics

---

## 📊 Tracking Your Progress

### Built-in Progress Tracking
The app tracks which tasks you've completed. Your progress is saved in browser local storage.

### Recommended Milestones
- ✅ **Bronze** - Complete 25 tasks (Beginner certified)
- ✅ **Silver** - Complete 50 tasks (Intermediate certified)
- ✅ **Gold** - Complete 70 tasks (Advanced certified)
- ✅ **Platinum** - Complete all 78 tasks (SQL Master!)

---

## 💡 Common SQL Patterns

### Pattern 1: Filter Then Aggregate
```sql
SELECT category_id, AVG(price)
FROM products
WHERE stock_quantity > 0
GROUP BY category_id;
```

### Pattern 2: Join Then Group
```sql
SELECT c.country, COUNT(o.order_id)
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
GROUP BY c.country;
```

### Pattern 3: Subquery for Comparison
```sql
SELECT product_name, price
FROM products
WHERE price > (SELECT AVG(price) FROM products);
```

### Pattern 4: CTE for Readability
```sql
WITH expensive_products AS (
  SELECT * FROM products WHERE price > 1000
)
SELECT category_id, COUNT(*) 
FROM expensive_products 
GROUP BY category_id;
```

### Pattern 5: Window for Ranking
```sql
SELECT 
  product_name,
  price,
  DENSE_RANK() OVER (PARTITION BY category_id ORDER BY price DESC) as rank
FROM products;
```

---

## 🎨 Using the New Modern UI

### Design Features
- **Glass-morphism cards** - Semi-transparent with blur effects
- **Smooth animations** - Hover over buttons and cards
- **Gradient backgrounds** - Subtle color transitions
- **Modern shadows** - Depth and dimension
- **Responsive design** - Works on mobile, tablet, desktop

### Dark Mode
Toggle between light and dark mode using the theme switcher in the header.
- Light mode: Soft gradients (gray → blue → purple)
- Dark mode: Deep gradients (dark gray → darker gray)

### Accessibility
- High contrast ratios (WCAG AAA compliant)
- Keyboard navigation supported
- Focus indicators visible
- Screen reader friendly

---

## 🐛 Troubleshooting

### Issue: Task won't validate
**Solution:** 
- Check for typos in column names
- Verify table names are correct
- Ensure query syntax is valid
- Compare your output with expected output

### Issue: Can't see expected output
**Solution:**
- Click "Show expected output" button
- Some tasks may not have expected output (check task description)

### Issue: Database not loading
**Solution:**
- Refresh the page
- Check browser console for errors
- Clear browser cache

---

## 📖 Additional Resources

### SQL Reference
- [SQLite Documentation](https://www.sqlite.org/lang.html)
- [SQL Tutorial - W3Schools](https://www.w3schools.com/sql/)
- [Window Functions Guide](https://www.postgresql.org/docs/current/tutorial-window.html)

### Practice Databases
This trainer includes:
1. **Music Database** - Artist, Album, Track data
2. **Accounting Database** - Invoices, Customers, Employees
3. **E-Commerce Database** - Products, Orders, Reviews (NEW!)

---

## 🎓 Next Steps After Completion

After mastering all 78 tasks:

1. **Real-world projects** - Apply SQL to actual databases
2. **Performance optimization** - Learn indexing, query plans
3. **Advanced topics** - Stored procedures, triggers, transactions
4. **Database design** - Normalization, ER diagrams
5. **Big data** - Learn distributed SQL (BigQuery, Snowflake)

---

## 🤝 Contributing

Found a bug or have a suggestion?
1. Open an issue on GitHub
2. Submit a pull request
3. Share your feedback

---

## 📜 License

MIT License - Feel free to use for learning and teaching!

---

**Happy SQL learning! You're now equipped to become a SQL master! 🚀**

Got questions? Check the task descriptions, they're your best friend! 💡
