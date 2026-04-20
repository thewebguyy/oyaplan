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
('99999999-9999-9999-9999-999911111111', 'Ikoyi', 'ikoyi'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Maryland', 'maryland'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Ebute Metta', 'ebute-metta'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Apapa', 'apapa')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug;

-- Spots
-- Note: transport_matrix entries follow the 2026 Zone Fare Logic.
-- Mainland: ikeja, gbagada, ogudu, agege, maryland
-- Central: yaba, surulere, ebute-metta
-- Island: lekki-phase-1, vi, ikoyi
-- Other: apapa

INSERT INTO spots (name, address, address_slug, area_id, vibe_tags, price_per_person, price_updated_at, price_source, transport_matrix, active, category, has_food, typical_duration_hours) VALUES
-- Ikeja (Mainland)
('Yellow Chilli', '35 Joel Ogunnaike St, Ikeja', 'ikeja', '11111111-1111-1111-1111-111111111111', '{"Dinner", "Foodie", "Party"}', 12500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":5000,"ogudu":5000,"agege":5000,"maryland":5000,"yaba":7000,"surulere":7000,"ebute-metta":7000,"lekki-phase-1":16000,"vi":16000,"ikoyi":16000,"apapa":10000}', true, 'restaurant', true, 2),
('The Place Ikeja', '45 Isaac John St, Ikeja', 'ikeja', '11111111-1111-1111-1111-111111111111', '{"Quick", "Chill"}', 4500, NOW(), 'chowdeck', '{"ikeja":2500,"gbagada":5000,"ogudu":5000,"agege":5000,"maryland":5000,"yaba":7000,"surulere":7000,"ebute-metta":7000,"lekki-phase-1":16000,"vi":16000,"ikoyi":16000,"apapa":10000}', true, 'restaurant', true, 1),
('Ocean Basket Ikeja', 'Ikeja City Mall', 'ikeja', '11111111-1111-1111-1111-111111111111', '{"Foodie", "Party"}', 18500, NOW(), 'instagram', '{"ikeja":2500,"gbagada":5000,"ogudu":5000,"agege":5000,"maryland":5000,"yaba":7000,"surulere":7000,"ebute-metta":7000,"lekki-phase-1":16000,"vi":16000,"ikoyi":16000,"apapa":10000}', true, 'restaurant', true, 2),

-- VI (Island)
('Shiro Lagos', 'Landmark Centre, VI', 'vi', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 35000, NOW(), 'instagram', '{"vi":2500,"lekki-phase-1":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'restaurant', true, 3),
('Hard Rock Cafe', 'Landmark Village, VI', 'vi', '88888888-8888-8888-8888-888888888888', '{"Party", "Foodie"}', 25000, NOW(), 'instagram', '{"vi":2500,"lekki-phase-1":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'restaurant', true, 3),

-- New Non-Restaurant Spots
('Lekki Conservation Centre', 'Lekki Expressway', 'lekki-phase-1', '77777777-7777-7777-7777-777777777777', '{"Chill", "Foodie"}', 5000, NOW(), 'manual', '{"lekki-phase-1":2500,"vi":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'nature', false, 3),
('Upbeat Centre', 'Lekki Phase 1', 'lekki-phase-1', '77777777-7777-7777-7777-777777777777', '{"Party", "Chill"}', 10000, NOW(), 'manual', '{"lekki-phase-1":2500,"vi":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'activity', false, 2),
('Nike Art Gallery', 'Ikate, Lekki', 'lekki-phase-1', '77777777-7777-7777-7777-777777777777', '{"Chill", "Dinner"}', 2000, NOW(), 'manual', '{"lekki-phase-1":2500,"vi":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'experience', false, 2),
('Genesis Cinemas Ikeja', 'Ikeja City Mall', 'ikeja', '11111111-1111-1111-1111-111111111111', '{"Chill", "Quick"}', 6000, NOW(), 'manual', '{"ikeja":2500,"gbagada":5000,"ogudu":5000,"agege":5000,"maryland":5000,"yaba":7000,"surulere":7000,"ebute-metta":7000,"lekki-phase-1":16000,"vi":16000,"ikoyi":16000,"apapa":10000}', true, 'entertainment', false, 3),
('Landmark Beach', 'Oniru, VI', 'vi', '88888888-8888-8888-8888-888888888888', '{"Party", "Chill"}', 3500, NOW(), 'manual', '{"vi":2500,"lekki-phase-1":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'beach', false, 4),
('Rufus & Bee', 'Twin Waters, Lekki', 'lekki-phase-1', '77777777-7777-7777-7777-777777777777', '{"Party", "Chill"}', 15000, NOW(), 'manual', '{"lekki-phase-1":2500,"vi":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'activity', true, 3),
('Vestar Coffee', 'Victoria Island', 'vi', '88888888-8888-8888-8888-888888888888', '{"Chill", "Quick"}', 6500, NOW(), 'manual', '{"vi":2500,"lekki-phase-1":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'cafe', true, 1),
('JJT Park', 'Alausa, Ikeja', 'ikeja', '11111111-1111-1111-1111-111111111111', '{"Chill", "Quick"}', 1000, NOW(), 'manual', '{"ikeja":2500,"gbagada":5000,"ogudu":5000,"agege":5000,"maryland":5000,"yaba":7000,"surulere":7000,"ebute-metta":7000,"lekki-phase-1":16000,"vi":16000,"ikoyi":16000,"apapa":10000}', true, 'nature', false, 2),
('Kapadoccia VI', 'Victoria Island', 'vi', '88888888-8888-8888-8888-888888888888', '{"Dinner", "Foodie"}', 45000, NOW(), 'manual', '{"vi":2500,"lekki-phase-1":5000,"ikoyi":5000,"yaba":9000,"surulere":9000,"ebute-metta":9000,"ikeja":16000,"gbagada":16000,"ogudu":16000,"agege":16000,"maryland":16000,"apapa":12000}', true, 'restaurant', true, 3);
