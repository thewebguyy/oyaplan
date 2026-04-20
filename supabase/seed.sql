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
('Yellow Chilli', '35 Joel Ogunnaike St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Dinner", "Foodie", "Party"}', 12500, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('The Place Ikeja', '45 Isaac John St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick", "Chill"}', 4500, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Ocean Basket Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Foodie", "Party"}', 18500, NOW(), 'instagram', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Rhapsody’s Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Chill", "Party"}', 15000, NOW(), 'manual', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Burgers and Shakes', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Chill", "Quick"}', 8500, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Mega Chicken Ikeja', 'Agidingbi, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick", "Party"}', 5500, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Sherlaton Ikeja', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Dinner", "Foodie"}', 25000, NOW(), 'instagram', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('KFC Ikeja Mall', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Quick", "Chill"}', 6000, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Protea Hotel Ikeja', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Dinner", "Foodie"}', 28000, NOW(), 'manual', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Nandos Ikeja', 'Isaac John, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Party", "Foodie"}', 10500, NOW(), 'chowdeck', '{"ikeja":1000,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),

-- Surulere
('Amala Shitta', 'Shitta Roundabout, Surulere', '44444444-4444-4444-4444-444444444444', '{"Chill", "Quick"}', 3500, NOW(), 'manual', '{"ikeja":3500,"gbagada":3500,"yaba":2500,"surulere":1000,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Bukka Hut Surulere', 'Bode Thomas St, Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick", "Party"}', 5500, NOW(), 'chowdeck', '{"ikeja":3500,"gbagada":3500,"yaba":2500,"surulere":1000,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Leisure Lake', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Chill", "Dinner"}', 8000, NOW(), 'instagram', '{"ikeja":3500,"gbagada":3500,"yaba":2500,"surulere":1000,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Sweet Sensation Surulere', 'Bode Thomas, Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick", "Chill"}', 4000, NOW(), 'chowdeck', '{"ikeja":3500,"gbagada":3500,"yaba":2500,"surulere":1000,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Debonairs Pizza Surulere', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Chill", "Party"}', 7500, NOW(), 'chowdeck', '{"ikeja":3500,"gbagada":3500,"yaba":2500,"surulere":1000,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),

-- Yaba
('White House', 'Chapel St, Yaba', '33333333-3333-3333-3333-333333333333', '{"Chill", "Quick"}', 4000, NOW(), 'manual', '{"ikeja":3500,"gbagada":3500,"yaba":1000,"surulere":2500,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('The Grid Lagos', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Chill", "Party"}', 9500, NOW(), 'instagram', '{"ikeja":3500,"gbagada":3500,"yaba":1000,"surulere":2500,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Chicken Republic Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Quick", "Chill"}', 3500, NOW(), 'chowdeck', '{"ikeja":3500,"gbagada":3500,"yaba":1000,"surulere":2500,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Domino’s Pizza Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Party", "Chill"}', 8000, NOW(), 'chowdeck', '{"ikeja":3500,"gbagada":3500,"yaba":1000,"surulere":2500,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),
('Korede Spaghetti Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Chill", "Quick"}', 2500, NOW(), 'manual', '{"ikeja":3500,"gbagada":3500,"yaba":1000,"surulere":2500,"ogudu":3500,"agege":3500,"lekki-phase-1":4000,"vi":4000,"ikoyi":4000,"maryland":3500,"ebute-metta":2500,"apapa":5000}', true),

-- Gbagada
('The Gbagada Grills', 'Gbagada Phase 2', '22222222-2222-2222-2222-222222222222', '{"Chill", "Party"}', 8500, NOW(), 'instagram', '{"ikeja":2500,"gbagada":1000,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Cold Stone Gbagada', 'Diya St, Gbagada', '22222222-2222-2222-2222-222222222222', '{"Chill", "Chill"}', 5500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":1000,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Tantalizers Gbagada', 'Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick", "Chill"}', 3500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":1000,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('KFC Gbagada', 'Diya St, Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick", "Party"}', 6000, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":1000,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Gbagada Express', 'Gbagada Phase 1', '22222222-2222-2222-2222-222222222222', '{"Chill", "Quick"}', 3000, NOW(), 'manual', '{"ikeja":2500,"gbagada":1000,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),

-- Ogudu
('Ogudu Mall Food Court', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Quick", "Chill"}', 5500, NOW(), 'manual', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":1000,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('The Backyard Ogudu', 'Ogudu GRA', '55555555-5555-5555-5555-555555555555', '{"Dinner", "Party"}', 10000, NOW(), 'instagram', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":1000,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Domino’s Pizza Ogudu', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Party", "Chill"}', 8500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":1000,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Cold Stone Ogudu', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Chill", "Chill"}', 5000, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":1000,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Bukka Hut Ogudu', 'Ogudu GRA', '55555555-5555-5555-5555-555555555555', '{"Quick", "Foodie"}', 5500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":1000,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),

-- Agege
('Agege Bread Hub', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Chill", "Quick"}', 2000, NOW(), 'manual', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":1000,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),
('Big Treat Agege', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Quick", "Chill"}', 4000, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":1000,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":2500,"ebute-metta":3500,"apapa":5000}', true),

-- Maryland
('Maryland Mall Food Court', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Chill"}', 5000, NOW(), 'manual', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":1000,"ebute-metta":3500,"apapa":5000}', true),
('The Place Maryland', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Chill"}', 4500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":1000,"ebute-metta":3500,"apapa":5000}', true),
('Genesis Cinemas', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Chill", "Dinner"}', 9000, NOW(), 'manual', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":1000,"ebute-metta":3500,"apapa":5000}', true),
('Kilimanjaro Maryland', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Party"}', 4200, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":2500,"yaba":3500,"surulere":3500,"ogudu":2500,"agege":2500,"lekki-phase-1":7500,"vi":7500,"ikoyi":7500,"maryland":1000,"ebute-metta":3500,"apapa":5000}', true),

-- VI & Lekki & Ikoyi (Islands)
('Hard Rock Cafe', 'Landmark Village, VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Foodie"}', 25000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Shiro Lagos', 'Landmark Centre, VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 35000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Cactus Lagos', 'Ozumba Mbadiwe Ave, VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Dinner"}', 18000, NOW(), 'manual', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Sailors Lounge', 'Admiralty Way, Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Party"}', 15000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":1000,"vi":2500,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('The Pavilion', 'Lekki Phase 1', '77777777-7777-7777-7777-777777777777', '{"Dinner", "Foodie"}', 22000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":1000,"vi":2500,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('The Danfo Bistro', 'Alexander Rd, Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Chill", "Party"}', 18000, NOW(), 'chowdeck', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":2500,"ikoyi":1000,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Tavern Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Dinner", "Foodie"}', 25000, NOW(), 'manual', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":2500,"ikoyi":1000,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Z Kitchen VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 35000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Nok by Alara VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 32000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Terra Kulture VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Chill"}', 15000, NOW(), 'manual', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Nike Art Gallery Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Chill"}', 10000, NOW(), 'manual', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":1000,"vi":2500,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Lekki Conservation Centre', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Party"}', 8000, NOW(), 'manual', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":1000,"vi":2500,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Quilox VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Party"}', 70000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Cubana VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Party"}', 60000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('The Sky Restaurant VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 80000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":2500,"vi":1000,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Atmosphere Rooftop Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Party"}', 25000, NOW(), 'instagram', '{"ikeja":7500,"gbagada":7500,"yaba":4000,"surulere":4000,"ogudu":7500,"agege":7500,"lekki-phase-1":1000,"vi":2500,"ikoyi":2500,"maryland":7500,"ebute-metta":4000,"apapa":5000}', true),
('Kapadoccia VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 45000, NOW(), 'instagram', '{"vi": 1500}', true);
