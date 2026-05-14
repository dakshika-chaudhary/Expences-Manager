CREATE TABLE app_users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otp_verifications (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE salary_plans (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    month VARCHAR(7) NOT NULL,
    salary NUMERIC(14, 2) NOT NULL DEFAULT 0,
    savings_target NUMERIC(14, 2) NOT NULL DEFAULT 0,
    UNIQUE (user_id, month)
);

CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    name VARCHAR(100) NOT NULL,
    predefined BOOLEAN NOT NULL DEFAULT FALSE,
    monthly_limit NUMERIC(14, 2) NOT NULL DEFAULT 0
);

CREATE TABLE budget_allocations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    month VARCHAR(7) NOT NULL,
    category VARCHAR(100) NOT NULL,
    limit_amount NUMERIC(14, 2) NOT NULL DEFAULT 0,
    UNIQUE (user_id, month, category)
);

CREATE TABLE expenses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    category VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    description TEXT,
    expense_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO categories (name, predefined, monthly_limit) VALUES
('Food', TRUE, 12000),
('Rent', TRUE, 25000),
('Transport', TRUE, 5000),
('Utilities', TRUE, 6000),
('Health', TRUE, 4000),
('Education', TRUE, 5000),
('Entertainment', TRUE, 3000),
('Savings', TRUE, 10000);
