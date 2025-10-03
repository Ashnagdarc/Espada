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
              <span className="text-sm" style={{ fontFamily: 'Gilroy, sans-serif' }}>Back to Home</span>
            </Link>
            <h1 className="font-bold text-xl" style={{ fontFamily: 'Gilroy, sans-serif' }}>Size Guide</h1>
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <div className="text-center mb-12">
          <h2 className="font-bold text-3xl mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>Find Your Perfect Fit</h2>
          <p className="text-gray-600 max-w-2xl mx-auto" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Our unisex sizing is designed to provide a comfortable, modern fit for all body types. 
            All measurements are in inches and centimeters for your convenience.
          </p>
        </div>

        {/* How to Measure */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>How to Measure</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Chest/Bust</h4>
                <p className="text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Measure around the fullest part of your chest, keeping the tape measure level and snug but not tight.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Waist</h4>
                <p className="text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Measure around your natural waistline, which is typically the narrowest part of your torso.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg mb-2 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Hip</h4>
                <p className="text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  Measure around the fullest part of your hips, typically 7-9 inches below your waistline.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-lg mb-2 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Length</h4>
                <p className="text-gray-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  For tops, measure from the highest point of your shoulder down to where you want the garment to end.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tops Size Chart */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Tops (T-Shirts, Hoodies, Sweatshirts)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Size</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Chest (inches)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Chest (cm)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Length (inches)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Length (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XS</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>34-36</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>86-91</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>26</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>66</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>S</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>36-38</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>91-97</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>27</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>69</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>M</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>39-41</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>99-104</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>28</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>71</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>L</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>42-45</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>106-114</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>29</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>74</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XL</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>46-49</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>116-124</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>30</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>76</td>
                </tr>
                <tr>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XXL</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>50-53</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>127-135</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>31</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>79</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottoms Size Chart */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Bottoms (Pants, Joggers)</h3>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Size</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Waist (inches)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Waist (cm)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Hip (inches)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Hip (cm)</th>
                  <th className="font-semibold text-left p-4 border-b border-gray-200 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Inseam (inches)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XS</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>28-30</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>71-76</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>36-38</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>91-97</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>30</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>S</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>30-32</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>76-81</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>38-40</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>97-102</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>31</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>M</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>32-34</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>81-86</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>40-42</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>102-107</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>32</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>L</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>34-36</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>86-91</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>42-44</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>107-112</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>33</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XL</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>36-38</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>91-97</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>44-46</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>112-117</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>34</td>
                </tr>
                <tr>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>XXL</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>38-40</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>97-102</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>46-48</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>117-122</td>
                  <td className="p-4 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>34</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Fit Guide */}
        <div className="mb-12">
          <h3 className="font-bold text-2xl mb-6 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Fit Guide</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-3 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Unisex Sizing</h4>
              <p className="text-gray-600 mb-3" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Our unisex sizing is based on men's measurements. Women typically size down one size for a similar fit.
              </p>
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Example: Unisex M ≈ Men's M or Women's L
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-lg mb-3 text-black" style={{ fontFamily: 'Gilroy, sans-serif' }}>Fit Style</h4>
              <p className="text-gray-600 mb-3" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                Our garments feature a modern, relaxed fit that's not too baggy or tight. Clean lines with comfortable ease.
              </p>
              <p className="text-sm text-gray-500" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                For a more fitted look, consider sizing down.
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Help */}
        <div className="text-center bg-black text-white p-8 rounded-lg">
          <h3 className="font-bold text-xl mb-4 text-white" style={{ fontFamily: 'Gilroy, sans-serif' }}>Need Help with Sizing?</h3>
          <p className="mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Our team is here to help you find the perfect fit. Don't hesitate to reach out.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-white text-black px-6 py-3 font-semibold hover:bg-gray-100 transition-colors"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
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