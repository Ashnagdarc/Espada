import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateProducts() {
  console.log('🔄 Migrating products...');
  
  try {
    const productsPath = path.join(__dirname, '..', 'data', 'admin', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    for (const product of productsData) {
      const { data, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          sizes: product.sizes,
          colors: product.colors,
          images: product.images,
          stock: product.stock,
          featured: product.featured,
          created_at: product.createdAt,
          updated_at: product.updatedAt
        });
      
      if (error) {
        console.error(`❌ Error inserting product ${product.name}:`, error);
      } else {
        console.log(`✅ Migrated product: ${product.name}`);
      }
    }
    
    console.log('✅ Products migration completed');
  } catch (error) {
    console.error('❌ Error migrating products:', error);
  }
}

async function migrateOrders() {
  console.log('🔄 Migrating orders...');
  
  try {
    const ordersPath = path.join(__dirname, '..', 'data', 'admin', 'orders.json');
    const ordersData = JSON.parse(fs.readFileSync(ordersPath, 'utf8'));
    
    for (const order of ordersData) {
      const { data, error } = await supabase
        .from('orders')
        .insert({
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          items: order.items,
          total: order.total,
          status: order.status,
          shipping_address: order.shippingAddress,
          created_at: order.createdAt,
          updated_at: order.updatedAt
        });
      
      if (error) {
        console.error(`❌ Error inserting order ${order.id}:`, error);
      } else {
        console.log(`✅ Migrated order: ${order.id} for ${order.customerName}`);
      }
    }
    
    console.log('✅ Orders migration completed');
  } catch (error) {
    console.error('❌ Error migrating orders:', error);
  }
}

async function createAdminUser() {
  console.log('🔄 Creating admin user...');
  
  try {
    const bcrypt = await import('bcryptjs');
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(adminPassword, saltRounds);
    
    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        username: adminUsername,
        password_hash: passwordHash
      });
    
    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('ℹ️ Admin user already exists');
      } else {
        console.error('❌ Error creating admin user:', error);
      }
    } else {
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

async function main() {
  console.log('🚀 Starting data migration to Supabase...');
  
  await migrateProducts();
  await migrateOrders();
  await createAdminUser();
  
  console.log('🎉 Data migration completed!');
}

main().catch(console.error);