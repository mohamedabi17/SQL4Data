import { Database, DbTable } from "./databases";

const factSalesTable: DbTable = {
  name: "fact_sales",
  columns: [
    { name: "sale_key", attributes: [{ type: "PK" }] },
    { name: "date_key", attributes: [{ type: "FK", reference: { table: "dim_date", column: "date_key" } }] },
    { name: "product_key", attributes: [{ type: "FK", reference: { table: "dim_product", column: "product_key" } }] },
    { name: "customer_key", attributes: [{ type: "FK", reference: { table: "dim_customer", column: "customer_key" } }] },
    { name: "quantity", attributes: [] },
    { name: "unit_price", attributes: [] },
    { name: "total_amount", attributes: [] },
    { name: "cost_amount", attributes: [] },
    { name: "profit_amount", attributes: [] },
  ],
};

const dimDateTable: DbTable = {
  name: "dim_date",
  columns: [
    { name: "date_key", attributes: [{ type: "PK" }] },
    { name: "date_value", attributes: [] },
    { name: "year", attributes: [] },
    { name: "quarter", attributes: [] },
    { name: "month", attributes: [] },
    { name: "month_name", attributes: [] },
    { name: "day_name", attributes: [] },
    { name: "is_weekend", attributes: [] },
  ],
};

const dimProductTable: DbTable = {
  name: "dim_product",
  columns: [
    { name: "product_key", attributes: [{ type: "PK" }] },
    { name: "product_name", attributes: [] },
    { name: "category", attributes: [] },
    { name: "subcategory", attributes: [] },
    { name: "brand", attributes: [] },
  ],
};

const dimCustomerTable: DbTable = {
  name: "dim_customer",
  columns: [
    { name: "customer_key", attributes: [{ type: "PK" }] },
    { name: "customer_name", attributes: [] },
    { name: "loyalty_tier", attributes: [] },
    { name: "country", attributes: [] },
    { name: "state", attributes: [] },
    { name: "effective_date", attributes: [] },
    { name: "expiration_date", attributes: [] },
    { name: "is_current", attributes: [] },
  ],
};

export const datawarehouse: Database = {
  name: "Data Warehouse (Star Schema)",
  initSql: `
    -- Dimension: Date
    CREATE TABLE dim_date (
      date_key INTEGER PRIMARY KEY,
      date_value DATE NOT NULL,
      year INTEGER,
      quarter INTEGER,
      month INTEGER,
      month_name TEXT,
      day_name TEXT,
      is_weekend INTEGER DEFAULT 0
    );

    INSERT INTO dim_date (date_key, date_value, year, quarter, month, month_name, day_name, is_weekend) VALUES
    (20230101, '2023-01-01', 2023, 1, 1, 'January', 'Sunday', 1),
    (20230102, '2023-01-02', 2023, 1, 1, 'January', 'Monday', 0),
    (20230115, '2023-01-15', 2023, 1, 1, 'January', 'Sunday', 1),
    (20230201, '2023-02-01', 2023, 1, 2, 'February', 'Wednesday', 0),
    (20230214, '2023-02-14', 2023, 1, 2, 'February', 'Tuesday', 0),
    (20230301, '2023-03-01', 2023, 1, 3, 'March', 'Wednesday', 0),
    (20230315, '2023-03-15', 2023, 1, 3, 'March', 'Wednesday', 0),
    (20230401, '2023-04-01', 2023, 2, 4, 'April', 'Saturday', 1),
    (20230415, '2023-04-15', 2023, 2, 4, 'April', 'Saturday', 1),
    (20230501, '2023-05-01', 2023, 2, 5, 'May', 'Monday', 0),
    (20230515, '2023-05-15', 2023, 2, 5, 'May', 'Monday', 0),
    (20230601, '2023-06-01', 2023, 2, 6, 'June', 'Thursday', 0),
    (20230615, '2023-06-15', 2023, 2, 6, 'June', 'Thursday', 0),
    (20230701, '2023-07-01', 2023, 3, 7, 'July', 'Saturday', 1),
    (20230715, '2023-07-15', 2023, 3, 7, 'July', 'Saturday', 1),
    (20230801, '2023-08-01', 2023, 3, 8, 'August', 'Tuesday', 0),
    (20230815, '2023-08-15', 2023, 3, 8, 'August', 'Tuesday', 0),
    (20230901, '2023-09-01', 2023, 3, 9, 'September', 'Friday', 0),
    (20230915, '2023-09-15', 2023, 3, 9, 'September', 'Friday', 0),
    (20231001, '2023-10-01', 2023, 4, 10, 'October', 'Sunday', 1),
    (20231015, '2023-10-15', 2023, 4, 10, 'October', 'Sunday', 1),
    (20231101, '2023-11-01', 2023, 4, 11, 'November', 'Wednesday', 0),
    (20231115, '2023-11-15', 2023, 4, 11, 'November', 'Wednesday', 0),
    (20231201, '2023-12-01', 2023, 4, 12, 'December', 'Friday', 0),
    (20231215, '2023-12-15', 2023, 4, 12, 'December', 'Friday', 0),
    (20240101, '2024-01-01', 2024, 1, 1, 'January', 'Monday', 0),
    (20240115, '2024-01-15', 2024, 1, 1, 'January', 'Monday', 0),
    (20240201, '2024-02-01', 2024, 1, 2, 'February', 'Thursday', 0),
    (20240215, '2024-02-15', 2024, 1, 2, 'February', 'Thursday', 0),
    (20240301, '2024-03-01', 2024, 1, 3, 'March', 'Friday', 0);

    -- Dimension: Product
    CREATE TABLE dim_product (
      product_key INTEGER PRIMARY KEY,
      product_name TEXT NOT NULL,
      category TEXT,
      subcategory TEXT,
      brand TEXT
    );

    INSERT INTO dim_product (product_key, product_name, category, subcategory, brand) VALUES
    (1, 'Dell XPS 15 Laptop', 'Electronics', 'Laptops', 'Dell'),
    (2, 'MacBook Pro 16"', 'Electronics', 'Laptops', 'Apple'),
    (3, 'iPhone 14 Pro', 'Electronics', 'Smartphones', 'Apple'),
    (4, 'Samsung Galaxy S23', 'Electronics', 'Smartphones', 'Samsung'),
    (5, 'Sony WH-1000XM5', 'Electronics', 'Audio', 'Sony'),
    (6, 'Men Classic T-Shirt', 'Clothing', 'Men', 'BasicWear'),
    (7, 'Women Summer Dress', 'Clothing', 'Women', 'Elegance'),
    (8, 'Men Formal Shirt', 'Clothing', 'Men', 'ProfStyle'),
    (9, 'Leather Office Chair', 'Home & Garden', 'Furniture', 'ComfortPlus'),
    (10, 'Standing Desk', 'Home & Garden', 'Furniture', 'ErgoDesk'),
    (11, 'Coffee Machine Pro', 'Home & Garden', 'Appliances', 'BrewMaster'),
    (12, 'Gaming Desktop RGB', 'Electronics', 'Computers', 'PowerTech'),
    (13, 'iPad Air', 'Electronics', 'Tablets', 'Apple'),
    (14, 'Wireless Mouse', 'Electronics', 'Accessories', 'Logitech'),
    (15, 'Mechanical Keyboard', 'Electronics', 'Accessories', 'Corsair');

    -- Dimension: Customer (Slowly Changing Dimension Type 2)
    CREATE TABLE dim_customer (
      customer_key INTEGER PRIMARY KEY,
      customer_name TEXT NOT NULL,
      loyalty_tier TEXT,
      country TEXT,
      state TEXT,
      effective_date DATE,
      expiration_date DATE,
      is_current INTEGER DEFAULT 1
    );

    INSERT INTO dim_customer (customer_key, customer_name, loyalty_tier, country, state, effective_date, expiration_date, is_current) VALUES
    (1, 'John Smith', 'Gold', 'USA', 'New York', '2022-01-15', '9999-12-31', 1),
    (2, 'Emma Johnson', 'Silver', 'UK', 'England', '2022-03-22', '9999-12-31', 1),
    (3, 'Michael Brown', 'Platinum', 'USA', 'California', '2021-11-10', '2023-06-01', 0),
    (4, 'Michael Brown', 'Diamond', 'USA', 'California', '2023-06-01', '9999-12-31', 1),
    (5, 'Sophie Davis', 'Bronze', 'France', 'Ile-de-France', '2023-01-05', '9999-12-31', 1),
    (6, 'David Wilson', 'Gold', 'Canada', 'Ontario', '2022-06-18', '9999-12-31', 1),
    (7, 'Lisa Martinez', 'Silver', 'USA', 'Illinois', '2023-02-14', '9999-12-31', 1),
    (8, 'James Taylor', 'Platinum', 'Australia', 'NSW', '2021-09-30', '9999-12-31', 1),
    (9, 'Anna Anderson', 'Bronze', 'Germany', 'Berlin', '2022-12-01', '2023-09-01', 0),
    (10, 'Anna Anderson', 'Silver', 'Germany', 'Berlin', '2023-09-01', '9999-12-31', 1),
    (11, 'Robert Lee', 'Gold', 'USA', 'California', '2023-03-10', '9999-12-31', 1),
    (12, 'Maria Garcia', 'Silver', 'Spain', 'Madrid', '2022-08-25', '9999-12-31', 1);

    -- Fact: Sales
    CREATE TABLE fact_sales (
      sale_key INTEGER PRIMARY KEY,
      date_key INTEGER,
      product_key INTEGER,
      customer_key INTEGER,
      quantity INTEGER,
      unit_price REAL,
      total_amount REAL,
      cost_amount REAL,
      profit_amount REAL,
      FOREIGN KEY (date_key) REFERENCES dim_date(date_key),
      FOREIGN KEY (product_key) REFERENCES dim_product(product_key),
      FOREIGN KEY (customer_key) REFERENCES dim_customer(customer_key)
    );

    INSERT INTO fact_sales (sale_key, date_key, product_key, customer_key, quantity, unit_price, total_amount, cost_amount, profit_amount) VALUES
    (1, 20230115, 1, 1, 1, 1499.99, 1499.99, 1050.00, 449.99),
    (2, 20230115, 6, 1, 2, 29.99, 59.98, 20.00, 39.98),
    (3, 20230115, 7, 2, 1, 59.99, 59.99, 25.00, 34.99),
    (4, 20230201, 2, 3, 1, 2499.99, 2499.99, 1800.00, 699.99),
    (5, 20230214, 3, 1, 1, 999.99, 999.99, 650.00, 349.99),
    (6, 20230214, 6, 5, 3, 29.99, 89.97, 30.00, 59.97),
    (7, 20230214, 8, 5, 2, 49.99, 99.98, 40.00, 59.98),
    (8, 20230301, 1, 6, 1, 1199.99, 1199.99, 840.00, 359.99),
    (9, 20230301, 9, 2, 1, 249.99, 249.99, 150.00, 99.99),
    (10, 20230315, 12, 7, 1, 1799.99, 1799.99, 1200.00, 599.99),
    (11, 20230315, 1, 8, 1, 1499.99, 1349.99, 1050.00, 299.99),
    (12, 20230315, 5, 8, 2, 349.99, 699.98, 450.00, 249.98),
    (13, 20230401, 4, 3, 1, 599.99, 599.99, 380.00, 219.99),
    (14, 20230401, 13, 9, 1, 749.99, 749.99, 500.00, 249.99),
    (15, 20230415, 4, 11, 1, 849.99, 849.99, 550.00, 299.99),
    (16, 20230415, 10, 12, 1, 399.99, 399.99, 250.00, 149.99),
    (17, 20230501, 5, 1, 1, 349.99, 349.99, 225.00, 124.99),
    (18, 20230501, 14, 1, 2, 49.99, 99.98, 60.00, 39.98),
    (19, 20230515, 15, 6, 1, 149.99, 149.99, 90.00, 59.99),
    (20, 20230515, 11, 6, 1, 299.99, 299.99, 180.00, 119.99),
    (21, 20230601, 2, 8, 1, 2499.99, 2499.99, 1800.00, 699.99),
    (22, 20230601, 3, 7, 2, 999.99, 1999.98, 1300.00, 699.98),
    (23, 20230615, 7, 5, 2, 59.99, 119.98, 50.00, 69.98),
    (24, 20230615, 6, 10, 4, 29.99, 119.96, 40.00, 79.96),
    (25, 20230701, 12, 1, 1, 1799.99, 1799.99, 1200.00, 599.99),
    (26, 20230701, 9, 11, 1, 249.99, 249.99, 150.00, 99.99),
    (27, 20230715, 1, 4, 1, 1499.99, 1499.99, 1050.00, 449.99),
    (28, 20230715, 8, 4, 2, 49.99, 99.98, 40.00, 59.98),
    (29, 20230801, 4, 12, 1, 849.99, 849.99, 550.00, 299.99),
    (30, 20230801, 10, 7, 1, 399.99, 399.99, 250.00, 149.99),
    (31, 20230815, 13, 2, 1, 749.99, 749.99, 500.00, 249.99),
    (32, 20230815, 5, 6, 1, 349.99, 349.99, 225.00, 124.99),
    (33, 20230901, 2, 1, 1, 2499.99, 2499.99, 1800.00, 699.99),
    (34, 20230901, 15, 8, 2, 149.99, 299.98, 180.00, 119.98),
    (35, 20230915, 3, 4, 1, 999.99, 999.99, 650.00, 349.99),
    (36, 20230915, 11, 12, 1, 299.99, 299.99, 180.00, 119.99),
    (37, 20231001, 1, 7, 1, 1499.99, 1499.99, 1050.00, 449.99),
    (38, 20231001, 6, 10, 5, 29.99, 149.95, 50.00, 99.95),
    (39, 20231015, 12, 11, 1, 1799.99, 1799.99, 1200.00, 599.99),
    (40, 20231015, 14, 5, 3, 49.99, 149.97, 90.00, 59.97),
    (41, 20231101, 4, 1, 1, 849.99, 849.99, 550.00, 299.99),
    (42, 20231101, 9, 4, 1, 249.99, 249.99, 150.00, 99.99),
    (43, 20231115, 2, 6, 1, 2499.99, 2499.99, 1800.00, 699.99),
    (44, 20231115, 7, 10, 2, 59.99, 119.98, 50.00, 69.98),
    (45, 20231201, 3, 8, 1, 999.99, 999.99, 650.00, 349.99),
    (46, 20231201, 5, 2, 1, 349.99, 349.99, 225.00, 124.99),
    (47, 20231215, 1, 11, 1, 1499.99, 1499.99, 1050.00, 449.99),
    (48, 20231215, 10, 1, 1, 399.99, 399.99, 250.00, 149.99),
    (49, 20240101, 13, 4, 1, 749.99, 749.99, 500.00, 249.99),
    (50, 20240101, 15, 7, 1, 149.99, 149.99, 90.00, 59.99),
    (51, 20240115, 4, 6, 1, 849.99, 849.99, 550.00, 299.99),
    (52, 20240115, 8, 2, 3, 49.99, 149.97, 60.00, 89.97),
    (53, 20240201, 2, 12, 1, 2499.99, 2499.99, 1800.00, 699.99),
    (54, 20240201, 6, 5, 2, 29.99, 59.98, 20.00, 39.98),
    (55, 20240215, 12, 8, 1, 1799.99, 1799.99, 1200.00, 599.99),
    (56, 20240215, 11, 10, 1, 299.99, 299.99, 180.00, 119.99),
    (57, 20240301, 3, 1, 1, 999.99, 999.99, 650.00, 349.99),
    (58, 20240301, 9, 6, 1, 249.99, 249.99, 150.00, 99.99),
    (59, 20240301, 14, 11, 2, 49.99, 99.98, 60.00, 39.98),
    (60, 20240301, 7, 4, 1, 59.99, 59.99, 25.00, 34.99);
  `,
};
