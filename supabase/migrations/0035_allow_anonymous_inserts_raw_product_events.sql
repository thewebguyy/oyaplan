-- Migration: Allow anonymous inserts on raw_product_events for analytics tracking
-- Created at: 2026-07-30

CREATE POLICY "Anyone can insert events" ON public.raw_product_events 
FOR INSERT 
WITH CHECK (true);
