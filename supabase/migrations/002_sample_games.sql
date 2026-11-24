-- Insert 5 Popular Games into the Catalog
-- Run this after completing both migrations (000_base_tables.sql and 001_gaming_sessions_schema.sql)

INSERT INTO games (name, description, image_url, steam_app_id, requires_ownership, minimum_credits)
VALUES
    (
        'Cyberpunk 2077',
        'Open-world action RPG set in Night City. Experience a dystopian future with advanced technology and deep character customization.',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg',
        '1091500',
        false,
        10
    ),
    (
        'Elden Ring',
        'Action RPG from FromSoftware and George R.R. Martin. Explore a vast fantasy world with challenging combat and rich lore.',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg',
        '1245620',
        false,
        10
    ),
    (
        'Red Dead Redemption 2',
        'Epic tale of life in America at the dawn of the modern age. Open-world western adventure with stunning visuals.',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg',
        '1174180',
        false,
        15
    ),
    (
        'Grand Theft Auto V',
        'Open-world action game set in Los Santos. Play through an interwoven story with three protagonists or explore online multiplayer.',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/271590/header.jpg',
        '271590',
        false,
        10
    ),
    (
        'The Witcher 3: Wild Hunt',
        'Award-winning open-world RPG. Hunt monsters as Geralt of Rivia in a visually stunning fantasy world with deep storytelling.',
        'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg',
        '292030',
        false,
        10
    )
ON CONFLICT DO NOTHING;

-- Verify the games were inserted
SELECT
    id,
    name,
    steam_app_id,
    minimum_credits,
    requires_ownership,
    created_at
FROM games
ORDER BY name;
