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

-- Spots (80 realistic Lagos spots)
INSERT INTO spots (name, address, area_id, vibe_tags, price_per_person, transport_matrix, active) VALUES
-- Ikeja Spots
('Yellow Chilli', '35 Joel Ogunnaike St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Chill", "Foodie", "Dinner"}', 8500, '{"ikeja": 1000, "gbagada": 2500, "yaba": 3000, "surulere": 3500, "ogudu": 2200, "agege": 1500, "lekki-phase-1": 6000, "vi": 6500, "ikoyi": 6500, "maryland": 1800, "ebute-metta": 4000, "apapa": 5500}', true),
('The Place Ikeja', '45 Isaac John St, Ikeja', '11111111-1111-1111-1111-111111111111', '{"Casual", "Quick", "Loud"}', 3500, '{"ikeja": 800, "gbagada": 2200, "yaba": 2800, "surulere": 3200, "ogudu": 2000, "agege": 1200, "lekki-phase-1": 5500, "vi": 6000, "ikoyi": 6000, "maryland": 1500, "ebute-metta": 3800, "apapa": 5000}', true),
('Ocean Basket Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Foodie", "Chill", "Family"}', 9500, '{"ikeja": 1200, "gbagada": 2700, "yaba": 3200, "surulere": 3700, "ogudu": 2400, "agege": 1800, "lekki-phase-1": 6500, "vi": 7000, "ikoyi": 7000, "maryland": 2000, "ebute-metta": 4200, "apapa": 6000}', true),
('Rhapsody’s Ikeja', 'Ikeja City Mall', '11111111-1111-1111-1111-111111111111', '{"Loud", "Party", "Drinks"}', 12000, '{"ikeja": 1200, "gbagada": 2700, "yaba": 3200, "surulere": 3700, "ogudu": 2400, "agege": 1800, "lekki-phase-1": 6500, "vi": 7000, "ikoyi": 7000, "maryland": 2000, "ebute-metta": 4200, "apapa": 6000}', true),
('Burgers and Shakes', 'Ikeja GRA', '11111111-1111-1111-1111-111111111111', '{"Casual", "Quick", "Chill"}', 5500, '{"ikeja": 1000, "gbagada": 2500, "yaba": 3000, "surulere": 3500, "ogudu": 2200, "agege": 1500, "lekki-phase-1": 6000, "vi": 6500, "ikoyi": 6500, "maryland": 1800, "ebute-metta": 4000, "apapa": 5500}', true),

-- Surulere Spots
('Amala Shitta', 'Shitta Roundabout, Surulere', '44444444-4444-4444-4444-444444444444', '{"Street", "Quick", "Local"}', 2500, '{"surulere": 500, "yaba": 1200, "ikeja": 3500, "gbagada": 2800, "vi": 3500, "lekki-phase-1": 4500}', true),
('Bukka Hut Surulere', 'Bode Thomas St, Surulere', '44444444-4444-4444-4444-444444444444', '{"Casual", "Foodie", "Lunch"}', 4500, '{"surulere": 800, "yaba": 1500, "ikeja": 3800, "gbagada": 3000, "vi": 3800, "lekki-phase-1": 4800}', true),
('Leisure Lake', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Chill", "Drinks", "Evening"}', 6000, '{"surulere": 1000, "yaba": 1800, "ikeja": 4000, "gbagada": 3200, "vi": 4000, "lekki-phase-1": 5000}', true),

-- VI Spots
('Hard Rock Cafe', 'Landmark Village, VI', '88888888-8888-8888-8888-888888888888', '{"Loud", "Party", "Dinner"}', 18000, '{"vi": 1500, "lekki-phase-1": 2500, "ikoyi": 2500, "ikeja": 6500, "surulere": 4500}', true),
('Shiro Lagos', 'Landmark Centre, VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Dinner", "Fancy"}', 25000, '{"vi": 1500, "lekki-phase-1": 2500, "ikoyi": 2500, "ikeja": 6500, "surulere": 4500}', true),
('Cactus Lagos', 'Ozumba Mbadiwe Ave, VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Family", "Brunch"}', 12000, '{"vi": 1200, "lekki-phase-1": 2200, "ikoyi": 2000, "ikeja": 6000, "surulere": 4000}', true),

-- Yaba Spots
('White House', 'Chapel St, Yaba', '33333333-3333-3333-3333-333333333333', '{"Local", "Quick", "Street"}', 3000, '{"yaba": 600, "surulere": 1200, "ikeja": 3000, "vi": 3500}', true),
('The Grid Lagos', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Chill", "Drinks", "Young"}', 7500, '{"yaba": 1000, "surulere": 1800, "ikeja": 3500, "vi": 4000}', true),

-- Lekki Spots
('Sailors Lounge', 'Admiralty Way, Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Drinks", "Evening"}', 11000, '{"lekki-phase-1": 1200, "vi": 2500, "ikoyi": 3000, "ikeja": 7000}', true),
('The Pavilion', 'Lekki Phase 1', '77777777-7777-7777-7777-777777777777', '{"Foodie", "Dinner", "Chill"}', 15000, '{"lekki-phase-1": 1500, "vi": 2800, "ikoyi": 3200, "ikeja": 7500}', true),

-- Gbagada Spots
('The Gbagada Grills', 'Gbagada Phase 2', '22222222-2222-2222-2222-222222222222', '{"Foodie", "Chill", "Dinner"}', 6500, '{"gbagada": 800, "ikeja": 2500, "yaba": 2000, "surulere": 2800}', true),
('Cold Stone Gbagada', 'Diya St, Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick", "Chill", "Brunch"}', 4000, '{"gbagada": 500, "ikeja": 2200, "yaba": 1800, "surulere": 2500}', true),

-- Ogudu Spots
('Ogudu Mall Food Court', 'Ogudu Rd', '55555555-5555-5555-5555-555555555555', '{"Quick", "Casual", "Foodie"}', 4500, '{"ogudu": 500, "gbagada": 1000, "ikeja": 2000}', true),
('The Backyard Ogudu', 'Ogudu GRA', '55555555-5555-5555-5555-555555555555', '{"Chill", "Drinks", "Dinner"}', 8000, '{"ogudu": 1000, "gbagada": 1500, "ikeja": 2500}', true),

-- Ikoyi Spots
('The Danfo Bistro', 'Alexander Rd, Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Foodie", "Chill", "Brunch"}', 12000, '{"ikoyi": 1000, "vi": 2000, "lekki-phase-1": 3000, "surulere": 4000}', true),
('Tavern Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Dinner", "Fancy", "Drinks"}', 18000, '{"ikoyi": 1500, "vi": 2500, "lekki-phase-1": 3500, "ikeja": 6500}', true),

-- Agege Spots
('Agege Bread Hub', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Street", "Quick", "Local"}', 1500, '{"agege": 500, "ikeja": 1200, "maryland": 2500}', true),
('Big Treat Agege', 'Agege', '66666666-6666-6666-6666-666666666666', '{"Quick", "Casual", "Foodie"}', 3000, '{"agege": 800, "ikeja": 1500, "maryland": 2800}', true),

-- Maryland Spots
('Maryland Mall Food Court', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Foodie", "Chill"}', 4000, '{"maryland": 500, "ikeja": 1000, "gbagada": 1500}', true),
('The Place Maryland', 'Maryland', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Casual", "Lunch"}', 3500, '{"maryland": 600, "ikeja": 1200, "gbagada": 1800}', true),

-- Apapa Spots
('Apapa Club', 'Apapa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"Chill", "Dinner", "Fancy"}', 9000, '{"apapa": 1000, "surulere": 3500, "vi": 4500}', true),
('Oceanic Seafood', 'Apapa', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '{"Foodie", "Dinner", "Chill"}', 12000, '{"apapa": 1200, "surulere": 4000, "vi": 5000}', true),

-- More Spots (to reach 80)
('Mega Chicken Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick", "Casual"}', 4000, '{"ikeja": 800}', true),
('Genesis Cinemas', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Chill", "Drinks"}', 7000, '{"maryland": 500}', true),
('Krispy Kreme VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Brunch", "Quick"}', 3000, '{"vi": 1000}', true),
('Chicken Republic Yaba', 'Yaba', '33333333-3333-3333-3333-333333333333', '{"Quick", "Local"}', 2500, '{"yaba": 500}', true),
('Sweet Sensation Surulere', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick", "Casual"}', 3000, '{"surulere": 600}', true),
('Tantalizers Gbagada', 'Gbagada', '22222222-2222-2222-2222-222222222222', '{"Quick", "Casual"}', 2800, '{"gbagada": 500}', true),
('Nandos Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Foodie", "Chill"}', 8500, '{"ikeja": 1000}', true),
('Dominos Pizza Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Quick", "Party"}', 6000, '{"lekki-phase-1": 1000}', true),
('Cold Stone VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Quick"}', 4500, '{"vi": 1000}', true),
('Pizza Hut Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Quick", "Casual"}', 7000, '{"ikoyi": 1000}', true),
('Kilimanjaro Maryland', 'Maryland Mall', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"Quick", "Local"}', 3200, '{"maryland": 500}', true),
('KFC Ikeja Mall', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick", "Casual"}', 4500, '{"ikeja": 800}', true),
('Debonairs Pizza Surulere', 'Surulere', '44444444-4444-4444-4444-444444444444', '{"Quick", "Casual"}', 5500, '{"surulere": 800}', true),
('Double 4 VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Dinner"}', 15000, '{"vi": 1500}', true),
('Sherlaton Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Fancy", "Dinner"}', 20000, '{"ikeja": 2000}', true),
('Radisson Blu VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Chill"}', 25000, '{"vi": 2500}', true),
('Eko Hotel VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Party"}', 30000, '{"vi": 3000}', true),
('Federal Palace VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Dinner"}', 28000, '{"vi": 2800}', true),
('Four Points Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Fancy", "Chill"}', 22000, '{"lekki-phase-1": 2000}', true),
('Oriental Hotel VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Dinner"}', 26000, '{"vi": 2500}', true),
('Southern Sun Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Fancy", "Brunch"}', 24000, '{"ikoyi": 2200}', true),
('Protea Hotel Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Fancy", "Dinner"}', 22000, '{"ikeja": 1500}', true),
('Wheatbaker Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Fancy", "Dinner"}', 35000, '{"ikoyi": 3000}', true),
('Maison Fahrenheit VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Drinks"}', 18000, '{"vi": 2000}', true),
('The George Ikoyi', 'Ikoyi', '99999999-9999-9999-9999-999999999999', '{"Fancy", "Brunch"}', 32000, '{"ikoyi": 2800}', true),
('Z Kitchen VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Dinner"}', 28000, '{"vi": 2500}', true),
('Nok by Alara VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Dinner"}', 24000, '{"vi": 2200}', true),
('Terra Kulture VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Foodie"}', 12000, '{"vi": 1500}', true),
('Freedom Park Lagos Island', 'Lagos Island', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"Chill", "Drinks"}', 5000, '{"ebute-metta": 1500}', true),
('Muson Centre VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Chill"}', 15000, '{"vi": 1200}', true),
('Nike Art Gallery Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Fancy"}', 8000, '{"lekki-phase-1": 1500}', true),
('Lekki Conservation Centre', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Quick"}', 6000, '{"lekki-phase-1": 2000}', true),
('Tarkwa Bay Island', 'Lagos Island', '88888888-8888-8888-8888-888888888888', '{"Chill", "Party"}', 8000, '{"vi": 3000}', true),
('Omu Resort Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Family"}', 15000, '{"lekki-phase-1": 8000}', true),
('Lufasi Park Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Brunch"}', 5000, '{"lekki-phase-1": 3000}', true),
('Jhalobia Gardens Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Chill", "Brunch"}', 6000, '{"ikeja": 1000}', true),
('Johnson Jakande Tinubu Park Ikeja', 'Ikeja', '11111111-1111-1111-1111-111111111111', '{"Chill", "Quick"}', 2000, '{"ikeja": 500}', true),
('Muri Okunola Park VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Party"}', 3000, '{"vi": 1000}', true),
('Lekki Leisure Lake', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Party"}', 10000, '{"lekki-phase-1": 1500}', true),
('Upbeat Centre Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Party", "Quick"}', 12000, '{"lekki-phase-1": 1200}', true),
('Get Arena Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Party", "Quick"}', 15000, '{"lekki-phase-1": 1500}', true),
('Bay Lounge Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Dinner"}', 14000, '{"lekki-phase-1": 1400}', true),
('Vibe by Playa VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Drinks"}', 20000, '{"vi": 2000}', true),
('Quilox VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Loud"}', 50000, '{"vi": 5000}', true),
('Cubana VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Loud"}', 45000, '{"vi": 4500}', true),
('Zaza VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Party", "Fancy"}', 40000, '{"vi": 4000}', true),
('Velvett VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Fancy"}', 30000, '{"vi": 3000}', true),
('The Sky Restaurant VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Dinner"}', 60000, '{"vi": 6000}', true),
('Slow VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Foodie"}', 45000, '{"vi": 4500}', true),
('Turaka VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Drinks"}', 15000, '{"vi": 1500}', true),
('Atmosphere Rooftop Lekki', 'Lekki', '77777777-7777-7777-7777-777777777777', '{"Chill", "Drinks"}', 18000, '{"lekki-phase-1": 1800}', true),
('Kapadoccia VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Fancy", "Dinner"}', 35000, '{"vi": 3500}', true),
('Tea Room VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Brunch", "Fancy"}', 15000, '{"vi": 1500}', true),
('Burg Co VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Quick"}', 12000, '{"vi": 1200}', true),
('Hans and Rene VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Chill", "Quick"}', 6000, '{"vi": 1000}', true),
('Eric Kayser VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Brunch", "Foodie"}', 14000, '{"vi": 1400}', true),
('La Brioche VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Brunch", "Fancy"}', 12000, '{"vi": 1200}', true),
('Orchid House VI', 'VI', '88888888-8888-8888-8888-888888888888', '{"Foodie", "Dinner"}', 18000, '{"vi": 1800}', true)
;

