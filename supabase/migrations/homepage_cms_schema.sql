-- Homepage Content Management System Database Schema
-- This migration creates tables for managing homepage content dynamically

-- Create homepage_sections table
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_type VARCHAR(50) NOT NULL CHECK (section_type IN ('hero', 'new_this_week', 'xiv_collections', 'approach')),
    content JSONB NOT NULL DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    scheduled_publish_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create homepage_images table
CREATE TABLE homepage_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create collection_items table
CREATE TABLE collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES homepage_sections(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_homepage_sections_type ON homepage_sections(section_type);
CREATE INDEX idx_homepage_sections_status ON homepage_sections(status);
CREATE INDEX idx_homepage_images_section ON homepage_images(section_id);
CREATE INDEX idx_collection_items_section ON collection_items(section_id);
CREATE INDEX idx_collection_items_product ON collection_items(product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for homepage_sections
CREATE POLICY "Public can view published homepage sections" ON homepage_sections
    FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage homepage sections" ON homepage_sections
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for homepage_images
CREATE POLICY "Public can view homepage images" ON homepage_images
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage homepage images" ON homepage_images
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for collection_items
CREATE POLICY "Public can view collection items" ON collection_items
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage collection items" ON collection_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON homepage_sections TO anon;
GRANT SELECT ON homepage_images TO anon;
GRANT SELECT ON collection_items TO anon;

GRANT ALL PRIVILEGES ON homepage_sections TO authenticated;
GRANT ALL PRIVILEGES ON homepage_images TO authenticated;
GRANT ALL PRIVILEGES ON collection_items TO authenticated;

-- Insert initial data for homepage sections
INSERT INTO homepage_sections (section_type, content, status) VALUES
('hero', '{
    "title": "Welcome to Espada",
    "subtitle": "Discover our premium collection",
    "cta_text": "Shop Collections",
    "navigation_categories": [
        {"name": "Sudo", "href": "/sudo"},
        {"name": "XVII", "href": "/xvii"},
        {"name": "Teyo", "href": "/teyo"}
    ]
}', 'published'),
('new_this_week', '{
    "title": "New This Week",
    "count": 50
}', 'published'),
('xiv_collections', '{
    "title": "XIV Collections",
    "count": 50
}', 'published'),
('approach', '{
    "title": "Our Approach",
    "paragraphs": [
        "We believe in creating timeless pieces that transcend seasonal trends. Our approach to fashion is rooted in sustainability, quality craftsmanship, and innovative design. Each piece in our collection is carefully curated to ensure it meets our high standards for both style and durability.",
        "From the initial concept to the final product, we work closely with skilled artisans and use only the finest materials. Our commitment to ethical production practices ensures that every garment is made with respect for both the environment and the people who create them."
    ]
}', 'published');

-- Insert initial hero images
INSERT INTO homepage_images (section_id, image_url, alt_text, display_order)
SELECT 
    (SELECT id FROM homepage_sections WHERE section_type = 'hero'),
    '/images/mg0ujxhg-rt8uqe1.png',
    'Collection item',
    1
UNION ALL
SELECT 
    (SELECT id FROM homepage_sections WHERE section_type = 'hero'),
    '/images/mg0ujxhg-glpb31v.png',
    'Collection item',
    2;

-- Insert initial approach images
INSERT INTO homepage_images (section_id, image_url, alt_text, display_order)
SELECT 
    (SELECT id FROM homepage_sections WHERE section_type = 'approach'),
    '/images/mg0ujxhg-rt8uqe1.png',
    'Sustainable Materials',
    1
UNION ALL
SELECT 
    (SELECT id FROM homepage_sections WHERE section_type = 'approach'),
    '/images/mg0ujxhg-glpb31v.png',
    'Quality Craftsmanship',
    2
UNION ALL
SELECT 
    (SELECT id FROM homepage_sections WHERE section_type = 'approach'),
    '/images/mg0ujxhg-rt8uqe1.png',
    'Innovative Design',
    3;