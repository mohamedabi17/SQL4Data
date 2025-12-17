


# SQL Trainer - Modern UI & Comprehensive SQL Learning Platform

## 🎨 Recent UI Modernization

### Design System Updates

**Modern Color Palette**
- Updated to contemporary Tailwind slate-based colors
- Added vibrant blue, purple, and amber accent colors
- Improved contrast and accessibility
- Smooth gradient backgrounds with glass-morphism effects

**Typography Enhancements**
- Enhanced Inter font with improved line-height and letter-spacing
- Replaced Source Code Pro with modern monospace stack (JetBrains Mono / Fira Code)
- Added new heading scales (h1, h2) with proper font weights
- Better readability with optimized text sizing

**Visual Effects**
- Added modern shadow system (soft, medium, hard, glow effects)
- Glass-morphism effects with backdrop blur
- Smooth transitions and hover states
- Gradient text effects for emphasis
- Modern card components with rounded corners (2xl, 3xl)

### Removed Dependencies
- ❌ **Source Code Pro font family** - Removed all font files and references
- Replaced with system monospace fonts for better performance

---

## 📚 SQL Learning Content Expansion

### New Database: E-Commerce Platform

A comprehensive, realistic e-commerce database with **7 interconnected tables**:

1. **customers** - Customer profiles with loyalty tiers
2. **products** - Product catalog with pricing and inventory
3. **categories** - Hierarchical category structure (self-referencing)
4. **orders** - Order transactions with status tracking
5. **order_items** - Line items with discounts
6. **suppliers** - Supplier information
7. **reviews** - Product reviews and ratings

**Database Features:**
- Complex relationships (1-to-many, many-to-many via junction table)
- Self-referencing foreign key (category hierarchy)
- Rich sample data (~100+ records)
- Real-world scenarios (discounts, loyalty programs, multi-country)

---

## 🎓 Expanded SQL Task Categories

### Original Topics (Enhanced)
- ✅ **SELECT** - 23 tasks (basic queries, filtering, ordering, LIKE, NULL handling)
- ✅ **GROUP BY** - 4 tasks (aggregation, HAVING, ordering)
- ✅ **JOIN** - 13 tasks (INNER, LEFT, self-joins, multiple joins)

### 🆕 NEW Advanced Topics (SQL2/SQL3)

#### **SUBQUERIES** (8 tasks)
- Simple subqueries (IN, NOT IN, comparison operators)
- Correlated subqueries
- EXISTS clause
- Subqueries in SELECT, WHERE, and FROM clauses

**Example Tasks:**
- Find products above average price
- Customers who never ordered
- Most expensive product per category
- Products with above-average reviews

#### **CTEs - Common Table Expressions** (5 tasks)
- Simple CTEs for query readability
- Multiple CTEs in a single query
- **Recursive CTEs** for hierarchical data

**Example Tasks:**
- Customer sales summaries
- Category revenue analysis
- Recursive category tree traversal

#### **WINDOW FUNCTIONS** (8 tasks)
- ROW_NUMBER, RANK, DENSE_RANK
- Running totals and cumulative sums
- Moving averages (ROWS BETWEEN)
- LAG / LEAD for time-series analysis
- FIRST_VALUE / LAST_VALUE
- NTILE for quartile segmentation
- PARTITION BY for grouped analytics

**Example Tasks:**
- Rank products by price within categories
- Calculate running total of sales
- 3-period moving average
- Customer spending quartiles

#### **ADVANCED AGGREGATES** (4 tasks)
- Complex HAVING clauses
- Multiple aggregate functions
- GROUP BY with multiple columns
- Conditional aggregation with CASE

#### **ADVANCED SQL** (13 tasks)
Complex multi-table queries combining multiple concepts:
- Customer lifetime value (CLV) analysis
- Product performance by supplier
- Monthly sales trends with growth rates
- Customer retention and cohort analysis
- Discount impact analysis
- Stock alert systems with categorization
- Payment method preferences
- Category hierarchy with sales rollup

---

## 📊 Complete Task Statistics

| Category | Task Count | Difficulty |
|----------|------------|------------|
| SELECT | 23 | Beginner |
| GROUP BY | 4 | Beginner-Intermediate |
| JOIN | 13 | Intermediate |
| SUBQUERY | 8 | Intermediate |
| CTE | 5 | Intermediate-Advanced |
| WINDOW | 8 | Advanced |
| AGGREGATE | 4 | Intermediate |
| ADVANCED | 13 | Advanced-Expert |

**Total: 78 SQL Tasks** (previously 40)

---

## 🌐 Internationalization

Both English and Russian translations updated with:
- All new task categories
- Descriptions for 38 new tasks
- Updated UI terminology

---

## 🚀 What's Next?

**To run the project:**
```bash
npm install
npm run dev
```

**To build for production:**
```bash
npm run build
```

---

## 💡 Key Features

- ✨ **Modern, gradient-based UI** with glass-morphism
- 📚 **78 progressive SQL tasks** from beginner to expert
- 🗄️ **3 realistic databases** (Music, Accounting, E-Commerce)
- 🌍 **Bilingual** (English / Russian)
- 🎯 **Interactive learning** with instant validation
- 📊 **Real-world scenarios** (e-commerce, analytics, reporting)
- 🔥 **Latest SQL features** (CTEs, Window Functions, Advanced Joins)

---

## 🎨 Design Philosophy

The new design focuses on:
- **Clarity** - Clean, uncluttered interface
- **Modernity** - Contemporary colors and effects
- **Performance** - Removed heavy fonts, optimized assets
- **Accessibility** - Improved contrast and readability
- **Delight** - Smooth animations and visual feedback

---

## 📖 Learning Path

1. **Beginner** → SELECT queries (filtering, sorting, patterns)
2. **Intermediate** → GROUP BY, Aggregations, Basic JOINs
3. **Advanced** → Multiple JOINs, Subqueries, CTEs
4. **Expert** → Window Functions, Complex Analytics, Performance Optimization

---

## 🔧 Technical Stack

- **React** + **TypeScript**
- **Tailwind CSS** (modern configuration)
- **SQL.js** (SQLite in the browser)
- **Vite** (build tool)
- **i18next** (internationalization)

---

## 📝 License

MIT License - See LICENSE file for details

---

**Happy SQL Learning! 🚀**
