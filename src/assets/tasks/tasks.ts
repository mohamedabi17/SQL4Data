import { DatabaseId } from "../databases/databases";

export type TaskTopic = "select" | "groupBy" | "join" | "subquery" | "cte" | "window" | "advanced" | "aggregate";

export interface Task {
  id: string;
  topic: TaskTopic;
  database: DatabaseId;
  referenceSql: string;
  tables: string[];
}

export const tasksList: Task[] = [
  // Simple select *
  {
    id: "select_all_invoices",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM invoices;",
    tables: ["invoices"],
  },
  {
    id: "select_all_artists",
    topic: "select",
    database: "music",
    referenceSql: "SELECT * FROM artists;",
    tables: ["artists"],
  },
  // Select with attributes
  {
    id: "select_all_artists_names",
    topic: "select",
    database: "music",
    referenceSql: "SELECT name FROM artists;",
    tables: ["artists"],
  },
  {
    id: "select_first_and_last_name_of_employees",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT first_name, last_name FROM employees;",
    tables: ["employees"],
  },
  // Select with ordering
  {
    id: "select_employees_sorted_by_hire_date_desc",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM employees ORDER BY hire_date DESC;",
    tables: ["employees"],
  },
  {
    id: "select_first_and_last_name_of_employees_sorted_by_hire_date_asc",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT first_name, last_name FROM employees ORDER BY hire_date ASC;",
    tables: ["employees"],
  },
  {
    id: "select_names_and_length_of_tracks_sorted_by_names_and_milliseconds",
    topic: "select",
    database: "music",
    referenceSql:
      "SELECT name, milliseconds FROM tracks ORDER BY name ASC, milliseconds DESC;",
    tables: ["tracks"],
  },
  // Select with simple where
  {
    id: "select_employees_title_support_agent",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT first_name, last_name FROM employees WHERE title = 'Sales Support Agent';",
    tables: ["employees"],
  },
  // Select with where >, < and between
  {
    id: "select_tracks_bigger_than_100000000_bytes",
    topic: "select",
    database: "music",
    referenceSql: "SELECT name FROM tracks WHERE bytes > 100000000;",
    tables: ["tracks"],
  },
  {
    id: "select_tracks_smaller_than_500000_bytes",
    topic: "select",
    database: "music",
    referenceSql: "SELECT name FROM tracks WHERE bytes < 500000;",
    tables: ["tracks"],
  },
  {
    id: "select_tracks_between_500000_and_5000000_bytes",
    topic: "select",
    database: "music",
    referenceSql:
      "SELECT name FROM tracks WHERE bytes BETWEEN 500000 AND 5000000;",
    tables: ["tracks"],
  },
  // Select with dates
  {
    id: "select_employees_before_15_feb_2011",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT hire_date, first_name, last_name FROM employees WHERE hire_date < '2011-02-15';",
    tables: ["employees"],
  },
  // Select with LIKE
  {
    id: "select_employees_last_names_starting_with_A",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM employees WHERE last_name LIKE 'A%';",
    tables: ["employees"],
  },
  {
    id: "select_employees_first_names_ending_with_a",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM employees WHERE first_name LIKE '%a';",
    tables: ["employees"],
  },
  {
    id: "select_employees_with_address_contains_Ave",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM employees WHERE address LIKE '%Ave%';",
    tables: ["employees"],
  },
  // Select with AND and OR
  {
    id: "select_invoices_from_canada_ab",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT * FROM invoices WHERE billing_country = 'Canada' AND billing_state = 'AB';",
    tables: ["invoices"],
  },
  {
    id: "select_invoices_from_nv_reno_with_total_more_than_5",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT * FROM invoices WHERE billing_state = 'NV' AND billing_city = 'Reno' AND total > 5;",
    tables: ["invoices"],
  },
  {
    id: "select_invoices_from_states_nv_or_ab",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT * FROM invoices WHERE billing_state = 'NV' OR billing_state = 'AB';",
    tables: ["invoices"],
  },
  // Select with NULL
  {
    id: "select_tracks_without_composer",
    topic: "select",
    database: "music",
    referenceSql: "SELECT * FROM tracks WHERE composer IS NULL;",
    tables: ["tracks"],
  },
  {
    id: "select_customers_with_company",
    topic: "select",
    database: "accounting",
    referenceSql: "SELECT * FROM customers WHERE company IS NOT NULL;",
    tables: ["customers"],
  },
  // Select ordered tops
  {
    id: "select_invoices_germany_ordered_total_desc_limit_3",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT * FROM invoices WHERE billing_country = 'Germany' ORDER BY total DESC LIMIT 3;",
    tables: ["invoices"],
  },
  {
    id: "select_billing_address_invoices_ca_cupertino_ordered_total_desc_limit_3",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT billing_address FROM invoices WHERE billing_state = 'CA' AND billing_city = 'Cupertino' ORDER BY total DESC LIMIT 3;",
    tables: ["invoices"],
  },
  {
    id: "select_id_invoices_ca_cupertino_or_mountain_view",
    topic: "select",
    database: "accounting",
    referenceSql:
      "SELECT id FROM invoices WHERE billing_state = 'CA' AND (billing_city = 'Mountain View' OR billing_city = 'Cupertino') ORDER BY total ASC LIMIT 1;",
    tables: ["invoices"],
  },
  // Select count group by
  {
    id: "count_customers_by_country",
    topic: "groupBy",
    database: "accounting",
    referenceSql: "SELECT country, COUNT(*) FROM customers GROUP BY country;",
    tables: ["customers"],
  },
  {
    id: "count_tracks_by_unit_price",
    topic: "groupBy",
    database: "music",
    referenceSql:
      "SELECT unit_price, COUNT(*) FROM tracks GROUP BY unit_price;",
    tables: ["tracks"],
  },
  // Select count group by ordered
  {
    id: "count_tracks_by_unit_price_ordered_asc",
    topic: "groupBy",
    database: "music",
    referenceSql:
      "SELECT unit_price, COUNT(*) FROM tracks GROUP BY unit_price ORDER BY COUNT(*) ASC;",
    tables: ["tracks"],
  },
  // Select count group by ordered limited
  {
    id: "count_tracks_by_unit_price_ordered_asc_limit_1",
    topic: "groupBy",
    database: "music",
    referenceSql:
      "SELECT unit_price, COUNT(*) FROM tracks GROUP BY unit_price ORDER BY COUNT(*) ASC LIMIT 1;",
    tables: ["tracks"],
  },
  // Join
  {
    id: "join_artists_names_and_album_titles",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT artists.name, albums.title FROM artists JOIN albums ON albums.artist_id = artists.id;",
    tables: ["artists", "albums"],
  },
  {
    id: "join_album_titles_and_tracks_titles",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT tracks.name, albums.title FROM albums JOIN tracks ON tracks.album_id = albums.id;",
    tables: ["tracks", "albums"],
  },
  // Join ordered
  {
    id: "join_artists_names_and_album_titles_ordered_artists_name_desc",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT artists.name, albums.title FROM artists JOIN albums ON albums.artist_id = artists.id ORDER BY artists.name DESC;",
    tables: ["artists", "albums"],
  },
  {
    id: "join_customer_name_and_total_ordered_by_total",
    topic: "join",
    database: "accounting",
    referenceSql:
      "SELECT customers.first_name, customers.last_name, invoices.total FROM customers JOIN invoices ON customers.id = invoices.customer_id ORDER BY invoices.total DESC;",
    tables: ["customers", "invoices"],
  },
  // Join where
  {
    id: "select_all_aerosmith_albums",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT albums.title FROM albums JOIN artists ON artists.id = albums.artist_id WHERE artists.name = 'Aerosmith';",
    tables: ["albums", "artists"],
  },
  {
    id: "select_all_albums_with_midnight_track",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT albums.title FROM albums JOIN tracks ON tracks.album_id = albums.id WHERE tracks.name = 'Midnight';",
    tables: ["albums", "tracks"],
  },
  // Double join
  {
    id: "select_all_artists_with_midnight_track",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT artists.name FROM artists JOIN albums ON artists.id = albums.artist_id JOIN tracks ON tracks.album_id = albums.id WHERE tracks.name = 'Midnight';",
    tables: ["artists", "albums", "tracks"],
  },
  // Join count
  {
    id: "count_iron_maiden_albums",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT COUNT(*) FROM albums JOIN artists ON artists.id = albums.artist_id WHERE artists.name = 'Iron Maiden';",
    tables: ["artists", "albums"],
  },
  // Join group by
  {
    id: "count_each_albums_of_artists",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT artists.name, COUNT(*) FROM artists JOIN albums ON artists.id = albums.artist_id GROUP BY artists.id;",
    tables: ["artists", "albums"],
  },
  {
    id: "artist_with_max_albums",
    topic: "join",
    database: "music",
    referenceSql:
      "SELECT artists.name, COUNT(*) FROM artists JOIN albums ON artists.id = albums.artist_id GROUP BY artists.id ORDER BY COUNT(*) DESC LIMIT 1;",
    tables: ["artists", "albums"],
  },
  // Join aggregate
  {
    id: "select_top5_clients_with_most_sum_of_invoices",
    topic: "join",
    database: "accounting",
    referenceSql:
      "SELECT customers.first_name, customers.last_name, SUM(invoices.total) AS sum FROM customers JOIN invoices ON customers.id = invoices.customer_id GROUP BY customers.id ORDER BY sum DESC LIMIT 5;",
    tables: ["customers", "invoices"],
  },

  // ========================================
  // SUBQUERY CHALLENGES
  // ========================================

  // Simple subqueries
  {
    id: "select_products_above_average_price",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products);",
    tables: ["products"],
  },
  {
    id: "select_customers_with_orders",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT first_name, last_name FROM customers WHERE customer_id IN (SELECT DISTINCT customer_id FROM orders);",
    tables: ["customers", "orders"],
  },
  {
    id: "select_products_never_ordered",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT product_name FROM products WHERE product_id NOT IN (SELECT DISTINCT product_id FROM order_items);",
    tables: ["products", "order_items"],
  },
  {
    id: "select_most_expensive_product_per_category",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT p.product_name, p.price, c.category_name FROM products p JOIN categories c ON p.category_id = c.category_id WHERE p.price = (SELECT MAX(price) FROM products WHERE category_id = p.category_id);",
    tables: ["products", "categories"],
  },

  // Correlated subqueries
  {
    id: "select_customers_above_average_spending",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT c.first_name, c.last_name, (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.customer_id) as total_spent FROM customers c WHERE (SELECT SUM(total_amount) FROM orders WHERE customer_id = c.customer_id) > (SELECT AVG(total_amount) FROM orders);",
    tables: ["customers", "orders"],
  },
  {
    id: "select_products_with_above_average_reviews",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT p.product_name, (SELECT AVG(rating) FROM reviews WHERE product_id = p.product_id) as avg_rating FROM products p WHERE (SELECT AVG(rating) FROM reviews WHERE product_id = p.product_id) > (SELECT AVG(rating) FROM reviews);",
    tables: ["products", "reviews"],
  },

  // EXISTS subqueries
  {
    id: "select_suppliers_with_low_stock_products",
    topic: "subquery",
    database: "ecommerce",
    referenceSql:
      "SELECT supplier_name FROM suppliers s WHERE EXISTS (SELECT 1 FROM products WHERE supplier_id = s.supplier_id AND stock_quantity < 20);",
    tables: ["suppliers", "products"],
  },

  // ========================================
  // COMMON TABLE EXPRESSIONS (CTE)
  // ========================================

  {
    id: "cte_total_sales_per_customer",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH customer_sales AS (SELECT customer_id, SUM(total_amount) as total FROM orders GROUP BY customer_id) SELECT c.first_name, c.last_name, cs.total FROM customers c JOIN customer_sales cs ON c.customer_id = cs.customer_id ORDER BY cs.total DESC;",
    tables: ["customers", "orders"],
  },
  {
    id: "cte_category_revenue",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH category_sales AS (SELECT c.category_name, SUM(oi.quantity * oi.unit_price) as revenue FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_id) SELECT * FROM category_sales ORDER BY revenue DESC;",
    tables: ["categories", "products", "order_items"],
  },
  {
    id: "cte_top_customers_by_tier",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH tier_spending AS (SELECT loyalty_tier, AVG(total_amount) as avg_order FROM customers JOIN orders ON customers.customer_id = orders.customer_id GROUP BY loyalty_tier) SELECT * FROM tier_spending ORDER BY avg_order DESC;",
    tables: ["customers", "orders"],
  },

  // Multiple CTEs
  {
    id: "cte_multiple_customer_product_stats",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH customer_stats AS (SELECT customer_id, COUNT(*) as order_count, SUM(total_amount) as total_spent FROM orders GROUP BY customer_id), product_stats AS (SELECT product_id, SUM(quantity) as total_sold FROM order_items GROUP BY product_id) SELECT c.first_name, c.last_name, cs.order_count, cs.total_spent FROM customers c JOIN customer_stats cs ON c.customer_id = cs.customer_id WHERE cs.order_count > 2;",
    tables: ["customers", "orders", "order_items"],
  },

  // Recursive CTE
  {
    id: "cte_recursive_category_hierarchy",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH RECURSIVE category_path AS (SELECT category_id, category_name, parent_category_id, category_name as path FROM categories WHERE parent_category_id IS NULL UNION ALL SELECT c.category_id, c.category_name, c.parent_category_id, cp.path || ' > ' || c.category_name FROM categories c JOIN category_path cp ON c.parent_category_id = cp.category_id) SELECT * FROM category_path;",
    tables: ["categories"],
  },

  // ========================================
  // WINDOW FUNCTIONS
  // ========================================

  {
    id: "window_row_number_customers_by_registration",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT first_name, last_name, registration_date, ROW_NUMBER() OVER (ORDER BY registration_date) as row_num FROM customers;",
    tables: ["customers"],
  },
  {
    id: "window_rank_products_by_price",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT product_name, price, RANK() OVER (ORDER BY price DESC) as price_rank FROM products;",
    tables: ["products"],
  },
  {
    id: "window_dense_rank_products_by_category",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT product_name, category_id, price, DENSE_RANK() OVER (PARTITION BY category_id ORDER BY price DESC) as category_rank FROM products;",
    tables: ["products"],
  },
  {
    id: "window_running_total_orders",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_id, order_date, total_amount, SUM(total_amount) OVER (ORDER BY order_date) as running_total FROM orders;",
    tables: ["orders"],
  },
  {
    id: "window_moving_average_sales",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_date, total_amount, AVG(total_amount) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as moving_avg FROM orders;",
    tables: ["orders"],
  },
  {
    id: "window_lead_lag_order_comparison",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, order_date, total_amount, LAG(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as previous_order, LEAD(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as next_order FROM orders;",
    tables: ["orders"],
  },
  {
    id: "window_first_last_value_customer_orders",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, order_date, total_amount, FIRST_VALUE(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) as first_order_amount, LAST_VALUE(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as last_order_amount FROM orders;",
    tables: ["orders"],
  },
  {
    id: "window_ntile_customer_segments",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, SUM(total_amount) as total_spent, NTILE(4) OVER (ORDER BY SUM(total_amount) DESC) as quartile FROM orders GROUP BY customer_id;",
    tables: ["orders"],
  },

  // ========================================
  // ADVANCED AGGREGATE FUNCTIONS
  // ========================================

  {
    id: "aggregate_having_clause",
    topic: "aggregate",
    database: "ecommerce",
    referenceSql:
      "SELECT category_id, AVG(price) as avg_price FROM products GROUP BY category_id HAVING AVG(price) > 500;",
    tables: ["products"],
  },
  {
    id: "aggregate_multiple_functions",
    topic: "aggregate",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, COUNT(*) as order_count, MIN(total_amount) as min_order, MAX(total_amount) as max_order, AVG(total_amount) as avg_order FROM orders GROUP BY customer_id;",
    tables: ["orders"],
  },
  {
    id: "aggregate_group_by_multiple_columns",
    topic: "aggregate",
    database: "ecommerce",
    referenceSql:
      "SELECT country, loyalty_tier, COUNT(*) as customer_count FROM customers GROUP BY country, loyalty_tier ORDER BY country, loyalty_tier;",
    tables: ["customers"],
  },
  {
    id: "aggregate_conditional_count",
    topic: "aggregate",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, COUNT(*) as total_orders, SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders FROM orders GROUP BY customer_id;",
    tables: ["orders"],
  },

  // ========================================
  // ADVANCED JOIN TECHNIQUES
  // ========================================

  {
    id: "join_left_outer_customers_orders",
    topic: "join",
    database: "ecommerce",
    referenceSql:
      "SELECT c.first_name, c.last_name, COUNT(o.order_id) as order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id;",
    tables: ["customers", "orders"],
  },
  {
    id: "join_self_find_customers_same_city",
    topic: "join",
    database: "ecommerce",
    referenceSql:
      "SELECT DISTINCT c1.first_name || ' ' || c1.last_name as customer1, c2.first_name || ' ' || c2.last_name as customer2, c1.city FROM customers c1 JOIN customers c2 ON c1.city = c2.city AND c1.customer_id < c2.customer_id;",
    tables: ["customers"],
  },
  {
    id: "join_cross_product_combinations",
    topic: "join",
    database: "ecommerce",
    referenceSql:
      "SELECT c.category_name, s.supplier_name FROM categories c CROSS JOIN suppliers s WHERE c.parent_category_id IS NULL LIMIT 10;",
    tables: ["categories", "suppliers"],
  },

  // ========================================
  // COMPLEX MULTI-TABLE QUERIES
  // ========================================

  {
    id: "advanced_top_selling_products",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT p.product_name, c.category_name, SUM(oi.quantity) as total_sold, SUM(oi.quantity * oi.unit_price) as revenue FROM products p JOIN categories c ON p.category_id = c.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id ORDER BY total_sold DESC LIMIT 5;",
    tables: ["products", "categories", "order_items"],
  },
  {
    id: "advanced_customer_lifetime_value",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.first_name, c.last_name, c.loyalty_tier, COUNT(DISTINCT o.order_id) as total_orders, SUM(o.total_amount) as lifetime_value, AVG(o.total_amount) as avg_order_value FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY lifetime_value DESC;",
    tables: ["customers", "orders"],
  },
  {
    id: "advanced_product_performance_by_supplier",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT s.supplier_name, COUNT(DISTINCT p.product_id) as product_count, SUM(oi.quantity) as total_units_sold, SUM(oi.quantity * oi.unit_price) as total_revenue FROM suppliers s JOIN products p ON s.supplier_id = p.supplier_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY s.supplier_id ORDER BY total_revenue DESC;",
    tables: ["suppliers", "products", "order_items"],
  },
  {
    id: "advanced_monthly_sales_trend",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT strftime('%Y-%m', order_date) as month, COUNT(*) as order_count, SUM(total_amount) as monthly_revenue, AVG(total_amount) as avg_order_value FROM orders GROUP BY month ORDER BY month;",
    tables: ["orders"],
  },
  {
    id: "advanced_customer_retention_analysis",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.customer_id, c.first_name, c.last_name, COUNT(o.order_id) as order_count, MIN(o.order_date) as first_order, MAX(o.order_date) as last_order, julianday(MAX(o.order_date)) - julianday(MIN(o.order_date)) as customer_lifespan_days FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id HAVING order_count > 1;",
    tables: ["customers", "orders"],
  },
  {
    id: "advanced_product_review_analysis",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT p.product_name, COUNT(r.review_id) as review_count, AVG(r.rating) as avg_rating, SUM(oi.quantity) as units_sold FROM products p LEFT JOIN reviews r ON p.product_id = r.product_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id HAVING review_count > 0 ORDER BY avg_rating DESC, review_count DESC;",
    tables: ["products", "reviews", "order_items"],
  },
  {
    id: "advanced_category_hierarchy_sales",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT parent.category_name as parent_category, child.category_name as child_category, COUNT(DISTINCT p.product_id) as product_count, SUM(oi.quantity * oi.unit_price) as revenue FROM categories parent LEFT JOIN categories child ON parent.category_id = child.parent_category_id JOIN products p ON child.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id WHERE parent.parent_category_id IS NULL GROUP BY parent.category_id, child.category_id ORDER BY revenue DESC;",
    tables: ["categories", "products", "order_items"],
  },
  {
    id: "advanced_discount_impact_analysis",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT CASE WHEN discount > 0 THEN 'Discounted' ELSE 'Full Price' END as pricing_type, COUNT(*) as order_count, SUM(quantity) as units_sold, SUM(quantity * unit_price) as gross_revenue, SUM(discount) as total_discount FROM order_items GROUP BY pricing_type;",
    tables: ["order_items"],
  },
  {
    id: "advanced_payment_method_preference",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT payment_method, COUNT(*) as transaction_count, SUM(total_amount) as total_revenue, AVG(total_amount) as avg_transaction, MIN(total_amount) as min_transaction, MAX(total_amount) as max_transaction FROM orders GROUP BY payment_method ORDER BY total_revenue DESC;",
    tables: ["orders"],
  },
  {
    id: "advanced_stock_alert_system",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT p.product_name, p.stock_quantity, s.supplier_name, CASE WHEN p.stock_quantity = 0 THEN 'Out of Stock' WHEN p.stock_quantity < 20 THEN 'Low Stock' WHEN p.stock_quantity < 50 THEN 'Medium Stock' ELSE 'Well Stocked' END as stock_status FROM products p JOIN suppliers s ON p.supplier_id = s.supplier_id ORDER BY p.stock_quantity ASC;",
    tables: ["products", "suppliers"],
  },

  // ========================================
  // COMPLEX CTE + WINDOW FUNCTIONS
  // ========================================

  {
    id: "advanced_cte_window_customer_ranking",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "WITH customer_metrics AS (SELECT c.customer_id, c.first_name, c.last_name, c.loyalty_tier, SUM(o.total_amount) as total_spent, COUNT(o.order_id) as order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id) SELECT *, RANK() OVER (ORDER BY total_spent DESC) as spending_rank, RANK() OVER (PARTITION BY loyalty_tier ORDER BY total_spent DESC) as tier_rank FROM customer_metrics;",
    tables: ["customers", "orders"],
  },
  {
    id: "advanced_sales_growth_rate",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "WITH monthly_sales AS (SELECT strftime('%Y-%m', order_date) as month, SUM(total_amount) as revenue FROM orders GROUP BY month) SELECT month, revenue, LAG(revenue) OVER (ORDER BY month) as prev_month_revenue, ROUND(((revenue - LAG(revenue) OVER (ORDER BY month)) / LAG(revenue) OVER (ORDER BY month)) * 100, 2) as growth_rate FROM monthly_sales;",
    tables: ["orders"],
  },
  {
    id: "advanced_product_cohort_analysis",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "WITH first_purchase AS (SELECT customer_id, MIN(order_date) as first_order_date FROM orders GROUP BY customer_id) SELECT strftime('%Y-%m', fp.first_order_date) as cohort_month, COUNT(DISTINCT fp.customer_id) as cohort_size, COUNT(DISTINCT CASE WHEN o.order_date <= date(fp.first_order_date, '+30 days') THEN o.customer_id END) as retained_30days FROM first_purchase fp LEFT JOIN orders o ON fp.customer_id = o.customer_id GROUP BY cohort_month ORDER BY cohort_month;",
    tables: ["orders"],
  },

  // ========================================
  // SQL3 / OLAP FUNCTIONS
  // ========================================

  {
    id: "sql3_rollup_sales_hierarchy",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.country, c.city, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.country, c.city UNION ALL SELECT c.country, NULL as city, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.country UNION ALL SELECT NULL as country, NULL as city, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id ORDER BY country, city;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_cube_multi_dimensional",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.loyalty_tier, strftime('%Y', o.order_date) as year, COUNT(*) as order_count, SUM(o.total_amount) as revenue FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.loyalty_tier, strftime('%Y', o.order_date);",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_grouping_sets_flexible",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.country, NULL as loyalty_tier, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.country UNION ALL SELECT NULL as country, c.loyalty_tier, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.loyalty_tier UNION ALL SELECT c.country, c.loyalty_tier, SUM(o.total_amount) as total_sales FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.country, c.loyalty_tier;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_ntile_quartiles",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT c.customer_id, c.first_name, c.last_name, SUM(o.total_amount) as total_spent, NTILE(4) OVER (ORDER BY SUM(o.total_amount) DESC) as spending_quartile FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id ORDER BY total_spent DESC;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_first_last_value",
    topic: "window",
    database: "music",
    referenceSql:
      "SELECT a.title as album_name, t.name as track_name, t.milliseconds, FIRST_VALUE(t.name) OVER (PARTITION BY a.id ORDER BY t.milliseconds DESC) as longest_track, LAST_VALUE(t.name) OVER (PARTITION BY a.id ORDER BY t.milliseconds DESC ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) as shortest_track FROM tracks t JOIN albums a ON t.album_id = a.id ORDER BY a.id, t.milliseconds DESC;",
    tables: ["albums", "tracks"],
  },
  {
    id: "sql3_nth_value",
    topic: "window",
    database: "music",
    referenceSql:
      "SELECT name, bytes, NTH_VALUE(name, 3) OVER (ORDER BY bytes DESC) as third_largest_track FROM tracks;",
    tables: ["tracks"],
  },
  {
    id: "sql3_percent_rank",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, total_spent, PERCENT_RANK() OVER (ORDER BY total_spent) as percentile FROM (SELECT c.customer_id, SUM(o.total_amount) as total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id) sub;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_cume_dist",
    topic: "window",
    database: "music",
    referenceSql:
      "SELECT name, milliseconds, CUME_DIST() OVER (ORDER BY milliseconds) as cumulative_distribution FROM tracks WHERE milliseconds > 200000;",
    tables: ["tracks"],
  },
  {
    id: "sql3_lateral_join",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT c.customer_id, c.first_name, c.last_name, (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id AND o.order_date >= date('now', '-90 days')) as order_count FROM customers c WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.customer_id AND o.order_date >= date('now', '-90 days')) > 0;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_window_range_preceding",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_date, total_amount, AVG(total_amount) OVER (ORDER BY order_date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day_avg FROM orders ORDER BY order_date;",
    tables: ["orders"],
  },
  {
    id: "sql3_pivot_simulation",
    topic: "advanced",
    database: "ecommerce",
    referenceSql:
      "SELECT strftime('%Y', order_date) as year, SUM(CASE WHEN strftime('%m', order_date) = '01' THEN total_amount ELSE 0 END) as Jan, SUM(CASE WHEN strftime('%m', order_date) = '02' THEN total_amount ELSE 0 END) as Feb, SUM(CASE WHEN strftime('%m', order_date) = '03' THEN total_amount ELSE 0 END) as Mar, SUM(CASE WHEN strftime('%m', order_date) = '04' THEN total_amount ELSE 0 END) as Apr FROM orders GROUP BY year;",
    tables: ["orders"],
  },
  {
    id: "sql3_recursive_numbers",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH RECURSIVE numbers AS (SELECT 1 as n UNION ALL SELECT n + 1 FROM numbers WHERE n < 10) SELECT n, n * n as square, n * n * n as cube FROM numbers;",
    tables: [],
  },
  {
    id: "sql3_recursive_date_series",
    topic: "cte",
    database: "ecommerce",
    referenceSql:
      "WITH RECURSIVE date_series AS (SELECT date('2024-01-01') as date_value UNION ALL SELECT date(date_value, '+1 day') FROM date_series WHERE date_value < '2024-01-31') SELECT date_value, strftime('%w', date_value) as day_of_week FROM date_series;",
    tables: [],
  },
  {
    id: "sql3_moving_aggregate",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_date, total_amount, SUM(total_amount) OVER (ORDER BY order_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total, AVG(total_amount) OVER (ORDER BY order_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as moving_avg_30days FROM orders ORDER BY order_date;",
    tables: ["orders"],
  },
  {
    id: "sql3_dense_rank_gaps",
    topic: "window",
    database: "music",
    referenceSql:
      "SELECT name, bytes, RANK() OVER (ORDER BY bytes DESC) as rank_with_gaps, DENSE_RANK() OVER (ORDER BY bytes DESC) as rank_no_gaps FROM tracks ORDER BY bytes DESC LIMIT 20;",
    tables: ["tracks"],
  },
  {
    id: "sql3_window_filter_qualify",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT * FROM (SELECT c.customer_id, c.first_name, c.last_name, SUM(o.total_amount) as total_spent, RANK() OVER (PARTITION BY c.loyalty_tier ORDER BY SUM(o.total_amount) DESC) as tier_rank FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id) ranked WHERE tier_rank <= 5;",
    tables: ["customers", "orders"],
  },
  {
    id: "sql3_lag_lead_comparison",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_id, customer_id, order_date, total_amount, LAG(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date) as prev_order_amount, LEAD(total_amount, 1) OVER (PARTITION BY customer_id ORDER BY order_date) as next_order_amount FROM orders ORDER BY customer_id, order_date;",
    tables: ["orders"],
  },
  {
    id: "sql3_percentile_cont",
    topic: "aggregate",
    database: "music",
    referenceSql:
      "SELECT AVG(milliseconds) as avg_duration, MIN(milliseconds) as min_duration, MAX(milliseconds) as max_duration, (SELECT milliseconds FROM tracks ORDER BY milliseconds LIMIT 1 OFFSET (SELECT COUNT(*)/2 FROM tracks)) as median_approx FROM tracks;",
    tables: ["tracks"],
  },
  {
    id: "sql3_window_frame_groups",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT customer_id, order_date, total_amount, SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date GROUPS BETWEEN 2 PRECEDING AND CURRENT ROW) as sum_last_3_groups FROM orders ORDER BY customer_id, order_date;",
    tables: ["orders"],
  },
  {
    id: "sql3_advanced_running_difference",
    topic: "window",
    database: "ecommerce",
    referenceSql:
      "SELECT order_date, daily_revenue, daily_revenue - LAG(daily_revenue) OVER (ORDER BY order_date) as daily_change, ROUND(((daily_revenue - LAG(daily_revenue) OVER (ORDER BY order_date)) / LAG(daily_revenue) OVER (ORDER BY order_date)) * 100, 2) as pct_change FROM (SELECT order_date, SUM(total_amount) as daily_revenue FROM orders GROUP BY order_date) daily ORDER BY order_date;",
    tables: ["orders"],
  },

  // ========================================
  // DATA WAREHOUSE / ANALYTICS
  // ========================================

  {
    id: "dw_simple_star_schema_join",
    topic: "join",
    database: "datawarehouse",
    referenceSql:
      "SELECT dd.year, dd.month_name, SUM(fs.total_amount) as monthly_revenue FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY dd.year, dd.month, dd.month_name ORDER BY dd.year, dd.month;",
    tables: ["fact_sales", "dim_date"],
  },
  {
    id: "dw_product_category_sales",
    topic: "join",
    database: "datawarehouse",
    referenceSql:
      "SELECT dp.category, dp.subcategory, COUNT(fs.sale_key) as num_sales, SUM(fs.quantity) as total_quantity, SUM(fs.total_amount) as revenue FROM fact_sales fs JOIN dim_product dp ON fs.product_key = dp.product_key GROUP BY dp.category, dp.subcategory ORDER BY revenue DESC;",
    tables: ["fact_sales", "dim_product"],
  },
  {
    id: "dw_customer_lifetime_value",
    topic: "aggregate",
    database: "datawarehouse",
    referenceSql:
      "SELECT dc.customer_name, dc.loyalty_tier, dc.country, COUNT(fs.sale_key) as purchase_count, SUM(fs.total_amount) as lifetime_value, AVG(fs.total_amount) as avg_transaction FROM fact_sales fs JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = TRUE GROUP BY dc.customer_key, dc.customer_name, dc.loyalty_tier, dc.country ORDER BY lifetime_value DESC LIMIT 20;",
    tables: ["fact_sales", "dim_customer"],
  },
  {
    id: "dw_profitability_analysis",
    topic: "aggregate",
    database: "datawarehouse",
    referenceSql:
      "SELECT dp.category, SUM(fs.total_amount) as revenue, SUM(fs.cost_amount) as cost, SUM(fs.profit_amount) as profit, ROUND((SUM(fs.profit_amount) / NULLIF(SUM(fs.total_amount), 0)) * 100, 2) as profit_margin FROM fact_sales fs JOIN dim_product dp ON fs.product_key = dp.product_key GROUP BY dp.category ORDER BY profit DESC;",
    tables: ["fact_sales", "dim_product"],
  },
  {
    id: "dw_time_series_daily_sales",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "SELECT dd.date_value, dd.day_name, dd.is_weekend, SUM(fs.total_amount) as daily_revenue, AVG(SUM(fs.total_amount)) OVER (ORDER BY dd.date_value ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) as rolling_7day_avg FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY dd.date_value, dd.day_name, dd.is_weekend ORDER BY dd.date_value;",
    tables: ["fact_sales", "dim_date"],
  },
  {
    id: "dw_seasonal_analysis",
    topic: "aggregate",
    database: "datawarehouse",
    referenceSql:
      "SELECT dd.quarter, dd.month_name, SUM(fs.total_amount) as revenue, RANK() OVER (PARTITION BY dd.quarter ORDER BY SUM(fs.total_amount) DESC) as month_rank_in_quarter FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY dd.quarter, dd.month, dd.month_name ORDER BY dd.quarter, revenue DESC;",
    tables: ["fact_sales", "dim_date"],
  },
  {
    id: "dw_customer_segmentation",
    topic: "window",
    database: "datawarehouse",
    referenceSql:
      "SELECT customer_name, loyalty_tier, total_spent, NTILE(5) OVER (ORDER BY total_spent DESC) as value_segment, CASE WHEN NTILE(5) OVER (ORDER BY total_spent DESC) = 1 THEN 'VIP' WHEN NTILE(5) OVER (ORDER BY total_spent DESC) = 2 THEN 'High Value' WHEN NTILE(5) OVER (ORDER BY total_spent DESC) = 3 THEN 'Medium Value' ELSE 'Low Value' END as segment_name FROM (SELECT dc.customer_key, dc.customer_name, dc.loyalty_tier, SUM(fs.total_amount) as total_spent FROM fact_sales fs JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = 1 GROUP BY dc.customer_key, dc.customer_name, dc.loyalty_tier) customer_totals ORDER BY total_spent DESC;",
    tables: ["fact_sales", "dim_customer"],
  },
  {
    id: "dw_year_over_year_growth",
    topic: "window",
    database: "datawarehouse",
    referenceSql:
      "SELECT year, annual_revenue, LAG(annual_revenue) OVER (ORDER BY year) as prev_year_revenue, annual_revenue - LAG(annual_revenue) OVER (ORDER BY year) as yoy_change, ROUND(((annual_revenue - LAG(annual_revenue) OVER (ORDER BY year)) / NULLIF(LAG(annual_revenue) OVER (ORDER BY year), 0)) * 100, 2) as yoy_growth_pct FROM (SELECT dd.year, SUM(fs.total_amount) as annual_revenue FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY dd.year) yearly ORDER BY year;",
    tables: ["fact_sales", "dim_date"],
  },
  {
    id: "dw_top_products_per_category",
    topic: "window",
    database: "datawarehouse",
    referenceSql:
      "SELECT * FROM (SELECT dp.category, dp.product_name, SUM(fs.quantity) as units_sold, SUM(fs.total_amount) as revenue, RANK() OVER (PARTITION BY dp.category ORDER BY SUM(fs.total_amount) DESC) as category_rank FROM fact_sales fs JOIN dim_product dp ON fs.product_key = dp.product_key GROUP BY dp.category, dp.product_key, dp.product_name) ranked WHERE category_rank <= 3 ORDER BY category, revenue DESC;",
    tables: ["fact_sales", "dim_product"],
  },
  {
    id: "dw_customer_retention_cohort",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "WITH first_purchase AS (SELECT dc.customer_key, MIN(dd.date_value) as first_purchase_date FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = 1 GROUP BY dc.customer_key) SELECT strftime('%Y-%m', fp.first_purchase_date) as cohort_month, COUNT(DISTINCT fp.customer_key) as cohort_size, COUNT(DISTINCT CASE WHEN dd.date_value BETWEEN fp.first_purchase_date AND date(fp.first_purchase_date, '+30 days') THEN fs.customer_key END) as retained_30d FROM first_purchase fp LEFT JOIN fact_sales fs ON fp.customer_key = fs.customer_key LEFT JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY cohort_month ORDER BY cohort_month;",
    tables: ["fact_sales", "dim_date", "dim_customer"],
  },
  {
    id: "dw_abc_analysis",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "WITH product_revenue AS (SELECT dp.product_key, dp.product_name, SUM(fs.total_amount) as revenue FROM fact_sales fs JOIN dim_product dp ON fs.product_key = dp.product_key GROUP BY dp.product_key, dp.product_name), total_revenue AS (SELECT SUM(revenue) as total FROM product_revenue), cumulative AS (SELECT product_key, product_name, revenue, SUM(revenue) OVER (ORDER BY revenue DESC) / (SELECT total FROM total_revenue) * 100 as cumulative_pct FROM product_revenue) SELECT product_name, revenue, cumulative_pct, CASE WHEN cumulative_pct <= 80 THEN 'A' WHEN cumulative_pct <= 95 THEN 'B' ELSE 'C' END as abc_class FROM cumulative ORDER BY revenue DESC;",
    tables: ["fact_sales", "dim_product"],
  },
  {
    id: "dw_basket_analysis",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "SELECT dd.date_value, COUNT(DISTINCT fs.sale_key) as transactions, SUM(fs.quantity) as items_sold, ROUND(CAST(SUM(fs.quantity) AS REAL) / COUNT(DISTINCT fs.sale_key), 2) as avg_basket_size, ROUND(SUM(fs.total_amount) / COUNT(DISTINCT fs.sale_key), 2) as avg_basket_value FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key GROUP BY dd.date_value ORDER BY dd.date_value;",
    tables: ["fact_sales", "dim_date"],
  },
  {
    id: "dw_customer_rfm_analysis",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "WITH rfm AS (SELECT dc.customer_key, dc.customer_name, MAX(dd.date_value) as last_purchase_date, CURRENT_DATE - MAX(dd.date_value) as recency_days, COUNT(DISTINCT fs.sale_key) as frequency, SUM(fs.total_amount) as monetary FROM fact_sales fs JOIN dim_date dd ON fs.date_key = dd.date_key JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = TRUE GROUP BY dc.customer_key, dc.customer_name) SELECT customer_name, recency_days, frequency, monetary, NTILE(5) OVER (ORDER BY recency_days ASC) as recency_score, NTILE(5) OVER (ORDER BY frequency DESC) as frequency_score, NTILE(5) OVER (ORDER BY monetary DESC) as monetary_score FROM rfm ORDER BY monetary DESC LIMIT 50;",
    tables: ["fact_sales", "dim_date", "dim_customer"],
  },
  {
    id: "dw_slowly_changing_dimension",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "SELECT dc.customer_name, dc.loyalty_tier, dc.effective_date, dc.expiration_date, dc.is_current, CASE WHEN dc.is_current THEN 'Current Record' ELSE 'Historical Record' END as record_status FROM dim_customer dc ORDER BY dc.customer_name, dc.effective_date;",
    tables: ["dim_customer"],
  },
  {
    id: "dw_kpi_dashboard",
    topic: "advanced",
    database: "datawarehouse",
    referenceSql:
      "SELECT COUNT(DISTINCT dc.customer_key) as total_customers, COUNT(fs.sale_key) as total_transactions, SUM(fs.quantity) as total_units_sold, SUM(fs.total_amount) as total_revenue, SUM(fs.cost_amount) as total_cost, SUM(fs.profit_amount) as total_profit, ROUND(AVG(fs.total_amount), 2) as avg_transaction_value, ROUND((SUM(fs.profit_amount) / NULLIF(SUM(fs.total_amount), 0)) * 100, 2) as overall_margin FROM fact_sales fs JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = TRUE;",
    tables: ["fact_sales", "dim_customer"],
  },
  {
    id: "dw_geographic_performance",
    topic: "aggregate",
    database: "datawarehouse",
    referenceSql:
      "SELECT dc.country, dc.state, COUNT(DISTINCT dc.customer_key) as num_customers, SUM(fs.total_amount) as revenue, RANK() OVER (PARTITION BY dc.country ORDER BY SUM(fs.total_amount) DESC) as state_rank FROM fact_sales fs JOIN dim_customer dc ON fs.customer_key = dc.customer_key WHERE dc.is_current = TRUE GROUP BY dc.country, dc.state ORDER BY revenue DESC;",
    tables: ["fact_sales", "dim_customer"],
  },
];


