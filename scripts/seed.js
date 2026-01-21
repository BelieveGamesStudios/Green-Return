/**
 * Green Return Database Seed Script
 * 
 * Usage: node scripts/seed.js
 * Requirements: .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or SERVICE_ROLE_KEY for full access)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or Service Role Key for bypassing RLS

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const companies = [
    { name: 'Coca-Cola', color: '#F40009', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg' },
    { name: 'PepsiCo', color: '#004B93', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Pepsi_logo_2014.svg' },
    { name: 'Sprite', color: '#00AF43', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Sprite_Logo.svg' },
    { name: 'Nestlé Waters', color: '#0066B3', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Nestle_Waters_logo.svg/1200px-Nestle_Waters_logo.svg.png' },
    { name: 'Dr Pepper', color: '#7D0016', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Dr_Pepper_modern_logo.svg' },
    { name: 'EcoBrew (Local)', color: '#4CAF50', logo: 'https://via.placeholder.com/150?text=EcoBrew' }
];

const bottles = [
    { name: 'Cola Classic 500ml', size: '500ml', pattern: 'COCA-COLA|COKE' },
    { name: 'Cola Zero 500ml', size: '500ml', pattern: 'COKE ZERO|COCA-COLA ZERO' },
    { name: 'Pepsi 1L', size: '1L', pattern: 'PEPSI|PEPSI COLA' },
    { name: 'Pepsi Max 330ml', size: '330ml', pattern: 'PEPSI MAX' },
    { name: 'Sprite 2L', size: '2L', pattern: 'SPRITE' },
    { name: 'Sprite Zero 500ml', size: '500ml', pattern: 'SPRITE ZERO' },
    { name: 'Pure Life Water 500ml', size: '500ml', pattern: 'NESTLE|PURE LIFE' },
    { name: 'Dr Pepper 500ml', size: '500ml', pattern: 'DR PEPPER' }
];

// Demo City: San Francisco (Hackathon Location Placeholder)
const baseLat = 37.7749;
const baseLong = -122.4194;

async function seed() {
    console.log('🌱 Starting Database Seed...');

    // 1. Clear existing data (optional, be careful in prod)
    // Note: Due to foreign keys, order matters for deletion
    console.log('🧹 Clearing old data...');
    await supabase.from('scans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('collection_points').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('bottles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Companies
    console.log('🏭 Inserting Companies...');
    const createdCompanies = [];
    for (const comp of companies) {
        const { data, error } = await supabase.from('companies').insert({
            name: comp.name,
            brand_color: comp.color,
            logo_url: comp.logo
        }).select();

        if (error) console.error('Error inserting company:', error);
        else createdCompanies.push(data[0]);
    }

    // 3. Insert Bottles & Campaigns per Company
    console.log('🍾 Inserting Bottles & Campaigns...');
    const allBottles = [];
    const allCampaigns = [];

    for (const company of createdCompanies) {
        // Create Bottles
        const companyBottles = bottles.filter(b =>
            b.name.toLowerCase().includes(company.name.split(' ')[0].toLowerCase().replace('pepsico', 'pepsi').replace('nestlé', 'nestle'))
        );

        // Fallback for generic or mis-matched
        if (companyBottles.length === 0 && company.name === 'EcoBrew (Local)') {
            companyBottles.push({ name: 'EcoBrew IPA 330ml', size: '330ml', pattern: 'ECOBREW' });
        }

        for (const b of companyBottles) {
            const { data } = await supabase.from('bottles').insert({
                company_id: company.id,
                name: b.name,
                size: b.size,
                barcode_pattern: b.pattern
            }).select();
            if (data) allBottles.push(data[0]);
        }

        // Create Campaigns
        const reward = Math.floor(Math.random() * 40) + 10; // 10-50 points
        const { data: campData } = await supabase.from('campaigns').insert({
            company_id: company.id,
            name: `${company.name} Recycling Drive`,
            description: `Earn ${reward} points for every ${company.name} bottle recycled!`,
            reward_amount: reward,
            start_date: new Date().toISOString(),
            end_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // +90 days
            status: 'Active'
        }).select();
        if (campData) allCampaigns.push(campData[0]);
    }

    // 4. Insert Collection Points
    console.log('📍 Inserting Collection Points...');
    const points = [];
    for (let i = 0; i < 10; i++) {
        points.push({
            name: `Recycle Station #${i + 1}`,
            address: `${100 + i * 20} Market St, San Francisco, CA`,
            latitude: baseLat + (Math.random() - 0.5) * 0.05,
            longitude: baseLong + (Math.random() - 0.5) * 0.05,
            // company_id can be null or random
        });
    }
    await supabase.from('collection_points').insert(points);

    // 5. Create Mock Scans
    console.log('📜 Creating Mock History...');
    const scans = [];
    for (let i = 0; i < 50; i++) {
        const bottle = allBottles[Math.floor(Math.random() * allBottles.length)];
        // Find matching campaign (simplified)
        const campaign = allCampaigns.find(c => c.company_id === bottle.company_id);

        if (bottle && campaign) {
            scans.push({
                bottle_id: bottle.id,
                campaign_id: campaign.id,
                points_earned: campaign.reward_amount,
                scanned_at: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 30 days
                location_lat: baseLat,
                location_long: baseLong
            });
        }
    }
    if (scans.length > 0) {
        await supabase.from('scans').insert(scans);
    }

    console.log('✅ Database Seeded Successfully!');
}

seed().catch(console.error);
