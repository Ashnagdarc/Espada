import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing homepage data
  await prisma.collectionItem.deleteMany({});
  await prisma.homepageImage.deleteMany({});
  await prisma.homepageSection.deleteMany({});

  console.log('📦 Creating homepage sections...');

  // 1. Hero Section
  await prisma.homepageSection.create({
    data: {
      title: 'Hero Section',
      type: 'hero',
      position: 1,
      content: JSON.stringify({
        title: 'Elevate Your Everyday Style',
        subtitle: 'Timeless essentials made for comfort and confidence.'
      }),
      images: {
        create: [
          {
            url: '/images/mg0ujxhg-rt8uqe1.png',
            caption: 'Collection item',
            position: 1
          },
          {
            url: '/images/mg0ujxhg-glpb31v.png',
            caption: 'Collection item',
            position: 2
          }
        ]
      }
    }
  });
  console.log('✅ Created hero section');

  // 2. New This Week Section
  const newThisWeekSection = await prisma.homepageSection.create({
    data: {
      title: 'New This Week',
      type: 'new_this_week',
      position: 2,
      content: JSON.stringify({
        title: 'New This Week'
      })
    }
  });
  console.log('✅ Created new this week section');

  // 3. XIV Collections Section
  const xivSection = await prisma.homepageSection.create({
    data: {
      title: 'XIV Collections',
      type: 'xiv_collections',
      position: 3,
      content: JSON.stringify({
        title: 'XIV Collections'
      })
    }
  });
  console.log('✅ Created XIV collections section');

  // 4. Approach Section
  await prisma.homepageSection.create({
    data: {
      title: 'Our Approach',
      type: 'approach',
      position: 4,
      content: JSON.stringify({
        title: 'Our Approach',
        description: 'We believe in creating timeless pieces that transcend seasonal trends. Our approach to fashion is rooted in sustainability, quality craftsmanship, and innovative design.'
      }),
      images: {
        create: [
          {
            url: '/images/mg0ujxhg-rt8uqe1.png',
            caption: 'Sustainable Materials',
            position: 1
          },
          {
            url: '/images/mg0ujxhg-glpb31v.png',
            caption: 'Quality Craftsmanship',
            position: 2
          },
          {
            url: '/images/mg0ujxhg-rt8uqe1.png',
            caption: 'Innovative Design',
            position: 3
          }
        ]
      }
    }
  });
  console.log('✅ Created approach section');

  // Create sample products
  console.log('📦 Creating sample products...');
  
  const sampleProducts = [
    {
      name: 'Classic Black T-Shirt',
      slug: 'classic-black-tshirt',
      description: 'Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
      price: 45.00,
      image: '/images/mg0ujxhg-rt8uqe1.png',
      category: 'Tops',
      stock: 50,
      featured: true
    },
    {
      name: 'White Essential Tee',
      slug: 'white-essential-tee',
      description: 'Clean, minimalist white t-shirt made from organic cotton.',
      price: 42.00,
      image: '/images/mg0ujxhg-glpb31v.png',
      category: 'Tops',
      stock: 45,
      featured: true
    },
    {
      name: 'Gray Crew Neck',
      slug: 'gray-crew-neck',
      description: 'Versatile gray t-shirt with a classic crew neck design.',
      price: 48.00,
      image: '/images/mg0ujxhg-rt8uqe1.png',
      category: 'Tops',
      stock: 40,
      featured: false
    },
    {
      name: 'Navy Blue Polo',
      slug: 'navy-blue-polo',
      description: 'Smart casual polo shirt in navy blue. Perfect for any occasion.',
      price: 65.00,
      image: '/images/mg0ujxhg-glpb31v.png',
      category: 'Tops',
      stock: 35,
      featured: true
    },
    {
      name: 'Striped Long Sleeve',
      slug: 'striped-long-sleeve',
      description: 'Timeless striped long sleeve shirt for cooler days.',
      price: 58.00,
      image: '/images/mg0ujxhg-rt8uqe1.png',
      category: 'Tops',
      stock: 30,
      featured: false
    },
    {
      name: 'Black Denim Jacket',
      slug: 'black-denim-jacket',
      description: 'Classic denim jacket in black. A wardrobe essential.',
      price: 125.00,
      image: '/images/mg0ujxhg-glpb31v.png',
      category: 'Outerwear',
      stock: 20,
      featured: true
    },
    {
      name: 'Slim Fit Jeans',
      slug: 'slim-fit-jeans',
      description: 'Modern slim fit jeans with a comfortable stretch.',
      price: 85.00,
      image: '/images/mg0ujxhg-rt8uqe1.png',
      category: 'Bottoms',
      stock: 55,
      featured: false
    },
    {
      name: 'Casual Chinos',
      slug: 'casual-chinos',
      description: 'Versatile chino pants perfect for work or weekend.',
      price: 75.00,
      image: '/images/mg0ujxhg-glpb31v.png',
      category: 'Bottoms',
      stock: 40,
      featured: false
    }
  ];

  for (const product of sampleProducts) {
    await prisma.product.create({
      data: product
    });
  }
  console.log(`✅ Created ${sampleProducts.length} sample products`);

  // Check if there are any products in the database
  const productCount = await prisma.product.count();
  console.log(`📊 Found ${productCount} products in database`);

  if (productCount > 0) {
    // Get some products to add to collections
    const products = await prisma.product.findMany({
      take: 6,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Add products to New This Week section
    for (let i = 0; i < Math.min(3, products.length); i++) {
      await prisma.collectionItem.create({
        data: {
          sectionId: newThisWeekSection.id,
          productId: products[i].id,
          title: products[i].name,
          position: i + 1
        }
      });
    }
    console.log(`✅ Added ${Math.min(3, products.length)} products to New This Week`);

    // Add products to XIV Collections section
    for (let i = 0; i < products.length; i++) {
      await prisma.collectionItem.create({
        data: {
          sectionId: xivSection.id,
          productId: products[i].id,
          title: products[i].name,
          position: i + 1
        }
      });
    }
    console.log(`✅ Added ${products.length} products to XIV Collections`);
  } else {
    console.log('⚠️  No products found - collection sections will be empty');
    console.log('   Add products to the database first, then run: npx prisma db seed');
  }

  console.log('✨ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
