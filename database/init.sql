-- SQL4Data Database Initialization Script
-- Data Engineering focused datasets with realistic dirty data

-- =========================================
-- ACCOUNTING DATABASE (Employees & HR)
-- =========================================

-- Employees
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    last_name VARCHAR(20) NOT NULL,
    first_name VARCHAR(20) NOT NULL,
    title VARCHAR(30),
    reports_to INTEGER REFERENCES employees(id),
    birth_date TIMESTAMP,
    hire_date TIMESTAMP,
    address VARCHAR(70),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    postal_code VARCHAR(10),
    phone VARCHAR(24),
    fax VARCHAR(24),
    email VARCHAR(60)
);

INSERT INTO employees (last_name, first_name, title, reports_to, birth_date, hire_date, address, city, state, country, postal_code, phone, fax, email) VALUES
('Adams', 'Andrew', 'General Manager', NULL, '1962-02-18 00:00:00', '2002-08-14 00:00:00', '11120 Jasper Ave NW', 'Edmonton', 'AB', 'Canada', 'T5K 2N1', '+1 (780) 428-9482', '+1 (780) 428-3457', 'andrew@chinookcorp.com'),
('Edwards', 'Nancy', 'Sales Manager', 1, '1958-12-08 00:00:00', '2002-05-01 00:00:00', '825 8 Ave SW', 'Calgary', 'AB', 'Canada', 'T2P 2T3', '+1 (403) 262-3443', '+1 (403) 262-3322', 'nancy@chinookcorp.com'),
('Peacock', 'Jane', 'Sales Support Agent', 2, '1973-08-29 00:00:00', '2002-04-01 00:00:00', '1111 6 Ave SW', 'Calgary', 'AB', 'Canada', 'T2P 5M5', '+1 (403) 262-3443', '+1 (403) 262-6712', 'jane@chinookcorp.com'),
('Park', 'Margaret', 'Sales Support Agent', 2, '1947-09-19 00:00:00', '2003-05-03 00:00:00', '683 10 Street SW', 'Calgary', 'AB', 'Canada', 'T2P 5G3', '+1 (403) 263-4423', '+1 (403) 263-4289', 'margaret@chinookcorp.com'),
('Johnson', 'Steve', 'Sales Support Agent', 2, '1965-03-03 00:00:00', '2003-10-17 00:00:00', '7727B 41 Ave', 'Calgary', 'AB', 'Canada', 'T3B 1Y7', '1 (780) 836-9987', '1 (780) 836-9543', 'steve@chinookcorp.com'),
('Mitchell', 'Michael', 'IT Manager', 1, '1973-07-01 00:00:00', '2003-10-17 00:00:00', '5827 Bowness Road NW', 'Calgary', 'AB', 'Canada', 'T3B 0C5', '+1 (403) 246-9887', '+1 (403) 246-9899', 'michael@chinookcorp.com'),
('King', 'Robert', 'IT Staff', 6, '1970-05-29 00:00:00', '2004-01-02 00:00:00', '590 Columbia Boulevard West', 'Lethbridge', 'AB', 'Canada', 'T1K 5N8', '+1 (403) 456-9986', '+1 (403) 456-8485', 'robert@chinookcorp.com'),
('Callahan', 'Laura', 'IT Staff', 6, '1968-01-09 00:00:00', '2004-03-04 00:00:00', '923 7 ST NW', 'Lethbridge', 'AB', 'Canada', 'T1H 1Y8', '+1 (403) 467-3351', '+1 (403) 467-8772', 'laura@chinookcorp.com');

-- =========================================
-- MUSIC STORE DATABASE (Chinook Style)
-- =========================================

-- Media Types
CREATE TABLE media_types (
    media_type_id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

INSERT INTO media_types (name) VALUES
('MPEG audio file'),
('Protected AAC audio file'),
('Protected MPEG-4 video file'),
('Purchased AAC audio file'),
('AAC audio file');

-- Genres
CREATE TABLE genres (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(120)
);

INSERT INTO genres (name) VALUES
('Rock'),
('Jazz'),
('Metal'),
('Alternative & Punk'),
('Rock And Roll'),
('Blues'),
('Latin'),
('Reggae'),
('Pop'),
('Soundtrack'),
('Hip Hop/Rap'),
('Electronica/Dance'),
('R&B/Soul'),
('Classical');

-- Artists (matching SQL.js schema: column named 'id', not 'artist_id')
CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL
);

INSERT INTO artists (name) VALUES
('AC/DC'),
('Accept'),
('Aerosmith'),
('Alanis Morissette'),
('Alice In Chains'),
('Antônio Carlos Jobim'),
('Apocalyptica'),
('Audioslave'),
('BackBeat'),
('Billy Cobham'),
('Black Label Society'),
('Black Sabbath');

-- Albums
CREATE TABLE albums (
    id SERIAL PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    artist_id INTEGER REFERENCES artists(id)
);

INSERT INTO albums (title, artist_id) VALUES
('For Those About To Rock We Salute You', 1),
('Let There Be Rock', 1),
('Balls to the Wall', 2),
('Restless and Wild', 2),
('Big Ones', 3),
('Jagged Little Pill', 4),
('Facelift', 5),
('Warner 25 Anos', 6),
('Plays Metallica By Four Cellos', 7),
('Appetite for Destruction', 8),
('Use Your Illusion I', 8),
('BackBeat Soundtrack', 9);

-- Tracks (with dirty data scenarios)
CREATE TABLE tracks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    album_id INTEGER REFERENCES albums(id),
    media_type_id INTEGER REFERENCES media_types(media_type_id),
    genre_id INTEGER REFERENCES genres(genre_id),
    composer VARCHAR(220),
    milliseconds INTEGER,
    bytes INTEGER,
    unit_price NUMERIC(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO tracks (name, album_id, media_type_id, genre_id, composer, milliseconds, bytes, unit_price) VALUES
('For Those About To Rock (We Salute You)', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 343719, 11170334, 0.99),
('Put The Finger On You', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 205662, 6713451, 0.99),
('Let''s Get It Up', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 233926, 7636561, 0.99),
('Inject The Venom', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 210834, 6852860, 0.99),
('Snowballed', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 203102, 6599424, 0.99),
('Evil Walks', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 263497, 8611245, 0.99),
('Breaking The Rules', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 263288, 8596840, 0.99),
('Night Of The Long Knives', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 205688, 6706347, 0.99),
('Spellbound', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 270863, 8817038, 0.99),
-- Duplicate track name for data cleaning exercise
('Breaking The Rules', 1, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 263288, 8596840, 0.99),
-- Track with missing composer
('Dog Eat Dog', 2, 1, 1, NULL, 215196, 7032162, 0.99),
('Let There Be Rock', 2, 1, 1, 'Angus Young, Malcolm Young, Brian Johnson', 366654, 12021261, 0.99),
('Balls to the Wall', 3, 1, 1, NULL, 342562, 5510424, 0.99),
('Fast As a Shark', 3, 1, 1, 'F. Baltes, S. Kaufman, U. Dirkscneider & W. Hoffman', 230619, 3990994, 0.99),
-- Track with null bytes (dirty data)
('Restless and Wild', 4, 1, 1, 'F. Baltes, R.A. Smith-Diesel, S. Kaufman, U. Dirkscneider & W. Hoffman', 252051, NULL, 0.99),
('Walk On Water', 5, 1, 1, 'Steven Tyler, Joe Perry', 295680, 9719103, 0.99),
('Love In An Elevator', 5, 1, 1, 'Steven Tyler, Joe Perry', 321828, 10552051, 0.99);

-- =========================================
-- ACCOUNTING DATABASE - CUSTOMERS
-- =========================================

-- Customers (matching SQL.js schema from accounting.ts)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(40) NOT NULL,
    last_name VARCHAR(20) NOT NULL,
    company VARCHAR(80),
    address VARCHAR(70),
    city VARCHAR(40),
    state VARCHAR(40),
    country VARCHAR(40),
    postal_code VARCHAR(10),
    phone VARCHAR(24),
    fax VARCHAR(24),
    email VARCHAR(60) NOT NULL,
    support_rep_id INTEGER REFERENCES employees(id)
);

INSERT INTO customers (first_name, last_name, company, address, city, state, country, postal_code, phone, fax, email, support_rep_id) VALUES
('Luís', 'Gonçalves', 'Embraer - Empresa Brasileira de Aeronáutica S.A.', 'Av. Brigadeiro Faria Lima, 2170', 'São José dos Campos', 'SP', 'Brazil', '12227-000', '+55 (12) 3923-5555', '+55 (12) 3923-5566', 'luisg@embraer.com.br', 3),
('Leonie', 'Köhler', NULL, 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', '+49 0711 2842222', NULL, 'leonekohler@surfeu.de', 5),
('François', 'Tremblay', NULL, '1498 rue Bélanger', 'Montréal', 'QC', 'Canada', 'H2G 1A7', '+1 (514) 721-4711', NULL, 'ftremblay@gmail.com', 3),
('Bjørn', 'Hansen', NULL, 'Ullevålsveien 14', 'Oslo', NULL, 'Norway', '0171', '+47 22 44 22 22', NULL, 'bjorn.hansen@yahoo.no', 4),
('František', 'Wichterlová', 'JetBrains s.r.o.', 'Klanova 9/506', 'Prague', NULL, 'Czech Republic', '14700', '+420 2 4172 5555', '+420 2 4172 5555', 'frantisekw@jetbrains.com', 4),
('Helena', 'Holý', NULL, 'Rilská 3174/6', 'Prague', NULL, 'Czech Republic', '14300', '+420 2 4177 0449', NULL, 'hholy@gmail.com', 5),
('Astrid', 'Gruber', NULL, 'Rotenturmstraße 4, 1010 Innere Stadt', 'Vienne', NULL, 'Austria', '1010', '+43 01 5134505', NULL, 'astrid.gruber@apple.at', 5),
('Daan', 'Peeters', NULL, 'Grétrystraat 63', 'Brussels', NULL, 'Belgium', '1000', '+32 02 219 03 03', NULL, 'daan_peeters@apple.be', 4),
('Kara', 'Nielsen', NULL, 'Sønder Boulevard 51', 'Copenhagen', NULL, 'Denmark', '1720', '+453 3331 9991', NULL, 'kara.nielsen@jubii.dk', 4),
('Eduardo', 'Martins', 'Woodstock Discos', 'Rua Dr. Falcão Filho, 155', 'São Paulo', 'SP', 'Brazil', '01007-010', '+55 (11) 3033-5446', '+55 (11) 3033-4564', 'eduardo@woodstock.com.br', 4),
('Alexandre', 'Rocha', 'Banco do Brasil S.A.', 'Av. Paulista, 2022', 'São Paulo', 'SP', 'Brazil', '01310-200', '+55 (11) 3055-3278', '+55 (11) 3055-8131', 'alero@uol.com.br', 5),
('Roberto', 'Almeida', 'Riotur', 'Praça Pio X, 119', 'Rio de Janeiro', 'RJ', 'Brazil', '20040-020', '+55 (21) 2271-7000', '+55 (21) 2271-7070', 'roberto.almeida@riotur.gov.br', 3),
('Fernanda', 'Ramos', NULL, 'Qe 7 Bloco G', 'Brasília', 'DF', 'Brazil', '71020-677', '+55 (61) 3363-5547', '+55 (61) 3363-7855', 'fernadaramos4@uol.com.br', 4),
('Mark', 'Philips', 'Telus', '8210 111 ST NW', 'Edmonton', 'AB', 'Canada', 'T6G 2C7', '+1 (780) 434-4554', '+1 (780) 434-5565', 'mphilips12@shaw.ca', 5),
('Jennifer', 'Peterson', 'Rogers Canada', '700 W Pender Street', 'Vancouver', 'BC', 'Canada', 'V6C 1G8', '+1 (604) 688-2255', '+1 (604) 688-8756', 'jenniferp@rogers.ca', 3),
('Frank', 'Harris', 'Google Inc.', '1600 Amphitheatre Parkway', 'Mountain View', 'CA', 'USA', '94043-1351', '+1 (650) 253-0000', '+1 (650) 253-0000', 'fharris@google.com', 4),
('Jack', 'Smith', 'Microsoft Corporation', '1 Microsoft Way', 'Redmond', 'WA', 'USA', '98052-8300', '+1 (425) 882-8080', '+1 (425) 882-8081', 'jacksmith@microsoft.com', 5),
('Michelle', 'Brooks', NULL, '627 Broadway', 'New York', 'NY', 'USA', '10012-2612', '+1 (212) 221-3546', '+1 (212) 221-4679', 'michelleb@aol.com', 3),
('Tim', 'Goyer', 'Apple Inc.', '1 Infinite Loop', 'Cupertino', 'CA', 'USA', '95014', '+1 (408) 996-1010', '+1 (408) 996-1011', 'tgoyer@apple.com', 3),
('Dan', 'Miller', NULL, '541 Del Medio Avenue', 'Mountain View', 'CA', 'USA', '94040-111', '+1 (650) 644-3358', NULL, 'dmiller@comcast.com', 4),
('Kathy', 'Chase', NULL, '801 W 4th Street', 'Reno', 'NV', 'USA', '89503', '+1 (775) 223-7665', NULL, 'kachase@hotmail.com', 5),
('Heather', 'Leacock', NULL, '120 S Orange Ave', 'Orlando', 'FL', 'USA', '32801', '+1 (407) 999-7788', NULL, 'hleacock@gmail.com', 4),
('John', 'Gordon', NULL, '69 Salem Street', 'Boston', 'MA', 'USA', '2113', '+1 (617) 522-1333', NULL, 'johngordon22@yahoo.com', 4),
('Frank', 'Ralston', NULL, '162 E Superior Street', 'Chicago', 'IL', 'USA', '60611', '+1 (312) 332-3232', NULL, 'fralston@gmail.com', 3);

-- Invoices (matching SQL.js schema from accounting.ts)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id),
    invoice_date TIMESTAMP NOT NULL,
    billing_address VARCHAR(70),
    billing_city VARCHAR(40),
    billing_state VARCHAR(40),
    billing_country VARCHAR(40),
    billing_postal_code VARCHAR(10),
    total NUMERIC(10, 2) NOT NULL
);

INSERT INTO invoices (customer_id, invoice_date, billing_address, billing_city, billing_state, billing_country, billing_postal_code, total) VALUES
(2, '2007-01-01 00:00:00', 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', 1.98),
(4, '2007-01-02 00:00:00', 'Ullevålsveien 14', 'Oslo', NULL, 'Norway', '0171', 3.96),
(8, '2007-01-03 00:00:00', 'Grétrystraat 63', 'Brussels', NULL, 'Belgium', '1000', 5.94),
(14, '2007-01-06 00:00:00', '8210 111 ST NW', 'Edmonton', 'AB', 'Canada', 'T6G 2C7', 8.91),
(23, '2007-01-11 00:00:00', '69 Salem Street', 'Boston', 'MA', 'USA', '2113', 13.86),
(1, '2007-01-19 00:00:00', 'Av. Brigadeiro Faria Lima, 2170', 'São José dos Campos', 'SP', 'Brazil', '12227-000', 0.99),
(2, '2007-02-01 00:00:00', 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', 1.98),
(3, '2007-02-01 00:00:00', '1498 rue Bélanger', 'Montréal', 'QC', 'Canada', 'H2G 1A7', 1.98),
(4, '2007-02-02 00:00:00', 'Ullevålsveien 14', 'Oslo', NULL, 'Norway', '0171', 3.96),
(5, '2007-02-03 00:00:00', 'Klanova 9/506', 'Prague', NULL, 'Czech Republic', '14700', 5.94),
(6, '2007-02-06 00:00:00', 'Rilská 3174/6', 'Prague', NULL, 'Czech Republic', '14300', 8.91),
(2, '2007-02-11 00:00:00', 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', 13.86);

-- =========================================
-- E-COMMERCE / CRM DATABASE
-- =========================================

-- Orders
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE NOT NULL,
    billing_address VARCHAR(70),
    billing_city VARCHAR(40),
    billing_state VARCHAR(40),
    billing_country VARCHAR(40),
    billing_postal_code VARCHAR(10),
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    payment_method VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO orders (customer_id, order_date, billing_address, billing_city, billing_state, billing_country, billing_postal_code, total, status, payment_method) VALUES
(17, '2023-01-10', '1 Microsoft Way', 'Redmond', 'WA', 'USA', '98052', 1529.98, 'delivered', 'Credit Card'),
(2, '2023-01-15', 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', 59.99, 'delivered', 'PayPal'),
(16, '2023-01-20', '1600 Amphitheatre Parkway', 'Mountain View', 'CA', 'USA', '94043', 2499.99, 'delivered', 'Credit Card'),
(17, '2023-02-05', '1 Microsoft Way', 'Redmond', 'WA', 'USA', '98052', 999.99, 'delivered', 'Credit Card'),
(3, '2023-02-10', '1498 rue Bélanger', 'Montréal', 'QC', 'Canada', 'H2G 1A7', 89.98, 'shipped', 'Debit Card'),
(19, '2023-02-14', '1 Infinite Loop', 'Cupertino', 'CA', 'USA', '95014', 1199.99, 'delivered', 'Credit Card'),
(2, '2023-02-20', 'Theodor-Heuss-Straße 34', 'Stuttgart', NULL, 'Germany', '70174', 249.99, 'processing', 'PayPal'),
(6, '2023-03-01', 'Rilská 3174/6', 'Prague', NULL, 'Czech Republic', '14300', 1799.99, 'delivered', 'Credit Card'),
(14, '2023-03-05', '8210 111 ST NW', 'Edmonton', 'AB', 'Canada', 'T6G 2C7', 1349.98, 'delivered', 'Credit Card'),
(16, '2023-03-10', '1600 Amphitheatre Parkway', 'Mountain View', 'CA', 'USA', '94043', 599.99, 'delivered', 'Credit Card'),
(8, '2023-03-15', 'Grétrystraat 63', 'Brussels', NULL, 'Belgium', '1000', 749.99, 'shipped', 'Debit Card'),
(10, '2023-03-20', 'Rua Dr. Falcão Filho, 155', 'São Paulo', 'SP', 'Brazil', '01007-010', 849.99, 'processing', 'Credit Card'),
(1, '2023-03-25', 'Av. Brigadeiro Faria Lima, 2170', 'São José dos Campos', 'SP', 'Brazil', '12227-000', 399.99, 'delivered', 'PayPal'),
(17, '2023-04-01', '1 Microsoft Way', 'Redmond', 'WA', 'USA', '98052', 649.98, 'delivered', 'Credit Card'),
(19, '2023-04-05', '1 Infinite Loop', 'Cupertino', 'CA', 'USA', '95014', 1199.99, 'cancelled', 'Credit Card');

-- Order Items (for join exercises)
CREATE TABLE order_items (
    order_item_id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(order_id),
    track_id INTEGER REFERENCES tracks(id),
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO order_items (order_id, track_id, unit_price, quantity) VALUES
(1, 1, 0.99, 5),
(1, 2, 0.99, 3),
(2, 3, 0.99, 10),
(3, 4, 0.99, 15),
(4, 5, 0.99, 20),
(5, 6, 0.99, 8),
(6, 7, 0.99, 12),
(7, 8, 0.99, 6),
(8, 9, 0.99, 18),
(9, 10, 0.99, 14),
(10, 11, 0.99, 9),
(11, 12, 0.99, 11),
(12, 13, 0.99, 7),
(13, 14, 0.99, 16),
(14, 15, 0.99, 13);

-- =========================================
-- INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX idx_tracks_album_id ON tracks(album_id);
CREATE INDEX idx_tracks_genre_id ON tracks(genre_id);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_country ON customers(country);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- =========================================
-- VIEWS FOR COMMON QUERIES
-- =========================================

CREATE OR REPLACE VIEW customer_order_summary AS
SELECT 
    c.id as customer_id,
    c.first_name,
    c.last_name,
    c.email,
    'N/A' as loyalty_tier,
    COUNT(o.order_id) as total_orders,
    COALESCE(SUM(o.total), 0) as total_spent,
    MAX(o.order_date) as last_order_date
FROM customers c
LEFT JOIN orders o ON c.id = o.customer_id
GROUP BY c.id, c.first_name, c.last_name, c.email;


-- =========================================
-- DATA WAREHOUSE - DIMENSIONAL MODEL (STAR SCHEMA)
-- =========================================

-- Dimension: Date
CREATE TABLE dim_date (
    date_key SERIAL PRIMARY KEY,
    date_value DATE UNIQUE NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    month INTEGER NOT NULL,
    month_name VARCHAR(20) NOT NULL,
    week INTEGER NOT NULL,
    day_of_month INTEGER NOT NULL,
    day_of_week INTEGER NOT NULL,
    day_name VARCHAR(20) NOT NULL,
    is_weekend BOOLEAN NOT NULL,
    is_holiday BOOLEAN DEFAULT FALSE
);

-- Dimension: Product
CREATE TABLE dim_product (
    product_key SERIAL PRIMARY KEY,
    product_id INTEGER UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    unit_price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    margin DECIMAL(5,2),
    supplier_name VARCHAR(150)
);

-- Dimension: Customer
CREATE TABLE dim_customer (
    customer_key SERIAL PRIMARY KEY,
    customer_id INTEGER UNIQUE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    loyalty_tier VARCHAR(20),
    signup_date DATE,
    -- SCD Type 2 fields
    effective_date DATE NOT NULL,
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE
);

-- Fact: Sales
CREATE TABLE fact_sales (
    sale_key SERIAL PRIMARY KEY,
    date_key INTEGER REFERENCES dim_date(date_key),
    product_key INTEGER REFERENCES dim_product(product_key),
    customer_key INTEGER REFERENCES dim_customer(customer_key),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    cost_amount DECIMAL(10,2),
    profit_amount DECIMAL(10,2)
);

-- Create indexes for better query performance
CREATE INDEX idx_fact_sales_date ON fact_sales(date_key);
CREATE INDEX idx_fact_sales_product ON fact_sales(product_key);
CREATE INDEX idx_fact_sales_customer ON fact_sales(customer_key);
CREATE INDEX idx_dim_date_value ON dim_date(date_value);
CREATE INDEX idx_dim_customer_current ON dim_customer(is_current);

-- Populate dim_date (2023-2025)
INSERT INTO dim_date (date_value, year, quarter, month, month_name, week, day_of_month, day_of_week, day_name, is_weekend)
SELECT 
    date_value,
    EXTRACT(YEAR FROM date_value)::INTEGER,
    EXTRACT(QUARTER FROM date_value)::INTEGER,
    EXTRACT(MONTH FROM date_value)::INTEGER,
    TO_CHAR(date_value, 'Month'),
    EXTRACT(WEEK FROM date_value)::INTEGER,
    EXTRACT(DAY FROM date_value)::INTEGER,
    EXTRACT(DOW FROM date_value)::INTEGER,
    TO_CHAR(date_value, 'Day'),
    EXTRACT(DOW FROM date_value)::INTEGER IN (0, 6)
FROM generate_series('2023-01-01'::DATE, '2025-12-31'::DATE, '1 day'::INTERVAL) AS date_value;

-- Populate dim_product from tracks
INSERT INTO dim_product (product_id, product_name, category, subcategory, unit_price, cost_price, margin, supplier_name)
SELECT 
    t.id,
    t.name,
    g.name,
    mt.name,
    ROUND((RANDOM() * 5 + 0.99)::numeric, 2),
    ROUND((RANDOM() * 2 + 0.50)::numeric, 2),
    ROUND((RANDOM() * 40 + 20)::numeric, 2),
    'Supplier ' || (RANDOM() * 10 + 1)::INTEGER
FROM tracks t
JOIN genres g ON t.genre_id = g.genre_id
JOIN media_types mt ON t.media_type_id = mt.media_type_id
LIMIT 500;

-- Populate dim_customer from customers (SCD Type 2)
INSERT INTO dim_customer (customer_id, customer_name, email, city, state, country, loyalty_tier, signup_date, effective_date, expiration_date, is_current)
SELECT 
    id,
    first_name || ' ' || last_name,
    email,
    city,
    state,
    country,
    'Standard',
    CURRENT_DATE,
    CURRENT_DATE,
    NULL,
    TRUE
FROM customers;

-- Populate fact_sales from order_items
INSERT INTO fact_sales (date_key, product_key, customer_key, quantity, unit_price, discount_amount, tax_amount, total_amount, cost_amount, profit_amount)
SELECT 
    dd.date_key,
    dp.product_key,
    dc.customer_key,
    oi.quantity,
    oi.unit_price,
    ROUND(oi.unit_price * oi.quantity * 0.05, 2) as discount,
    ROUND(oi.unit_price * oi.quantity * 0.08, 2) as tax,
    oi.unit_price * oi.quantity as total,
    dp.cost_price * oi.quantity as cost,
    (oi.unit_price - dp.cost_price) * oi.quantity as profit
FROM order_items oi
JOIN orders o ON oi.order_id = o.order_id
JOIN dim_date dd ON dd.date_value = o.order_date::DATE
JOIN dim_product dp ON dp.product_id = oi.track_id
JOIN dim_customer dc ON dc.customer_id = o.customer_id AND dc.is_current = TRUE
WHERE oi.track_id IN (SELECT product_id FROM dim_product);

-- =========================================
-- GRANT PERMISSIONS
-- =========================================

-- Create read-only user for safe query execution
CREATE USER readonly_user WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE sql4data_db TO readonly_user;
GRANT USAGE ON SCHEMA public TO readonly_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly_user;

-- Ensure main user has full access
GRANT ALL PRIVILEGES ON DATABASE sql4data_db TO sql4data_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO sql4data_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO sql4data_user;
