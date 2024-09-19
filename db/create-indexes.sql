-- for get_users()
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_kusers_parent_id ON k_users(parent_id);
CREATE INDEX idx_kusers_user_type ON k_users(user_type);
CREATE INDEX idx_kusers_rating_followers ON k_users(rating DESC, followers DESC NULLS LAST);
CREATE INDEX idx_kusers_name_trgm ON k_users USING GIN (name gin_trgm_ops);
CREATE INDEX idx_kusers_categories_gin ON k_users USING GIN (categories);
CREATE INDEX idx_kusers_platforms_gin ON k_users USING GIN (platforms);

