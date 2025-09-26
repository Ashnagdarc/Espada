'use client'

import { motion } from 'framer-motion'
import ProductCard from '@/components/ui/ProductCard'
import { ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'

const newProducts = [
  {
    id: 1,
    name: 'Premium Cotton T-Shirt',
    price: 89,
    image: '/images/mg0tjbq2-3h6yy6x.png',
    isNew: true,
    isSale: false,
    category: 'Essentials'
  },
  {
    id: 2,
    name: 'Minimalist Hoodie',
    price: 149,
    image: '/images/mg0tjbq2-6rgezts.png',
    isNew: true,
    isSale: false,
    category: 'Outerwear'
  },
  {
    id: 3,
    name: 'Classic Crew Neck',
    price: 79,
    image: '/images/mg0tjbq2-a747buj.png',
    isNew: true,
    isSale: false,
    category: 'Essentials'
  },
  {
    id: 4,
    name: 'Organic Cotton Tee',
    price: 69,
    image: '/images/mg0tjbq2-i9edd8x.png',
    isNew: true,
    isSale: false,
    category: 'Sustainable'
  }
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  }
}

export default function NewThisWeek() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Fresh Arrivals
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            New This Week
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover our latest additions crafted with premium materials and 
            contemporary design principles.
          </p>
        </motion.div>
        
        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {newProducts.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <ProductCard
                product={product}
              />
            </motion.div>
          ))}
        </motion.div>
        
        {/* View All Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button variant="outline" size="lg" className="group">
            View All New Items
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
        
        {/* Background Decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 -right-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          
          <motion.div
            className="absolute bottom-1/4 -left-32 w-48 h-48 bg-secondary/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 3
            }}
          />
        </div>
      </div>
    </section>
  )
}