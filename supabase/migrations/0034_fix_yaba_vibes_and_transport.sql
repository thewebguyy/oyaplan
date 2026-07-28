-- Migration 0034: Enrich Yaba & Central spots with Dinner and Date Night vibe tags

UPDATE spots 
SET vibe_tags = ARRAY_APPEND(vibe_tags, 'Dinner')
WHERE (address_slug = 'yaba' OR address_slug = 'surulere' OR address_slug = 'gbagada')
  AND NOT ('Dinner' = ANY(vibe_tags));

UPDATE spots 
SET vibe_tags = ARRAY_APPEND(vibe_tags, 'Date Night')
WHERE (address_slug = 'yaba' OR address_slug = 'surulere' OR address_slug = 'gbagada')
  AND NOT ('Date Night' = ANY(vibe_tags));
