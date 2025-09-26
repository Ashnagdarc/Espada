import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function SizeGuidePage() {
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
            <h1 className="font-gilroy font-bold text-xl">Size Guide</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="font-gilroy font-bold text-3xl mb-4">Find Your Perfect Fit</h2>
          <p className="font-gilroy text-gray-600 max-w-2xl mx-auto">
            Our unisex sizing is designed to provide a comfortable, modern fit for all body types. 
            All measurements are in inches and centimeters for your convenience.
          </p>
        </div>

        {/* How to Measure */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">How to Measure</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Chest/Bust</h4>
                <p className="font-gilroy text-gray-600">
                  Measure around the fullest part of your chest, keeping the tape measure level and snug but not tight.
                </p>
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Waist</h4>
                <p className="font-gilroy text-gray-600">
                  Measure around your natural waistline, which is typically the narrowest part of your torso.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Hip</h4>
                <p className="font-gilroy text-gray-600">
                  Measure around the fullest part of your hips, typically 7-9 inches below your waistline.
                </p>
              </div>
              <div>
                <h4 className="font-gilroy font-semibold text-lg mb-2">Length</h4>
                <p className="font-gilroy text-gray-600">
                  For tops, measure from the highest point of your shoulder down to where you want the garment to end.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tops Size Chart */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Tops (T-Shirts, Hoodies, Sweatshirts)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Size</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Chest (inches)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Chest (cm)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Length (inches)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">XS</td>
                  <td className="font-gilroy p-4">34-36</td>
                  <td className="font-gilroy p-4">86-91</td>
                  <td className="font-gilroy p-4">26</td>
                  <td className="font-gilroy p-4">66</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">S</td>
                  <td className="font-gilroy p-4">36-38</td>
                  <td className="font-gilroy p-4">91-97</td>
                  <td className="font-gilroy p-4">27</td>
                  <td className="font-gilroy p-4">69</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">M</td>
                  <td className="font-gilroy p-4">39-41</td>
                  <td className="font-gilroy p-4">99-104</td>
                  <td className="font-gilroy p-4">28</td>
                  <td className="font-gilroy p-4">71</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">L</td>
                  <td className="font-gilroy p-4">42-45</td>
                  <td className="font-gilroy p-4">106-114</td>
                  <td className="font-gilroy p-4">29</td>
                  <td className="font-gilroy p-4">74</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">XL</td>
                  <td className="font-gilroy p-4">46-49</td>
                  <td className="font-gilroy p-4">116-124</td>
                  <td className="font-gilroy p-4">30</td>
                  <td className="font-gilroy p-4">76</td>
                </tr>
                <tr>
                  <td className="font-gilroy p-4">XXL</td>
                  <td className="font-gilroy p-4">50-53</td>
                  <td className="font-gilroy p-4">127-135</td>
                  <td className="font-gilroy p-4">31</td>
                  <td className="font-gilroy p-4">79</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottoms Size Chart */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Bottoms (Pants, Joggers)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Size</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Waist (inches)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Waist (cm)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Hip (inches)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Hip (cm)</th>
                  <th className="font-gilroy font-semibold text-left p-4 border-b border-gray-200">Inseam (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">XS</td>
                  <td className="font-gilroy p-4">28-30</td>
                  <td className="font-gilroy p-4">71-76</td>
                  <td className="font-gilroy p-4">36-38</td>
                  <td className="font-gilroy p-4">91-97</td>
                  <td className="font-gilroy p-4">30</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">S</td>
                  <td className="font-gilroy p-4">30-32</td>
                  <td className="font-gilroy p-4">76-81</td>
                  <td className="font-gilroy p-4">38-40</td>
                  <td className="font-gilroy p-4">97-102</td>
                  <td className="font-gilroy p-4">31</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">M</td>
                  <td className="font-gilroy p-4">32-34</td>
                  <td className="font-gilroy p-4">81-86</td>
                  <td className="font-gilroy p-4">40-42</td>
                  <td className="font-gilroy p-4">102-107</td>
                  <td className="font-gilroy p-4">32</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">L</td>
                  <td className="font-gilroy p-4">34-36</td>
                  <td className="font-gilroy p-4">86-91</td>
                  <td className="font-gilroy p-4">42-44</td>
                  <td className="font-gilroy p-4">107-112</td>
                  <td className="font-gilroy p-4">33</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="font-gilroy p-4">XL</td>
                  <td className="font-gilroy p-4">36-38</td>
                  <td className="font-gilroy p-4">91-97</td>
                  <td className="font-gilroy p-4">44-46</td>
                  <td className="font-gilroy p-4">112-117</td>
                  <td className="font-gilroy p-4">34</td>
                </tr>
                <tr>
                  <td className="font-gilroy p-4">XXL</td>
                  <td className="font-gilroy p-4">38-40</td>
                  <td className="font-gilroy p-4">97-102</td>
                  <td className="font-gilroy p-4">46-48</td>
                  <td className="font-gilroy p-4">117-122</td>
                  <td className="font-gilroy p-4">34</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="mb-12">
          <h3 className="font-gilroy font-bold text-2xl mb-6">Fit Guide</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-gilroy font-semibold text-lg mb-3">Unisex Sizing</h4>
              <p className="font-gilroy text-gray-600 mb-3">
                Our unisex sizing is based on men's measurements. Women typically size down one size for a similar fit.
              </p>
              <p className="font-gilroy text-sm text-gray-500">
                Example: Unisex M ≈ Men's M or Women's L
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-gilroy font-semibold text-lg mb-3">Fit Style</h4>
              <p className="font-gilroy text-gray-600 mb-3">
                Our garments feature a modern, relaxed fit that's not too baggy or tight. Clean lines with comfortable ease.
              </p>
              <p className="font-gilroy text-sm text-gray-500">
                For a more fitted look, consider sizing down.
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Help */}
        <div className="text-center bg-black text-white p-8 rounded-lg">
          <h3 className="font-gilroy font-bold text-xl mb-4">Need Help with Sizing?</h3>
          <p className="font-gilroy mb-6">
            Our team is here to help you find the perfect fit. Don't hesitate to reach out.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-white text-black px-6 py-3 font-gilroy font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </main>
    </div>
  )
}

export const metadata = {
  title: 'Size Guide | Espada',
  description: 'Find your perfect fit with our comprehensive unisex sizing guide. Detailed measurements and fit information for all Espada garments.',
}