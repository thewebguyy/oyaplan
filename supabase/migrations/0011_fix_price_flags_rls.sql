-- price_flags was created in 0001 without RLS. This migration corrects that.
ALTER TABLE price_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert price flags" ON price_flags
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Price flags are not publicly readable" ON price_flags
  FOR SELECT TO anon USING (false);
