export default function TestFontPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="font-gilroy text-4xl font-bold mb-4 text-black">Test Font - Gilroy Class</h1>
      <p className="font-gilroy text-lg mb-4 text-gray-800">This text should be visible using the font-gilroy class with Outfit font.</p>
      
      <h2 className="font-sans text-2xl font-bold mb-4 text-black">Test Font - Sans Class</h2>
      <p className="font-sans text-lg mb-4 text-gray-800">This text should be visible using the font-sans class with Outfit font.</p>
      
      <h3 className="text-xl font-bold mb-4 text-black" style={{fontFamily: 'Outfit, sans-serif'}}>Test Font - Inline Style</h3>
      <p className="text-lg mb-4 text-gray-800" style={{fontFamily: 'Outfit, sans-serif'}}>This text should be visible using inline Outfit font style.</p>
      
      <h4 className="text-lg font-bold mb-4 text-black" style={{fontFamily: 'Arial, sans-serif'}}>Test Font - Arial Fallback</h4>
      <p className="text-base text-gray-800" style={{fontFamily: 'Arial, sans-serif'}}>This text should be visible using Arial font as fallback.</p>
      
      <div className="mt-8 p-4 bg-red-100 border border-red-300">
        <h5 className="text-red-800 font-bold">Debug Info:</h5>
        <p className="text-red-700">If you can see this red text, the issue is with the font or color classes above.</p>
      </div>
    </div>
  )
}