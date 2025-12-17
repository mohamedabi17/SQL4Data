# SQL Task Roadmap 🗺️

## Learning Path: From Beginner to Expert

```
┌─────────────────────────────────────────────────────────────────┐
│                        🎯 BEGINNER LEVEL                         │
│                         (23 tasks)                               │
└─────────────────────────────────────────────────────────────────┘

📘 SELECT Fundamentals
├── SELECT * (all columns)
├── SELECT specific columns
├── ORDER BY (ASC/DESC, multiple columns)
├── WHERE clauses (=, >, <, BETWEEN)
├── Date comparisons
├── LIKE patterns (%, wildcards)
├── AND / OR conditions
├── NULL handling (IS NULL, IS NOT NULL)
└── LIMIT for top results

Example: "Select top 3 invoices from Germany by total"


┌─────────────────────────────────────────────────────────────────┐
│                     📗 INTERMEDIATE LEVEL                        │
│                         (25 tasks)                               │
└─────────────────────────────────────────────────────────────────┘

📗 GROUP BY & Aggregation
├── COUNT(*), COUNT(column)
├── SUM, AVG, MIN, MAX
├── GROUP BY single column
├── GROUP BY multiple columns
├── HAVING clause (filter groups)
├── ORDER BY aggregate results
└── Conditional aggregation (CASE)

📗 Basic JOINs
├── INNER JOIN (2 tables)
├── Multiple INNER JOINs (3+ tables)
├── JOIN with WHERE conditions
├── JOIN with aggregates (COUNT, SUM)
├── JOIN with GROUP BY
└── JOIN with ORDER BY + LIMIT

📗 Subqueries (Introduction)
├── Subquery in WHERE (IN, NOT IN)
├── Subquery for comparisons (>, <, =)
├── Subquery with aggregates (AVG, MAX)
└── EXISTS clause

Example: "Find customers who spent more than average"


┌─────────────────────────────────────────────────────────────────┐
│                      📙 ADVANCED LEVEL                           │
│                         (21 tasks)                               │
└─────────────────────────────────────────────────────────────────┘

📙 Advanced Subqueries
├── Correlated subqueries
├── Subqueries in SELECT clause
├── Multiple subqueries in one query
├── NOT EXISTS
└── Complex nested subqueries

📙 CTEs (Common Table Expressions)
├── Simple CTE (single)
├── Multiple CTEs
├── CTE with JOINs
├── CTE with aggregates
└── 🔥 Recursive CTE (tree traversal)

📙 Advanced JOINs
├── LEFT JOIN (outer join)
├── RIGHT JOIN
├── SELF JOIN (same table twice)
├── CROSS JOIN (cartesian product)
└── Multiple complex JOINs

Example: "Use CTE to calculate category hierarchy with sales"


┌─────────────────────────────────────────────────────────────────┐
│                       🔥 EXPERT LEVEL                            │
│                         (13 tasks)                               │
└─────────────────────────────────────────────────────────────────┘

🔥 Window Functions
├── ROW_NUMBER() - assign sequential numbers
├── RANK() - ranking with gaps
├── DENSE_RANK() - ranking without gaps
├── PARTITION BY - separate ranking per group
├── Running totals - SUM() OVER (ORDER BY)
├── Moving average - AVG() OVER (ROWS BETWEEN)
├── LAG() / LEAD() - previous/next row values
├── FIRST_VALUE() / LAST_VALUE()
└── NTILE() - divide into buckets (quartiles)

🔥 Advanced Analytics
├── Customer Lifetime Value (CLV)
├── Cohort Analysis
├── Retention Analysis
├── Growth Rate Calculation (month-over-month)
├── Product Performance Analytics
├── Multi-dimensional Reporting
├── Complex Conditional Logic
└── Date-based Time Series Analysis

🔥 Complex Multi-Table Queries
├── 4+ table JOINs
├── CTE + Window Functions combined
├── Hierarchical data with recursion
├── Dynamic segmentation
└── Real-world business metrics

Example: "Calculate customer quartiles by spending with growth rate"
```

---

## 🎯 Recommended Learning Order

### Phase 1: Foundation (Week 1-2)
1. Complete all **SELECT** tasks
2. Master filtering, sorting, patterns
3. Understand NULL handling
4. Get comfortable with multiple conditions

### Phase 2: Aggregation & Joins (Week 3-4)
1. Work through **GROUP BY** tasks
2. Learn aggregate functions
3. Master **INNER JOIN** with 2-3 tables
4. Combine JOINs with aggregation

### Phase 3: Subqueries & CTEs (Week 5-6)
1. Start with simple **SUBQUERY** tasks
2. Progress to correlated subqueries
3. Learn **CTE** syntax
4. Try recursive CTE (challenging!)

### Phase 4: Window Functions (Week 7-8)
1. Begin with **ROW_NUMBER** and **RANK**
2. Master **PARTITION BY**
3. Learn running totals
4. Try **LAG/LEAD** for comparisons

### Phase 5: Advanced Analytics (Week 9-10)
1. Combine all learned concepts
2. Solve real-world business problems
3. Optimize query performance
4. Master complex **ADVANCED** tasks

---

## 📊 Task Distribution by Database

### 🎵 Music Database (Original)
- SELECT: 8 tasks
- JOIN: 9 tasks
- Subqueries: 0 tasks
**Total: 17 tasks** (Beginner-Intermediate)

### 💼 Accounting Database (Original)
- SELECT: 15 tasks
- GROUP BY: 4 tasks
- JOIN: 4 tasks
**Total: 23 tasks** (Beginner-Intermediate)

### 🛒 E-Commerce Database (NEW!)
- Subqueries: 8 tasks
- CTEs: 5 tasks
- Window Functions: 8 tasks
- Advanced Aggregates: 4 tasks
- Advanced SQL: 13 tasks
**Total: 38 tasks** (Intermediate-Expert) ⭐

---

## 🏆 Skill Progression

```
Level 1: SQL Novice           ━━━━━━━━━━░░░░░░░░░░  (SELECT tasks)
Level 2: Data Analyst         ━━━━━━━━━━━━━━░░░░░░  (GROUP BY + JOIN)
Level 3: SQL Developer        ━━━━━━━━━━━━━━━━━░░░  (Subqueries + CTE)
Level 4: Data Engineer        ━━━━━━━━━━━━━━━━━━░░  (Window Functions)
Level 5: SQL Master 🏆        ━━━━━━━━━━━━━━━━━━━━  (Advanced Analytics)
```

---

## 💡 Key Concepts by Category

### SELECT
`WHERE`, `ORDER BY`, `LIMIT`, `LIKE`, `BETWEEN`, `AND/OR`, `NULL`

### GROUP BY
`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`, `HAVING`

### JOIN
`INNER JOIN`, `LEFT JOIN`, `SELF JOIN`, `CROSS JOIN`, Multiple JOINs

### SUBQUERY
`IN`, `NOT IN`, `EXISTS`, `Correlated`, `Scalar subquery`

### CTE
`WITH`, `Multiple CTEs`, `RECURSIVE`

### WINDOW
`ROW_NUMBER`, `RANK`, `DENSE_RANK`, `PARTITION BY`, `LAG`, `LEAD`, `SUM() OVER`, `NTILE`

### ADVANCED
`CLV`, `Cohort Analysis`, `Growth Metrics`, `Multi-table Analytics`

---

## 🎓 Certification Path

**Bronze** (30 tasks) - SQL Fundamentals ✅
**Silver** (50 tasks) - Intermediate SQL ✅
**Gold** (70 tasks) - Advanced SQL ✅
**Platinum** (78 tasks) - SQL Master 🏆

Complete all 78 tasks to become a SQL Master! 🚀

---

## 📈 Difficulty Curve

```
Difficulty
    ▲
10  │                                          ╱╲
    │                                     ╱────  ╲
 8  │                                ╱────         ╲
    │                           ╱────               ╲
 6  │                      ╱────                      ╲
    │                 ╱────                            ╲
 4  │            ╱────                                  ╲
    │       ╱────                                        ╲
 2  │  ╱────                                              ╲
    │──────────────────────────────────────────────────────▶
    0    15    30    45    60    78                Tasks
    
    └──┘  └──┘  └──┘  └──┘  └──┘
   SELECT  JOIN  SUB   CTE   WINDOW+ADV
```

The learning curve is designed to be **progressive and rewarding**!

---

**Start your journey to SQL mastery! 🎯**
