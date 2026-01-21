-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    brand_color TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Profiles (Extends Supabase Auth)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    username TEXT,
    avatar_url TEXT,
    total_points INTEGER DEFAULT 0,
    bottles_scanned INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    description TEXT,
    reward_amount INTEGER DEFAULT 10, -- Points per bottle
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    status TEXT CHECK (status IN ('Active', 'Draft', 'Expired')) DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Bottles
CREATE TABLE IF NOT EXISTS bottles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id),
    name TEXT NOT NULL,
    size TEXT, -- e.g. '500ml', '1L'
    barcode_pattern TEXT, -- Simplified matching pattern
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Collection Points
CREATE TABLE IF NOT EXISTS collection_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id), -- Optional: if specific to a brand
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Scans (History)
CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Can be NULL for anonymous/demo scans
    bottle_id UUID REFERENCES bottles(id),
    campaign_id UUID REFERENCES campaigns(id),
    points_earned INTEGER NOT NULL,
    location_lat DOUBLE PRECISION,
    location_long DOUBLE PRECISION,
    scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies (Simplified for Hackathon Demo)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read companies" ON companies FOR SELECT USING (true);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);

ALTER TABLE bottles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read bottles" ON bottles FOR SELECT USING (true);

ALTER TABLE collection_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read collection_points" ON collection_points FOR SELECT USING (true);

-- Allow public read/write for demo purposes or restrict as needed
ALTER TABLE scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert scans" ON scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read scans" ON scans FOR SELECT USING (true);
