"""
Database Migration: Add Stripe and Usage Tracking to Existing Users Table
Run this SQL in your PostgreSQL database to add new columns to the users table
"""

-- Add Stripe integration columns to existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE;

-- Add AI usage tracking columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_ai_usage_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_usage_reset TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Update user_query_executions to use users.id instead of creating new foreign key
-- (The table already has user_id if using auth system)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='user_query_executions' AND column_name='user_id'
    ) THEN
        ALTER TABLE user_query_executions 
        ADD COLUMN user_id INTEGER REFERENCES users(id);
        
        CREATE INDEX IF NOT EXISTS idx_executions_user ON user_query_executions(user_id);
    END IF;
END $$;

-- Add comments
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for payment processing';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID for active subscription';
COMMENT ON COLUMN users.subscription_status IS 'Subscription status: active, inactive, cancelled, past_due';
COMMENT ON COLUMN users.subscription_end_date IS 'When the current subscription period ends';
COMMENT ON COLUMN users.daily_ai_usage_count IS 'Number of AI feedback requests today (resets daily at midnight)';
COMMENT ON COLUMN users.last_usage_reset IS 'Last time usage counter was reset';

-- Verify migration
SELECT 
    'Migration completed successfully. New columns added:' as status,
    COUNT(*) FILTER (WHERE column_name = 'stripe_customer_id') as has_stripe_customer_id,
    COUNT(*) FILTER (WHERE column_name = 'stripe_subscription_id') as has_stripe_subscription_id,
    COUNT(*) FILTER (WHERE column_name = 'subscription_status') as has_subscription_status,
    COUNT(*) FILTER (WHERE column_name = 'daily_ai_usage_count') as has_daily_usage,
    COUNT(*) FILTER (WHERE column_name = 'last_usage_reset') as has_usage_reset
FROM information_schema.columns 
WHERE table_name = 'users';
