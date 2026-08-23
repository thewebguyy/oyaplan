-- Migration 0043: Add explanation & transport_estimate columns to shared_plans, and secondary_experience & food_type to spots.

-- 1. Alter shared_plans table
ALTER TABLE public.shared_plans 
ADD COLUMN IF NOT EXISTS explanation JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS transport_estimate JSONB DEFAULT NULL;

-- 2. Alter spots table
ALTER TABLE public.spots
ADD COLUMN IF NOT EXISTS secondary_experience TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS food_type TEXT DEFAULT NULL;

-- 3. Populate new columns for Cafe One spots
UPDATE public.spots
SET category = 'cafe',
    secondary_experience = 'workspace',
    food_type = 'pastries'
WHERE name LIKE 'Cafe One%';
