import Link from 'next/link'
import { ArrowLeft, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ReturnsPage() {
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
              <span className="font-gilroy text-sm">Back to Home</span>
            </Link>
            <h1 className="font-gilroy font-bold text-xl">Returns & Exchanges</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="font-gilroy font-bold text-3xl mb-4">Returns & Exchanges</h2>
          <p className="font-gilroy text-gray-600 max-w-2xl mx-auto">
            We want you to love your Espada pieces. If something isn't quite right, 
            we're here to make it easy to return or exchange your items.
          </p>
        </div>

        {/* Return Policy Overview */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Return Policy</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-4" />
              <h4 className="font-gilroy font-semibold text-lg mb-2">30-Day Window</h4>
              <p className="font-gilroy text-gray-600 text-sm">
                Return items within 30 days of delivery for a full refund
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <RotateCcw className="h-8 w-8 mx-auto mb-4" />
              <h4 className="font-gilroy font-semibold text-lg mb-2">Free Returns</h4>
              <p className="font-gilroy text-gray-600 text-sm">
                We provide prepaid return labels for all domestic returns
              </p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-4" />
              <h4 className="font-gilroy font-semibold text-lg mb-2">Easy Process</h4>
              <p className="font-gilroy text-gray-600 text-sm">
                Simple online return process with tracking and updates
              </p>
            </div>
          </div>
        </div>

        {/* Return Conditions */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Return Conditions</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-gilroy font-semibold text-lg mb-4 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                Eligible for Return
              </h4>
              <ul className="font-gilroy text-gray-600 space-y-2">
                <li>• Items in original condition with tags attached</li>
                <li>• Unworn, unwashed, and undamaged items</li>
                <li>• Items returned within 30 days of delivery</li>
                <li>• Original packaging and accessories included</li>
                <li>• Items purchased at full price or on sale</li>
              </ul>
            </div>
            <div>
              <h4 className="font-gilroy font-semibold text-lg mb-4 flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-600" />
                Not Eligible for Return
              </h4>
              <ul className="font-gilroy text-gray-600 space-y-2">
                <li>• Items worn, washed, or damaged by customer</li>
                <li>• Items without original tags or packaging</li>
                <li>• Custom or personalized items</li>
                <li>• Items returned after 30-day window</li>
                <li>• Undergarments and intimate apparel</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Return */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">How to Return</h3>
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-gilroy font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Initiate Return</h4>
                <p className="font-gilroy text-gray-600">
                  Contact our customer service team or use our online return portal to start your return. 
                  You'll need your order number and email address.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-gilroy font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Receive Return Label</h4>
                <p className="font-gilroy text-gray-600">
                  We'll email you a prepaid return shipping label within 24 hours. 
                  Print the label and attach it to your package.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-gilroy font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Package & Ship</h4>
                <p className="font-gilroy text-gray-600">
                  Securely package your items in the original packaging (if available) and 
                  drop off at any authorized shipping location.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-gilroy font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Receive Refund</h4>
                <p className="font-gilroy text-gray-600">
                  Once we receive and process your return (3-5 business days), 
                  your refund will be issued to your original payment method.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Exchanges */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Exchanges</h3>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="font-gilroy font-semibold text-lg mb-4">Size & Color Exchanges</h4>
            <p className="font-gilroy text-gray-600 mb-4">
              Need a different size or color? We make exchanges easy. Follow the same return process 
              and let us know what you'd like to exchange for in the return form.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-gilroy font-semibold mb-2">Exchange Process</h5>
                <ul className="font-gilroy text-gray-600 text-sm space-y-1">
                  <li>• Same return process as above</li>
                  <li>• Specify desired size/color in return form</li>
                  <li>• We'll ship your exchange once we receive the original</li>
                  <li>• No additional shipping charges for exchanges</li>
                </ul>
              </div>
              <div>
                <h5 className="font-gilroy font-semibold mb-2">Exchange Timeline</h5>
                <ul className="font-gilroy text-gray-600 text-sm space-y-1">
                  <li>• 3-5 days to process returned item</li>
                  <li>• 1-2 days to ship exchange item</li>
                  <li>• 5-7 days standard delivery</li>
                  <li>• Express shipping available for faster exchange</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* International Returns */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">International Returns</h3>
          <div className="border border-yellow-200 bg-yellow-50 p-6 rounded-lg">
            <h4 className="font-gilroy font-semibold text-lg mb-3">Important Information</h4>
            <ul className="font-gilroy text-gray-700 space-y-2">
              <li>• International customers are responsible for return shipping costs</li>
              <li>• Returns must be sent via trackable shipping method</li>
              <li>• Customs duties and taxes are non-refundable</li>
              <li>• Allow 2-3 weeks for international return processing</li>
              <li>• Contact us before returning to ensure proper processing</li>
            </ul>
          </div>
        </div>

        {/* Refund Information */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Refund Information</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-gilroy font-semibold text-lg mb-3">Refund Timeline</h4>
              <ul className="font-gilroy text-gray-600 space-y-2">
                <li>• Credit cards: 3-5 business days</li>
                <li>• PayPal: 1-2 business days</li>
                <li>• Bank transfers: 5-10 business days</li>
                <li>• Processing starts once we receive your return</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-gilroy font-semibold text-lg mb-3">Refund Method</h4>
              <ul className="font-gilroy text-gray-600 space-y-2">
                <li>• Refunds issued to original payment method</li>
                <li>• Original shipping costs are non-refundable</li>
                <li>• Gift card purchases refunded as store credit</li>
                <li>• Promotional discounts will be deducted</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Damaged or Defective Items */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Damaged or Defective Items</h3>
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <h4 className="font-gilroy font-semibold text-lg mb-3">Quality Guarantee</h4>
            <p className="font-gilroy text-gray-700 mb-4">
              We stand behind the quality of our products. If you receive a damaged or defective item, 
              we'll make it right immediately.
            </p>
            <ul className="font-gilroy text-gray-700 space-y-2">
              <li>• Contact us within 48 hours of delivery</li>
              <li>• Provide photos of the damage or defect</li>
              <li>• We'll arrange immediate replacement or full refund</li>
              <li>• No need to return damaged items unless requested</li>
              <li>• Expedited shipping for replacement items</li>
            </ul>
          </div>
        </div>

        {/* Contact for Returns */}
        <div className="text-center bg-black text-white p-8 rounded-lg">
          <h3 className="font-gilroy font-bold text-xl mb-4">Need Help with Returns?</h3>
          <p className="font-gilroy mb-6">
            Our customer service team is here to make your return experience as smooth as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact" 
              className="inline-block bg-white text-black px-6 py-3 font-gilroy font-semibold hover:bg-gray-100 transition-colors"
            >
              Contact Us
            </Link>
            <a 
              href="mailto:returns@espada.com" 
              className="inline-block border border-white text-white px-6 py-3 font-gilroy font-semibold hover:bg-white hover:text-black transition-colors"
            >
              returns@espada.com
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Returns & Exchanges | Espada',
  description: 'Easy returns and exchanges within 30 days. Free return shipping, full refunds, and hassle-free process for all Espada premium streetwear.',
}