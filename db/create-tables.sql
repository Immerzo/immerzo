CREATE TABLE k_logs (
    id SERIAL PRIMARY KEY,
    game_id VARCHAR(256) NOT NULL,
    object_id VARCHAR(256) NOT NULL,
    object_type VARCHAR(32) NOT NULL,
    action VARCHAR(32),
    player_id VARCHAR(256),
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_users (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES k_users(id) ON DELETE SET NULL,
    username VARCHAR(256) UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    user_type VARCHAR(1) NOT NULL,
    categories TEXT[],
    platforms TEXT[],
    handles TEXT,
    pic VARCHAR(64),
    image VARCHAR(64),
    industry VARCHAR(256),
    corporate_role VARCHAR(64),
    motivation VARCHAR(64),
    url VARCHAR(2048),
    city VARCHAR(128),
    country VARCHAR(64),
    rating NUMERIC NOT NULL DEFAULT 0,
    reviews NUMERIC NOT NULL DEFAULT 0,
    bid_min NUMERIC,
    bid_max NUMERIC,
    followers NUMERIC,
    code VARCHAR(32),
    state CHAR(1) NOT NULL DEFAULT 'A',
    updated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_projects (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES k_users(id),
    brand_name TEXT,
    creator_id INTEGER REFERENCES k_users(id),
    title TEXT NOT NULL,
    description TEXT,
    categories TEXT[],
    platforms TEXT[],
    budget NUMERIC,
    state CHAR(1) NOT NULL DEFAULT 'I',
    game_id VARCHAR(256),
    published_at TIMESTAMP,
    updated_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_rsvps (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES k_projects(id) NOT NULL,
    creator_id INTEGER REFERENCES k_users(id) NOT NULL,
    accepted BOOLEAN NOT NULL,
    proposal TEXT,
    bid NUMERIC,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_files (
    id SERIAL PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    location VARCHAR(64) NOT NULL,
    size NUMERIC NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_chats (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES k_projects(id),
    brand_id INTEGER REFERENCES k_users(id) NOT NULL,
    creator_id INTEGER REFERENCES k_users(id) NOT NULL,
    msg VARCHAR(4096),
    file_id INTEGER REFERENCES k_files(id),
    name VARCHAR(256),
    size NUMERIC,
    sender CHAR(1) NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_categories (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) NOT NULL,
    value VARCHAR(256) NOT NULL
);

CREATE TABLE k_platforms (
    id SERIAL PRIMARY KEY,
    key VARCHAR(64) NOT NULL,
    value VARCHAR(256) NOT NULL
);

CREATE TABLE k_invitations (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(1) NOT NULL,
    code VARCHAR(32) NOT NULL,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_shares (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES k_projects(id),
    uuid TEXT,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_invoices (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES k_users(id) NOT NULL,
    project_id INTEGER REFERENCES k_projects(id),
    title TEXT NOT NULL,
    amount NUMERIC,
    state CHAR(1) NOT NULL DEFAULT 'A',
    due_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL
);

CREATE TABLE k_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES k_users(id) NOT NULL,
    invoice_id INTEGER REFERENCES k_invoices(id),
    title TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    reference TEXT,
    capture TEXT,
    state CHAR(1) NOT NULL DEFAULT 'T',
    created_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_k_chats_brand_creator_project
ON k_chats (brand_id, creator_id, project_id);

