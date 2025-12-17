import { Database, DbTable } from "./databases";

const customersTable: DbTable = {
    name: "customers",
    columns: [
        { name: "customer_id", attributes: [{ type: "PK" }] },
        { name: "first_name", attributes: [] },
        { name: "last_name", attributes: [] },
        { name: "email", attributes: [] },
        { name: "registration_date", attributes: [] },
        { name: "country", attributes: [] },
        { name: "city", attributes: [] },
        { name: "loyalty_tier", attributes: [] },
    ],
};

const productsTable: DbTable = {
    name: "products",
    columns: [
        { name: "product_id", attributes: [{ type: "PK" }] },
        { name: "product_name", attributes: [] },
        { name: "category_id", attributes: [{ type: "FK", reference: { table: "categories", column: "category_id" } }] },
        { name: "price", attributes: [] },
        { name: "stock_quantity", attributes: [] },
        { name: "supplier_id", attributes: [{ type: "FK", reference: { table: "suppliers", column: "supplier_id" } }] },
    ],
};

const categoriesTable: DbTable = {
    name: "categories",
    columns: [
        { name: "category_id", attributes: [{ type: "PK" }] },
        { name: "category_name", attributes: [] },
        { name: "parent_category_id", attributes: [{ type: "FK", reference: { table: "categories", column: "category_id" } }] },
    ],
};

const ordersTable: DbTable = {
    name: "orders",
    columns: [
        { name: "order_id", attributes: [{ type: "PK" }] },
        { name: "customer_id", attributes: [{ type: "FK", reference: { table: "customers", column: "customer_id" } }] },
        { name: "order_date", attributes: [] },
        { name: "total_amount", attributes: [] },
        { name: "status", attributes: [] },
        { name: "payment_method", attributes: [] },
    ],
};

const orderItemsTable: DbTable = {
    name: "order_items",
    columns: [
        { name: "order_item_id", attributes: [{ type: "PK" }] },
        { name: "order_id", attributes: [{ type: "FK", reference: { table: "orders", column: "order_id" } }] },
        { name: "product_id", attributes: [{ type: "FK", reference: { table: "products", column: "product_id" } }] },
        { name: "quantity", attributes: [] },
        { name: "unit_price", attributes: [] },
        { name: "discount", attributes: [] },
    ],
};

const suppliersTable: DbTable = {
    name: "suppliers",
    columns: [
        { name: "supplier_id", attributes: [{ type: "PK" }] },
        { name: "supplier_name", attributes: [] },
        { name: "country", attributes: [] },
        { name: "contact_email", attributes: [] },
    ],
};

const reviewsTable: DbTable = {
    name: "reviews",
    columns: [
        { name: "review_id", attributes: [{ type: "PK" }] },
        { name: "product_id", attributes: [{ type: "FK", reference: { table: "products", column: "product_id" } }] },
        { name: "customer_id", attributes: [{ type: "FK", reference: { table: "customers", column: "customer_id" } }] },
        { name: "rating", attributes: [] },
        { name: "review_text", attributes: [] },
        { name: "review_date", attributes: [] },
    ],
};

export const ecommerce: Database = {
    name: "E-Commerce",
    initSql: `
    -- Categories
    CREATE TABLE categories (
      category_id INTEGER PRIMARY KEY,
      category_name TEXT NOT NULL,
      parent_category_id INTEGER,
      FOREIGN KEY (parent_category_id) REFERENCES categories(category_id)
    );

    INSERT INTO categories (category_id, category_name, parent_category_id) VALUES
    (1, 'Electronics', NULL),
    (2, 'Computers', 1),
    (3, 'Laptops', 2),
    (4, 'Desktops', 2),
    (5, 'Smartphones', 1),
    (6, 'Clothing', NULL),
    (7, 'Men', 6),
    (8, 'Women', 6),
    (9, 'Home & Garden', NULL),
    (10, 'Furniture', 9);

    -- Suppliers
    CREATE TABLE suppliers (
      supplier_id INTEGER PRIMARY KEY,
      supplier_name TEXT NOT NULL,
      country TEXT,
      contact_email TEXT
    );

    INSERT INTO suppliers (supplier_id, supplier_name, country, contact_email) VALUES
    (1, 'TechSupply Inc', 'USA', 'contact@techsupply.com'),
    (2, 'GlobalElectronics', 'China', 'info@globalelectronics.cn'),
    (3, 'EuroGoods', 'Germany', 'sales@eurogoods.de'),
    (4, 'AsiaManufacture', 'Japan', 'orders@asiamanufacture.jp'),
    (5, 'AmericanTextiles', 'USA', 'support@americantextiles.com');

    -- Products
    CREATE TABLE products (
      product_id INTEGER PRIMARY KEY,
      product_name TEXT NOT NULL,
      category_id INTEGER,
      price REAL,
      stock_quantity INTEGER,
      supplier_id INTEGER,
      FOREIGN KEY (category_id) REFERENCES categories(category_id),
      FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
    );

    INSERT INTO products (product_id, product_name, category_id, price, stock_quantity, supplier_id) VALUES
    (1, 'Dell XPS 15', 3, 1499.99, 25, 1),
    (2, 'MacBook Pro 16"', 3, 2499.99, 15, 1),
    (3, 'HP Desktop Tower', 4, 899.99, 40, 1),
    (4, 'iPhone 14 Pro', 5, 999.99, 100, 2),
    (5, 'Samsung Galaxy S23', 5, 849.99, 80, 2),
    (6, 'Men T-Shirt Classic', 7, 29.99, 200, 5),
    (7, 'Women Summer Dress', 8, 59.99, 150, 5),
    (8, 'Leather Office Chair', 10, 249.99, 30, 3),
    (9, 'Standing Desk', 10, 399.99, 20, 3),
    (10, 'Lenovo ThinkPad', 3, 1199.99, 35, 4),
    (11, 'Google Pixel 7', 5, 599.99, 60, 2),
    (12, 'Men Formal Shirt', 7, 49.99, 180, 5),
    (13, 'Gaming Desktop RGB', 4, 1799.99, 12, 1),
    (14, 'iPad Air', 1, 749.99, 45, 1),
    (15, 'Wooden Dining Table', 10, 599.99, 8, 3);

    -- Customers
    CREATE TABLE customers (
      customer_id INTEGER PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE,
      registration_date DATE,
      country TEXT,
      city TEXT,
      loyalty_tier TEXT
    );

    INSERT INTO customers (customer_id, first_name, last_name, email, registration_date, country, city, loyalty_tier) VALUES
    (1, 'John', 'Smith', 'john.smith@email.com', '2022-01-15', 'USA', 'New York', 'Gold'),
    (2, 'Emma', 'Johnson', 'emma.j@email.com', '2022-03-22', 'UK', 'London', 'Silver'),
    (3, 'Michael', 'Brown', 'michael.b@email.com', '2021-11-10', 'USA', 'Los Angeles', 'Platinum'),
    (4, 'Sophie', 'Davis', 'sophie.d@email.com', '2023-01-05', 'France', 'Paris', 'Bronze'),
    (5, 'David', 'Wilson', 'david.w@email.com', '2022-06-18', 'Canada', 'Toronto', 'Gold'),
    (6, 'Lisa', 'Martinez', 'lisa.m@email.com', '2023-02-14', 'USA', 'Chicago', 'Silver'),
    (7, 'James', 'Taylor', 'james.t@email.com', '2021-09-30', 'Australia', 'Sydney', 'Platinum'),
    (8, 'Anna', 'Anderson', 'anna.a@email.com', '2022-12-01', 'Germany', 'Berlin', 'Bronze'),
    (9, 'Robert', 'Lee', 'robert.l@email.com', '2023-03-10', 'USA', 'San Francisco', 'Gold'),
    (10, 'Maria', 'Garcia', 'maria.g@email.com', '2022-08-25', 'Spain', 'Madrid', 'Silver');

    -- Orders
    CREATE TABLE orders (
      order_id INTEGER PRIMARY KEY,
      customer_id INTEGER,
      order_date DATE,
      total_amount REAL,
      status TEXT,
      payment_method TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

    INSERT INTO orders (order_id, customer_id, order_date, total_amount, status, payment_method) VALUES
    (1, 1, '2023-01-10', 1529.98, 'Delivered', 'Credit Card'),
    (2, 2, '2023-01-15', 59.99, 'Delivered', 'PayPal'),
    (3, 3, '2023-01-20', 2499.99, 'Delivered', 'Credit Card'),
    (4, 1, '2023-02-05', 999.99, 'Delivered', 'Credit Card'),
    (5, 4, '2023-02-10', 89.98, 'Shipped', 'Debit Card'),
    (6, 5, '2023-02-14', 1199.99, 'Delivered', 'Credit Card'),
    (7, 2, '2023-02-20', 249.99, 'Processing', 'PayPal'),
    (8, 6, '2023-03-01', 1799.99, 'Delivered', 'Credit Card'),
    (9, 7, '2023-03-05', 1349.98, 'Delivered', 'Credit Card'),
    (10, 3, '2023-03-10', 599.99, 'Delivered', 'Credit Card'),
    (11, 8, '2023-03-15', 749.99, 'Shipped', 'Debit Card'),
    (12, 9, '2023-03-20', 849.99, 'Processing', 'Credit Card'),
    (13, 10, '2023-03-25', 399.99, 'Delivered', 'PayPal'),
    (14, 1, '2023-04-01', 649.98, 'Delivered', 'Credit Card'),
    (15, 5, '2023-04-05', 1199.99, 'Cancelled', 'Credit Card');

    -- Order Items
    CREATE TABLE order_items (
      order_item_id INTEGER PRIMARY KEY,
      order_id INTEGER,
      product_id INTEGER,
      quantity INTEGER,
      unit_price REAL,
      discount REAL DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES orders(order_id),
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );

    INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price, discount) VALUES
    (1, 1, 1, 1, 1499.99, 0),
    (2, 1, 6, 1, 29.99, 0),
    (3, 2, 7, 1, 59.99, 0),
    (4, 3, 2, 1, 2499.99, 0),
    (5, 4, 4, 1, 999.99, 0),
    (6, 5, 6, 2, 29.99, 0),
    (7, 5, 12, 1, 49.99, 10),
    (8, 6, 10, 1, 1199.99, 0),
    (9, 7, 8, 1, 249.99, 0),
    (10, 8, 13, 1, 1799.99, 0),
    (11, 9, 1, 1, 1499.99, 150),
    (12, 9, 11, 1, 599.99, 0),
    (13, 10, 11, 1, 599.99, 0),
    (14, 11, 14, 1, 749.99, 0),
    (15, 12, 5, 1, 849.99, 0),
    (16, 13, 9, 1, 399.99, 0),
    (17, 14, 11, 1, 599.99, 0),
    (18, 14, 12, 1, 49.99, 0),
    (19, 15, 10, 1, 1199.99, 0);

    -- Reviews
    CREATE TABLE reviews (
      review_id INTEGER PRIMARY KEY,
      product_id INTEGER,
      customer_id INTEGER,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      review_text TEXT,
      review_date DATE,
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
    );

    INSERT INTO reviews (review_id, product_id, customer_id, rating, review_text, review_date) VALUES
    (1, 1, 1, 5, 'Excellent laptop, very fast!', '2023-01-15'),
    (2, 2, 3, 5, 'Best laptop I ever owned', '2023-01-25'),
    (3, 4, 1, 4, 'Great phone but expensive', '2023-02-10'),
    (4, 7, 2, 5, 'Beautiful dress, perfect fit', '2023-01-20'),
    (5, 8, 2, 3, 'Chair is okay, could be more comfortable', '2023-02-25'),
    (6, 13, 6, 5, 'Amazing gaming performance!', '2023-03-05'),
    (7, 1, 7, 4, 'Good laptop but runs a bit hot', '2023-03-10'),
    (8, 10, 5, 5, 'Perfect for work, highly recommend', '2023-02-20'),
    (9, 11, 7, 4, 'Solid phone with great camera', '2023-03-15'),
    (10, 14, 8, 5, 'iPad is perfect for drawing', '2023-03-20');
  `,
};
