-- Areas
INSERT INTO areas (id, name, slug) VALUES 
('11111111-1111-1111-1111-111111111111', 'Ikeja', 'ikeja'),
('22222222-2222-2222-2222-222222222222', 'Gbagada', 'gbagada'),
('33333333-3333-3333-3333-333333333333', 'Yaba', 'yaba'),
('44444444-4444-4444-4444-444444444444', 'Surulere', 'surulere'),
('55555555-5555-5555-5555-555555555555', 'Ogudu', 'ogudu'),
('66666666-6666-6666-6666-666666666666', 'Agege', 'agege'),
('77777777-7777-7777-7777-777777777777', 'Lekki Phase 1', 'lekki-phase-1'),
('88888888-8888-8888-8888-888888888888', 'Victoria Island', 'vi'),
('99999999-9999-9999-9999-999999999999', 'Ikoyi', 'ikoyi'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maryland', 'maryland'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ebute Metta', 'ebute-metta'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Apapa', 'apapa')
ON CONFLICT (id) DO NOTHING;

-- TODO: Manual seed or Chowdeck merchant API sync
-- For future updates, either import via CSV in Supabase dashboard 
-- or implement a secure admin cron job to pull prices from Chowdeck/Jumia Food.
-- Example syncing structure:
-- fetch("https://api.chowdeck.com/v1/merchants/...") -> map response -> update spots SET price_per_person = ..., price_updated_at = NOW(), price_source = 'chowdeck'

-- Spots (50+ realistic Lagos spots, updated with new vibes and price metadata)
INSERT INTO spots (name, address, area_id, vibe_tags, price_per_person, price_updated_at, price_source, transport_matrix, active) VALUES
-- Ikeja
('Yellow Chilli', '35 Joel Ogunnaike St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Date Night", "Chop Life", "Squad Flex"}', 12500, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),
('The Place Ikeja', '45 Isaac John St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick Lunch", "Link Up"}', 4500, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),
('Ocean Basket Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Chop Life", "Squad Flex"}', 18500, NOW(), 'instagram', '{"ikeja": 1500, "gbagada": 3500}', true),
('Rhapsody’s Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Link Up", "Squad Flex"}', 15000, NOW(), 'manual', '{"ikeja": 1500, "gbagada": 3500}', true),
('Burgers and Shakes', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Lowkey", "Quick Lunch"}', 8500, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),
('Mega Chicken Ikeja', 'Agidingbi, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick Lunch", "Squad Flex"}', 5500, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),
('Sherlaton Ikeja', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Date Night", "Chop Life"}', 25000, NOW(), 'instagram', '{"ikeja": 1500, "gbagada": 3500}', true),
('KFC Ikeja Mall', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Quick Lunch", "Lowkey"}', 6000, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),
('Protea Hotel Ikeja', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Date Night", "Chop Life"}', 28000, NOW(), 'manual', '{"ikeja": 1500, "gbagada": 3500}', true),
('Nandos Ikeja', 'Isaac John, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Squad Flex", "Chop Life"}', 10500, NOW(), 'chowdeck', '{"ikeja": 1500, "gbagada": 3500}', true),

-- Surulere
('Amala Shitta', 'Shitta Roundabout, Surulere', '44444444-4444-4444-4444-444444444444', '{"Lowkey", "Quick Lunch"}', 3500, NOW(), 'manual', '{"surulere": 1500, "yaba": 2500}', true),
('Bukka Hut Surulere', 'Bode Thomas St, Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick Lunch", "Squad Flex"}', 5500, NOW(), 'chowdeck', '{"surulere": 1500, "yaba": 2500}', true),
('Leisure Lake', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Link Up", "Date Night"}', 8000, NOW(), 'instagram', '{"surulere": 1500, "yaba": 2500}', true),
('Sweet Sensation Surulere', 'Bode Thomas, Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick Lunch", "Lowkey"}', 4000, NOW(), 'chowdeck', '{"surulere": 1500, "yaba": 2500}', true),
('Debonairs Pizza Surulere', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Link Up", "Squad Flex"}', 7500, NOW(), 'chowdeck', '{"surulere": 1500, "yaba": 2500}', true),

-- Yaba
('White House', 'Chapel St, Yaba', '33333333-3333-3333-3333-333333333333', '{"Lowkey", "Quick Lunch"}', 4000, NOW(), 'manual', '{"yaba": 1500, "surulere": 2500}', true),
('The Grid Lagos', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Link Up", "Squad Flex"}', 9500, NOW(), 'instagram', '{"yaba": 1500, "surulere": 2500}', true),
('Chicken Republic Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Quick Lunch", "Lowkey"}', 3500, NOW(), 'chowdeck', '{"yaba": 1500, "surulere": 2500}', true),
('Domino’s Pizza Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Squad Flex", "Link Up"}', 8000, NOW(), 'chowdeck', '{"yaba": 1500, "surulere": 2500}', true),
('Korede Spaghetti Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Lowkey", "Quick Lunch"}', 2500, NOW(), 'manual', '{"yaba": 1500, "surulere": 2500}', true),

-- Gbagada
('The Gbagada Grills', 'Gbagada Phase 2', '22222222-2222-2222-2222-222222222222', '{"Link Up", "Squad Flex"}', 8500, NOW(), 'instagram', '{"gbagada": 1500, "ikeja": 3500}', true),
('Cold Stone Gbagada', 'Diya St, Gbagada', '22222222-2222-2222-2222-222222222222', '{"Link Up", "Lowkey"}', 5500, NOW(), 'chowdeck', '{"gbagada": 1500, "ikeja": 3500}', true),
('Tantalizers Gbagada', 'Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick Lunch", "Lowkey"}', 3500, NOW(), 'chowdeck', '{"gbagada": 1500, "ikeja": 3500}', true),
('KFC Gbagada', 'Diya St, Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick Lunch", "Squad Flex"}', 6000, NOW(), 'chowdeck', '{"gbagada": 1500, "ikeja": 3500}', true),
('Gbagada Express', 'Gbagada Phase 1', '22222222-2222-2222-2222-222222222222', '{"Lowkey", "Quick Lunch"}', 3000, NOW(), 'manual', '{"gbagada": 1500, "ikeja": 3500}', true),

-- Ogudu
('Ogudu Mall Food Court', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Quick Lunch", "Link Up"}', 5500, NOW(), 'manual', '{"ogudu": 1500, "gbagada": 2000}', true),
('The Backyard Ogudu', 'Ogudu GRA', '55555555-5555-5555-5555-555555555555', '{"Date Night", "Squad Flex"}', 10000, NOW(), 'instagram', '{"ogudu": 1500, "gbagada": 2000}', true),
('Domino’s Pizza Ogudu', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Squad Flex", "Link Up"}', 8500, NOW(), 'chowdeck', '{"ogudu": 1500, "gbagada": 2000}', true),
('Cold Stone Ogudu', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Lowkey", "Link Up"}', 5000, NOW(), 'chowdeck', '{"ogudu": 1500, "gbagada": 2000}', true),
('Bukka Hut Ogudu', 'Ogudu GRA', '55555555-5555-5555-5555-555555555555', '{"Quick Lunch", "Chop Life"}', 5500, NOW(), 'chowdeck', '{"ogudu": 1500, "gbagada": 2000}', true),

-- Agege
('Agege Bread Hub', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Lowkey", "Quick Lunch"}', 2000, NOW(), 'manual', '{"agege": 1000, "ikeja": 2500}', true),
('Big Treat Agege', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Quick Lunch", "Link Up"}', 4000, NOW(), 'chowdeck', '{"agege": 1000, "ikeja": 2500}', true),

-- Maryland
('Maryland Mall Food Court', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick Lunch", "Link Up"}', 5000, NOW(), 'manual', '{"maryland": 1000, "ikeja": 2000}', true),
('The Place Maryland', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick Lunch", "Lowkey"}', 4500, NOW(), 'chowdeck', '{"maryland": 1000, "ikeja": 2000}', true),
('Genesis Cinemas', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Link Up", "Date Night"}', 9000, NOW(), 'manual', '{"maryland": 1000, "ikeja": 2000}', true),
('Kilimanjaro Maryland', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick Lunch", "Squad Flex"}', 4200, NOW(), 'chowdeck', '{"maryland": 1000, "ikeja": 2000}', true),

-- VI & Lekki & Ikoyi (Islands)
('Hard Rock Cafe', 'Landmark Village, VI', '88888888-8888-8888-8888-888888888888', '{"Squad Flex", "Chop Life"}', 25000, NOW(), 'instagram', '{"vi": 1500}', true),
('Shiro Lagos', 'Landmark Centre, VI', '88888888-8888-8888-8888-888888888888', '{"Date Night", "Chop Life"}', 35000, NOW(), 'instagram', '{"vi": 1500}', true),
('Cactus Lagos', 'Ozumba Mbadiwe Ave, VI', '88888888-8888-8888-8888-888888888888', '{"Link Up", "Date Night"}', 18000, NOW(), 'manual', '{"vi": 1500}', true),
('Sailors Lounge', 'Admiralty Way, Lekki', '77777777-7777-7777-7777-777777777777', '{"Link Up", "Squad Flex"}', 15000, NOW(), 'instagram', '{"lekki-phase-1": 1500}', true),
('The Pavilion', 'Lekki Phase 1', '77777777-7777-7777-7777-777777777777', '{"Date Night", "Chop Life"}', 22000, NOW(), 'instagram', '{"lekki-phase-1": 1500}', true),
('The Danfo Bistro', 'Alexander Rd, Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Link Up", "Squad Flex"}', 18000, NOW(), 'chowdeck', '{"ikoyi": 1500}', true),
('Tavern Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Date Night", "Chop Life"}', 25000, NOW(), 'manual', '{"ikoyi": 1500}', true),
('Z Kitchen VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Date Night", "Chop Life"}', 35000, NOW(), 'instagram', '{"vi": 1500}', true),
('Nok by Alara VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Date Night", "Chop Life"}', 32000, NOW(), 'instagram', '{"vi": 1500}', true),
('Terra Kulture VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Link Up", "Lowkey"}', 15000, NOW(), 'manual', '{"vi": 1500}', true),
('Nike Art Gallery Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Link Up", "Lowkey"}', 10000, NOW(), 'manual', '{"lekki-phase-1": 1500}', true),
('Lekki Conservation Centre', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Link Up", "Squad Flex"}', 8000, NOW(), 'manual', '{"lekki-phase-1": 1500}', true),
('Quilox VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chop Life", "Squad Flex"}', 70000, NOW(), 'instagram', '{"vi": 1500}', true),
('Cubana VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chop Life", "Squad Flex"}', 60000, NOW(), 'instagram', '{"vi": 1500}', true),
('The Sky Restaurant VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Date Night", "Chop Life"}', 80000, NOW(), 'instagram', '{"vi": 1500}', true),
('Atmosphere Rooftop Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Link Up", "Squad Flex"}', 25000, NOW(), 'instagram', '{"lekki-phase-1": 1500}', true),
('Kapadoccia VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Date Night", "Chop Life"}', 45000, NOW(), 'instagram', '{"vi": 1500}', true);
