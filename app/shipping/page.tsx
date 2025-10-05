import Link from 'next/link'
import { ArrowLeft, Truck, Clock, Globe, Shield } from 'lucide-react'

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/" 
              className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-gray-600">Back to Home</span>
            </Link>
            <h1 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-xl text-black">Shipping</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-3xl mb-4 text-black">Shipping Information</h2>
          <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 max-w-2xl mx-auto">
            We're committed to getting your premium streetwear to you quickly and safely. 
            All orders are carefully packaged and shipped with tracking.
          </p>
        </div>

        {/* Shipping Options */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-8 text-black">Shipping Options</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 mr-3" />
                <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg text-black">Standard Shipping</h4>
              </div>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                Free on orders over $75. Delivered within 5-7 business days.
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-black">$8.99 (orders under $75)</p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 mr-3" />
                <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg text-black">Express Shipping</h4>
              </div>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                Fast delivery within 2-3 business days for when you need it sooner.
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-black">$19.99</p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Globe className="h-6 w-6 mr-3" />
                <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg text-black">International Shipping</h4>
              </div>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                We ship worldwide. Delivery times vary by destination (7-21 business days).
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-black">Starting at $29.99</p>
            </div>
            
            <div className="border border-gray-200 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 mr-3" />
                <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg text-black">Premium Packaging</h4>
              </div>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                All orders include premium packaging with sustainable materials.
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-black">Included</p>
            </div>
          </div>
        </div>

        {/* Processing Time */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-6 text-black">Processing Time</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-700 mb-4">
              <strong>Order Processing:</strong> All orders are processed within 1-2 business days. 
              Orders placed after 2 PM EST will be processed the next business day.
            </p>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-700 mb-4">
              <strong>Custom Orders:</strong> Limited edition and custom pieces may require additional 
              processing time of 3-5 business days due to our artisanal crafting process.
            </p>
            <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-700">
              <strong>Weekends & Holidays:</strong> Orders placed on weekends or holidays will be 
              processed on the next business day.
            </p>
          </div>
        </div>

        {/* Shipping Locations */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-6 text-black">Shipping Locations</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-4 text-black">Domestic Shipping (US)</h4>
              <ul style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 space-y-2">
                <li>• All 50 states including Alaska and Hawaii</li>
                <li>• APO/FPO military addresses</li>
                <li>• US territories (additional fees may apply)</li>
                <li>• Free standard shipping on orders $75+</li>
              </ul>
            </div>
            <div>
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-4 text-black">International Shipping</h4>
              <ul style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 space-y-2">
                <li>• Canada, Mexico, and Central America</li>
                <li>• European Union countries</li>
                <li>• United Kingdom and Australia</li>
                <li>• Select Asian countries (Japan, South Korea)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tracking & Delivery */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-6 text-black">Tracking & Delivery</h3>
          <div className="space-y-6">
            <div className="border-l-4 border-black pl-6">
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-2 text-black">Order Confirmation</h4>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600">
                You'll receive an order confirmation email immediately after purchase with your order details.
              </p>
            </div>
            <div className="border-l-4 border-black pl-6">
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-2 text-black">Shipping Notification</h4>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600">
                Once your order ships, you'll receive a shipping confirmation email with tracking information.
              </p>
            </div>
            <div className="border-l-4 border-black pl-6">
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-2 text-black">Delivery Updates</h4>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600">
                Track your package in real-time using the provided tracking number on our carrier's website.
              </p>
            </div>
          </div>
        </div>

        {/* International Customers */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-6 text-black">International Customers</h3>
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-3 text-black">Important Information</h4>
            <ul style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-700 space-y-2">
              <li>• Customs duties and taxes are the responsibility of the customer</li>
              <li>• Delivery times may vary due to customs processing</li>
              <li>• Some countries may have import restrictions on certain materials</li>
              <li>• We are not responsible for packages held by customs</li>
              <li>• All international orders are shipped with full insurance</li>
            </ul>
          </div>
        </div>

        {/* Shipping Issues */}
        <div className="mb-12">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-2xl mb-6 text-black">Shipping Issues</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-3 text-black">Lost or Damaged Packages</h4>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                If your package is lost or arrives damaged, please contact us within 48 hours of delivery.
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-gray-500">
                We'll work with our shipping partners to resolve the issue quickly.
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-semibold text-lg mb-3 text-black">Delivery Delays</h4>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-gray-600 mb-3">
                While rare, delays can occur due to weather, holidays, or carrier issues.
              </p>
              <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="text-sm text-gray-500">
                We'll keep you updated and work to resolve any delays promptly.
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Shipping Questions */}
        <div className="text-center bg-black text-white p-8 rounded-lg">
          <h3 style={{ fontFamily: 'Gilroy, sans-serif' }} className="font-bold text-xl mb-4 text-white">Questions About Shipping?</h3>
          <p style={{ fontFamily: 'Gilroy, sans-serif' }} className="mb-6 text-white">
            Our customer service team is here to help with any shipping questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              className="inline-block bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <a 
              href="mailto:shipping@espada.com" 
              style={{ fontFamily: 'Gilroy, sans-serif' }}
              className="inline-block border border-white text-white px-6 py-3 font-semibold hover:bg-white hover:text-black transition-colors"
            >
              shipping@espada.com
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Shipping Information | Espada',
  description: 'Learn about our shipping options, processing times, and delivery information. Free shipping on orders over $75 with fast, secure delivery worldwide.',
}