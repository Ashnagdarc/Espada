'use client''use client'



import React, { useState, useEffect, Suspense } from 'react'import React, { useState,          <h2 className="text-xl font-semibold text-label-primary mb-2 font-gilroy">

import { useRouter } from 'next/navigation'            Checkout Error

import { Loader2, ArrowLeft, User, LogIn } from 'lucide-react'          </h2>

import Header from '@/components/layout/Header'          <p className="text-label-secondary mb-6 font-gilroy">

import Footer from '@/components/layout/Footer'            We encountered an error while loading the checkout page. Please try again.

import { useCart } from '@/contexts/CartContext'          </p>

import { useAuth } from '@/contexts/SupabaseAuthContext'          <button

import { Button } from '@/components/ui/Button'            onClick={retry}

import { Input } from '@/components/ui/Input'            className="px-4 py-2 bg-label-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-gilroy"

import { Select } from '@/components/ui/Select'            >

import OrderSummary from '@/components/checkout/OrderSummary'            Try Again

          </button>uspense } from 'react'

// Loading component for better UXimport { useRouter } from 'next/navigation'

function CheckoutLoading() {import { Loader2, ArrowLeft, User, LogIn } from 'lucide-react'

  return (import Header from '@/components/layout/Header'

    <div className="min-h-screen bg-background">import Footer from '@/components/layout/Footer'

      <Header />import { useCart } from '@/contexts/CartContext'

      <div className="flex items-center justify-center min-h-[60vh]">import { useAuth, SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'

        <div className="flex items-center gap-3">import { Button } from '@/components/ui/Button'

          <Loader2 className="w-6 h-6 animate-spin text-label-secondary" />import { Input } from '@/components/ui/Input'

          <span className="text-label-secondary font-gilroy">import { Select } from '@/components/ui/Select'

            Loading checkout...import OrderSummary from '@/components/checkout/OrderSummary'

          </span>

        </div>// Loading component for better UX

      </div>function CheckoutLoading() {

      <Footer />  return (

    </div>    <div className="min-h-screen bg-background">

  )      <Header />

}      <div className="flex items-center justify-center min-h-[60vh]">

        <div className="flex items-center gap-3">

// Error fallback component          <Loader2 className="w-6 h-6 animate-spin text-label-secondary" />

function CheckoutError({ retry }: { retry: () => void }) {          <span className="text-label-secondary font-gilroy">

  return (            Loading checkout...

    <div className="min-h-screen bg-background">          </span>

      <Header />        </div>

      <div className="flex items-center justify-center min-h-[60vh]">      </div>

        <div className="text-center max-w-md">      <Footer />

          <h2 className="text-xl font-semibold text-label-primary mb-2 font-gilroy">    </div>

            Checkout Error  )

          </h2>}

          <p className="text-label-secondary mb-6 font-gilroy">

            We encountered an error while loading the checkout page. Please try again.// Error fallback component

          </p>function CheckoutError({ retry }: { retry: () => void }) {

          <button  return (

            onClick={retry}    <div className="min-h-screen bg-background">

            className="px-4 py-2 bg-label-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-gilroy"      <Header />

          >      <div className="flex items-center justify-center min-h-[60vh]">

            Try Again        <div className="text-center max-w-md">

          </button>          <h2 className="text-xl font-semibold text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>

        </div>            Checkout Error

      </div>          </h2>

      <Footer />          <p className="text-label-secondary mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>

    </div>            We encountered an error while loading the checkout page. Please try again.

  )          </p>

}          <button

            onClick={retry}

interface CheckoutStep {            className="px-4 py-2 bg-label-primary text-white rounded-lg hover:bg-opacity-90 transition-all"

  id: string            style={{ fontFamily: 'Gilroy, sans-serif' }}

  label: string          >

  isActive: boolean            Try Again

  isCompleted: boolean          </button>

}        </div>

      </div>

interface ContactInfo {      <Footer />

  email: string    </div>

  phone: string  )

}}



interface ShippingAddress {interface CheckoutStep {

  firstName: string  id: string

  lastName: string  label: string

  country: string  isActive: boolean

  state: string  isCompleted: boolean

  address: string}

  city: string

  postalCode: stringinterface ContactInfo {

}  email: string

  phone: string

function CheckoutContent() {}

  const router = useRouter()

  const { state } = useCart()interface ShippingAddress {

  const { user, profile } = useAuth()  firstName: string

  const [mounted, setMounted] = useState(false)  lastName: string

  const [error, setError] = useState<string | null>(null)  country: string

  state: string

  const [currentStep, setCurrentStep] = useState('information')  address: string

  const [contactInfo, setContactInfo] = useState<ContactInfo>({  city: string

    email: '',  postalCode: string

    phone: ''}

  })

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({function CheckoutContent() {

    firstName: '',  const router = useRouter()

    lastName: '',  const { state } = useCart()

    country: 'United States',  const { user, profile } = useAuth()

    state: '',  const [mounted, setMounted] = useState(false)

    address: '',  const [error, setError] = useState<string | null>(null)

    city: '',

    postalCode: ''  const [currentStep, setCurrentStep] = useState('information')

  })  const [contactInfo, setContactInfo] = useState<ContactInfo>({

  const [saveAddress, setSaveAddress] = useState(false)    email: '',

    phone: ''

  const [errors, setErrors] = useState<Record<string, string>>({})  })

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({

  // Prevent hydration mismatch    firstName: '',

  useEffect(() => {    lastName: '',

    try {    country: 'United States',

      setMounted(true)    state: '',

    } catch (err) {    address: '',

      console.error('Error mounting component:', err)    city: '',

      setError('Failed to initialize checkout')    postalCode: ''

    }  })

  }, [])  const [saveAddress, setSaveAddress] = useState(false)



  // Pre-fill form with customer data if authenticated  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {

    try {  // Prevent hydration mismatch

      if (user && profile) {  useEffect(() => {

        setContactInfo({    try {

          email: user.email || '',      setMounted(true)

          phone: profile.phone || ''    } catch (err) {

        })      console.error('Error mounting component:', err)

      setError('Failed to initialize checkout')

        if (profile.address) {    }

          setShippingAddress({  }, [])

            firstName: profile.first_name || '',

            lastName: profile.last_name || '',  // Pre-fill form with customer data if authenticated

            country: profile.country || 'United States',  useEffect(() => {

            state: '',    try {

            address: profile.address || '',      if (user && profile) {

            city: profile.city || '',        setContactInfo({

            postalCode: profile.postal_code || ''          email: user.email || '',

          })          phone: profile.phone || ''

        }        })

      }

    } catch (err) {        if (profile.address) {

      console.error('Error pre-filling form data:', err)          setShippingAddress({

      setError('Failed to load user data')            firstName: profile.first_name || '',

    }            lastName: profile.last_name || '',

  }, [user, profile])            country: profile.country || 'United States',

            state: '',

  const countries = [            address: profile.address || '',

    { value: 'United States', label: 'United States' },            city: profile.city || '',

    { value: 'Canada', label: 'Canada' },            postalCode: profile.postal_code || ''

    { value: 'United Kingdom', label: 'United Kingdom' },          })

    { value: 'Australia', label: 'Australia' },        }

    { value: 'Germany', label: 'Germany' },      }

    { value: 'France', label: 'France' },    } catch (err) {

    { value: 'Japan', label: 'Japan' }      console.error('Error pre-filling form data:', err)

  ]      setError('Failed to load user data')

    }

  const validateForm = () => {  }, [user, profile])

    const newErrors: Record<string, string> = {}

  const countries = [

    if (!contactInfo.email) {    { value: 'United States', label: 'United States' },

      newErrors.email = 'Email is required'    { value: 'Canada', label: 'Canada' },

    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {    { value: 'United Kingdom', label: 'United Kingdom' },

      newErrors.email = 'Email is invalid'    { value: 'Australia', label: 'Australia' },

    }    { value: 'Germany', label: 'Germany' },

    { value: 'France', label: 'France' },

    if (!contactInfo.phone) {    { value: 'Japan', label: 'Japan' }

      newErrors.phone = 'Phone is required'  ]

    }

  const validateForm = () => {

    if (!shippingAddress.firstName) {    const newErrors: Record<string, string> = {}

      newErrors.firstName = 'First name is required'

    }    if (!contactInfo.email) {

      newErrors.email = 'Email is required'

    if (!shippingAddress.lastName) {    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {

      newErrors.lastName = 'Last name is required'      newErrors.email = 'Email is invalid'

    }    }



    if (!shippingAddress.address) {    if (!contactInfo.phone) {

      newErrors.address = 'Address is required'      newErrors.phone = 'Phone is required'

    }    }



    if (!shippingAddress.city) {    if (!shippingAddress.firstName) {

      newErrors.city = 'City is required'      newErrors.firstName = 'First name is required'

    }    }



    if (!shippingAddress.state) {    if (!shippingAddress.lastName) {

      newErrors.state = 'State/Region is required'      newErrors.lastName = 'Last name is required'

    }    }



    if (!shippingAddress.postalCode) {    if (!shippingAddress.address) {

      newErrors.postalCode = 'Postal code is required'      newErrors.address = 'Address is required'

    }    }



    setErrors(newErrors)    if (!shippingAddress.city) {

    return Object.keys(newErrors).length === 0      newErrors.city = 'City is required'

  }    }



  const handleNextStep = async () => {    if (!shippingAddress.state) {

    if (validateForm()) {      newErrors.state = 'State/Region is required'

      // Save address to customer profile if authenticated and checkbox is checked    }

      if (user && profile && saveAddress) {

        // Note: This would need to be implemented in the SupabaseAuthContext    if (!shippingAddress.postalCode) {

      }      newErrors.postalCode = 'Postal code is required'

    }

      // Process shipping step

      if (currentStep === 'shipping') {    setErrors(newErrors)

        // Proceed to payment    return Object.keys(newErrors).length === 0

        setCurrentStep('payment')  }

      }

    }  const handleNextStep = async () => {

  }    if (validateForm()) {

      // Save address to customer profile if authenticated and checkbox is checked

  const steps: CheckoutStep[] = [      if (user && profile && saveAddress) {

    {         // Note: This would need to be implemented in the SupabaseAuthContext

      id: 'information',        // For now, we'll just proceed to the next step

      label: 'Information',        console.log('Address would be saved to customer profile')

      isActive: currentStep === 'information',      }

      isCompleted: currentStep === 'shipping' || currentStep === 'payment'       setCurrentStep('shipping')

    },    }

    {   }

      id: 'shipping',

      label: 'Shipping',  const steps: CheckoutStep[] = [

      isActive: currentStep === 'shipping',    {

      isCompleted: currentStep === 'payment'      id: 'information',

    },      label: 'INFORMATION',

    {       isActive: currentStep === 'information',

      id: 'payment',      isCompleted: false

      label: 'Payment',    },

      isActive: currentStep === 'payment',    {

      isCompleted: false      id: 'shipping',

    }      label: 'SHIPPING',

  ]      isActive: currentStep === 'shipping',

      isCompleted: false

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {    },

    setContactInfo(prev => ({ ...prev, [field]: value }))    {

  }      id: 'payment',

      label: 'PAYMENT',

  const handleShippingAddressChange = (field: keyof ShippingAddress, value: string) => {      isActive: currentStep === 'payment',

    setShippingAddress(prev => ({ ...prev, [field]: value }))      isCompleted: false

  }    }

  ]

  if (!mounted || !state.isLoaded) {

    return <CheckoutLoading />  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {

  }    setContactInfo(prev => ({ ...prev, [field]: value }))

  }

  if (error) {

    return <CheckoutError retry={() => setError(null)} />  const handleShippingAddressChange = (field: keyof typeof shippingAddress, value: string) => {

  }    setShippingAddress(prev => ({ ...prev, [field]: value }))

  }

  if (state.items.length === 0) {

    return (  // Show error state if there's an error

      <div className="min-h-screen bg-background">  if (error) {

        <Header />    return <CheckoutError retry={() => setError(null)} />

        <div className="flex items-center justify-center min-h-[60vh]">  }

          <div className="text-center">

            <h1 className="text-2xl font-bold text-label-primary mb-4 font-gilroy">  // Show loading state until component is mounted and cart is loaded to prevent hydration mismatch

              Your cart is empty  if (!mounted || !state.isLoaded) {

            </h1>    return <CheckoutLoading />

            <button  }

              onClick={() => router.push('/products')}

              className="text-label-secondary hover:text-label-primary transition-colors font-gilroy"  if (state.items.length === 0) {

            >    return (

              ← Continue Shopping      <div className="min-h-screen bg-background">

            </button>        <Header />

          </div>        <div className="flex items-center justify-center min-h-[60vh]">

        </div>          <div className="text-center">

        <Footer />            <h1 className="text-2xl font-bold text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>

      </div>              Your cart is empty

    )            </h1>

  }            <button

              onClick={() => router.push('/products')}

  return (              className="text-label-secondary hover:text-label-primary transition-colors"

    <div className="min-h-screen bg-background">              style={{ fontFamily: 'Gilroy, sans-serif' }}

      <Header />            >

              ← Continue Shopping

      {/* Back Button */}            </button>

      <div className="px-8 py-4 border-b border-separator">          </div>

        <button        </div>

          onClick={() => router.back()}        <Footer />

          className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors font-gilroy"      </div>

          aria-label="Go back"    )

          title="Go back"  }

        >

          <ArrowLeft className="w-4 h-4" />  return (

          <span className="sr-only">Go back</span>    <div className="min-h-screen bg-background">

        </button>      <Header />

      </div>

      {/* Back Button */}

      {/* Checkout Header */}      <div className="px-8 py-4 border-b border-separator">

      <div className="px-8 py-6">        <button

        <h1 className="text-3xl font-bold text-label-primary mb-8 font-gilroy">          onClick={() => router.back()}

          CHECKOUT          className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors font-gilroy"

        </h1>          aria-label="Go back"

          title="Go back"

        {/* Step Navigation */}        >

        <div className="flex gap-8 mb-8">          <ArrowLeft className="w-4 h-4" />

          {steps.map((step) => (          <span className="sr-only">Go back</span>

            <button        </button>

              key={step.id}      </div>

              onClick={() => setCurrentStep(step.id)}

              className={`text-sm font-medium tracking-wider transition-colors font-gilroy ${step.isActive ? 'text-label-primary' : 'text-label-tertiary'}`}      {/* Checkout Header */}

            >      <div className="px-8 py-6">

              {step.label}        <h1 className="text-3xl font-bold text-label-primary mb-8" style={{ fontFamily: 'Gilroy, sans-serif' }}>

            </button>          CHECKOUT

          ))}        </h1>

        </div>

        {/* Step Navigation */}

        {/* Information Step */}        <div className="flex gap-8 mb-8">

        {currentStep === 'information' && (          {steps.map((step) => (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">            <button

            <div className="space-y-6">              key={step.id}

              {/* Contact Information */}              onClick={() => setCurrentStep(step.id)}

              <div className="space-y-4">              className={`text-sm font-medium tracking-wider transition-colors ${step.isActive ? 'text-label-primary' : 'text-label-tertiary'

                <div className="flex items-center justify-between">                }`}

                  <div>              style={{ fontFamily: 'Gilroy, sans-serif' }}

                    {!user && (            >

                      <div className="flex items-center gap-2">              {step.label}

                        <User className="w-5 h-5 text-label-secondary" />            </button>

                        <h3 className="text-sm font-medium text-label-primary font-gilroy">          ))}

                          Contact Information        </div>

                        </h3>      </div>

                        <p className="text-xs text-label-secondary font-gilroy">

                          Already have an account?{' '}      {/* Main Content */}

                          <button      <div className="px-8 pb-16">

                            onClick={() => router.push('/signin')}        <div className="max-w-7xl mx-auto">

                            className="text-black underline font-gilroy"          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

                          >            {/* Left Side - Checkout Form */}

                            <span className="sr-only">Go to sign in page</span>            <div className="space-y-8">

                            Sign in              {/* Customer Authentication Section */}

                          </button>              {!user && (

                        </p>                <div className="p-6 border border-separator bg-fill-secondary rounded-lg">

                      </div>                  <div className="flex items-center justify-between">

                    )}                    <div className="flex items-center gap-3">

                      <User className="w-5 h-5 text-label-secondary" />

                    {user && (                      <div>

                      <div className="flex items-center gap-2">                        <h3 className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                        <User className="w-5 h-5 text-green-600" />                          Sign in for faster checkout

                        <h3 className="text-sm font-medium text-green-800 font-gilroy">                        </h3>

                          Welcome back, {user.email}                        <p className="text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                        </h3>                          Access your saved addresses and order history

                        <p className="text-xs text-green-600 font-gilroy">                        </p>

                          Signed in ✓                      </div>

                        </p>                    </div>

                      </div>                    <Button

                    )}                      onClick={() => router.push('/signin?redirect=/checkout')}

                  </div>                      className="flex items-center gap-2 px-4 py-2 bg-label-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all"

                      style={{ fontFamily: 'Gilroy, sans-serif' }}

                  {user && (                    >

                    <button                      <LogIn className="w-4 h-4" />

                      onClick={() => router.push('/account')}                      Sign In

                      className="flex items-center gap-1 text-sm text-black hover:text-gray-600 font-gilroy"                    </Button>

                    >                  </div>

                      <LogIn className="w-4 h-4" />                </div>

                      Account              )}

                    </button>

                  )}              {user && profile && (

                </div>                <div className="p-6 border border-separator bg-green-50 rounded-lg">

                  <div className="flex items-center gap-3">

                {/* Contact Form */}                    <User className="w-5 h-5 text-green-600" />

                <div className="space-y-4">                    <div>

                  <h2 className="text-lg font-medium text-label-primary font-gilroy">                      <h3 className="text-sm font-medium text-green-800" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                    CONTACT INFORMATION                        Welcome back, {profile.first_name}!

                  </h2>                      </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                      <p className="text-xs text-green-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                    <Input                        Your information has been pre-filled from your account

                      type="email"                      </p>

                      placeholder="Email"                    </div>

                      value={contactInfo.email}                  </div>

                      onChange={(e) => handleContactInfoChange('email', e.target.value)}                </div>

                      error={errors.email}              )}

                    />

                    <Input              {currentStep === 'information' && (

                      type="tel"                <div className="space-y-6">

                      placeholder="Phone"                  {/* Contact Info */}

                      value={contactInfo.phone}                  <div className="space-y-4">

                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}                    <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                      error={errors.phone}                      CONTACT INFO

                    />                    </h2>

                  </div>                    <div className="space-y-4">

                                        <Input

                  {/* Shipping Address */}                        type="email"

                  <div className="space-y-4">                        placeholder="Email"

                    <h2 className="text-lg font-medium text-label-primary font-gilroy">                        value={contactInfo.email}

                      SHIPPING ADDRESS                        onChange={(e) => handleContactInfoChange('email', e.target.value)}

                    </h2>                        error={errors.email}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                      />

                      <Input                      <Input

                        type="text"                        type="tel"

                        placeholder="First Name"                        placeholder="Phone"

                        value={shippingAddress.firstName}                        value={contactInfo.phone}

                        onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}                        onChange={(e) => handleContactInfoChange('phone', e.target.value)}

                        error={errors.firstName}                        error={errors.phone}

                      />                      />

                      <Input                    </div>

                        type="text"                  </div>

                        placeholder="Last Name"

                        value={shippingAddress.lastName}                  {/* Shipping Address */}

                        onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}                  <div className="space-y-4">

                        error={errors.lastName}                    <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                      />                      SHIPPING ADDRESS

                    </div>                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <Select                      <Input

                        value={shippingAddress.country}                        type="text"

                        onChange={(value) => handleShippingAddressChange('country', value)}                        placeholder="First Name"

                        options={countries}                        value={shippingAddress.firstName}

                        error={errors.country}                        onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}

                      />                        error={errors.firstName}

                      <Input                      />

                        type="text"                      <Input

                        placeholder="State / Region"                        type="text"

                        value={shippingAddress.state}                        placeholder="Last Name"

                        onChange={(e) => handleShippingAddressChange('state', e.target.value)}                        value={shippingAddress.lastName}

                        error={errors.state}                        onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}

                      />                        error={errors.lastName}

                    </div>                      />

                    <div className="grid grid-cols-1 gap-4">                    </div>

                      <Input                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        type="text"                      <Select

                        placeholder="Address"                        value={shippingAddress.country}

                        value={shippingAddress.address}                        onChange={(value) => handleShippingAddressChange('country', value)}

                        onChange={(e) => handleShippingAddressChange('address', e.target.value)}                        options={countries}

                        error={errors.address}                        error={errors.country}

                      />                      />

                    </div>                      <Input

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">                        type="text"

                      <Input                        placeholder="State / Region"

                        type="text"                        value={shippingAddress.state}

                        placeholder="City"                        onChange={(e) => handleShippingAddressChange('state', e.target.value)}

                        value={shippingAddress.city}                        error={errors.state}

                        onChange={(e) => handleShippingAddressChange('city', e.target.value)}                      />

                        error={errors.city}                    </div>

                      />                    <Input

                      <Input                      type="text"

                        type="text"                      placeholder="Address"

                        placeholder="Postal Code"                      value={shippingAddress.address}

                        value={shippingAddress.postalCode}                      onChange={(e) => handleShippingAddressChange('address', e.target.value)}

                        onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}                      error={errors.address}

                        error={errors.postalCode}                    />

                      />                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    </div>                      <Input

                        type="text"

                    {/* Save Address Checkbox */}                        placeholder="City"

                    {user && (                        value={shippingAddress.city}

                      <div className="flex items-center gap-2">                        onChange={(e) => handleShippingAddressChange('city', e.target.value)}

                        <input                        error={errors.city}

                          type="checkbox"                      />

                          id="save-address"                      <Input

                          checked={saveAddress}                        type="text"

                          onChange={(e) => setSaveAddress(e.target.checked)}                        placeholder="Postal Code"

                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"                        value={shippingAddress.postalCode}

                        />                        onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}

                        <label                        error={errors.postalCode}

                          htmlFor="save-address"                      />

                          className="text-sm text-label-secondary font-gilroy"                    </div>

                        >                  </div>

                          Save this address to my profile

                        </label>                  {/* Save Address Option for Authenticated Users */}

                      </div>                  {user && (

                    )}                    <div className="flex items-center gap-3">

                      <input

                    {/* Continue Button */}                        type="checkbox"

                    <Button                        id="saveAddress"

                      onClick={handleNextStep}                        checked={saveAddress}

                      className="w-full md:w-auto font-gilroy"                        onChange={(e) => setSaveAddress(e.target.checked)}

                    >                        className="w-4 h-4 text-label-primary bg-background border-separator rounded focus:ring-2 focus:ring-label-primary"

                      Continue to Shipping                      />

                    </Button>                      <label

                  </div>                        htmlFor="saveAddress"

                </div>                        className="text-sm text-label-secondary cursor-pointer"

              </div>                        style={{ fontFamily: 'Gilroy, sans-serif' }}

            </div>                      >

                        Save this address to my account

            {/* Order Summary */}                      </label>

            <div className="space-y-6">                    </div>

              {/* Order Summary Title */}                  )}

              <div>

                <h2 className="text-lg font-medium text-label-primary font-gilroy">                  {/* Shipping Button */}

                  ORDER SUMMARY                  <Button

                </h2>                    onClick={handleNextStep}

                <p className="text-label-secondary font-gilroy">                    className="w-full h-12 bg-fill-tertiary text-label-primary font-medium text-sm tracking-wider transition-all duration-200 hover:bg-fill-secondary"

                  ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})                    style={{ fontFamily: 'Gilroy, sans-serif' }}

                </p>                  >

              </div>                    Shipping

                  </Button>

              {/* Summary Details */}                </div>

              <OrderSummary items={state.items} />              )}

              

              {/* Continue Button */}              {currentStep === 'shipping' && (

              <div className="border-t pt-6">                <div className="space-y-6">

                <Button                  <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                  onClick={handleNextStep}                    SHIPPING METHOD

                  className="w-full font-gilroy"                  </h2>

                >                  <div className="p-4 border border-separator bg-fill-secondary">

                  Continue to Shipping                    <p className="text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                </Button>                      Free Standard Shipping (5-7 business days)

              </div>                    </p>

            </div>                  </div>

          </div>                  <button

        )}                    onClick={() => setCurrentStep('payment')}

                    className="w-full h-12 bg-fill-tertiary text-label-primary font-medium text-sm tracking-wider transition-all duration-200 hover:bg-fill-secondary"

        {/* Shipping Step */}                    style={{ fontFamily: 'Gilroy, sans-serif' }}

        {currentStep === 'shipping' && (                  >

          <div>                    Continue to Payment

            {/* Shipping content here */}                  </button>

          </div>                </div>

        )}              )}



        {/* Payment Step */}              {currentStep === 'payment' && (

        {currentStep === 'payment' && (                <div className="space-y-6">

          <div>                  <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

            {/* Payment content here */}                    PAYMENT

          </div>                  </h2>

        )}                  <div className="p-8 border border-separator bg-fill-secondary text-center">

      </div>                    <p className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>

                      Payment integration coming soon

      <Footer />                    </p>

    </div>                  </div>

  )                </div>

}              )}

            </div>

export default function CheckoutPage() {

  return (            {/* Right Side - Order Summary */}

    <div className="bg-background">            <OrderSummary />

      <Suspense fallback={<CheckoutLoading />}>          </div>

        <CheckoutContent />        </div>

      </Suspense>      </div>

    </div>

  )      <Footer />

}    </div>
  )
}

export default function CheckoutPage() {
  return (
    <SupabaseAuthProvider>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </SupabaseAuthProvider>
  )
}