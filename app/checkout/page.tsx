'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, LogIn } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { useCustomerAuth, CustomerAuthProvider } from '@/contexts/CustomerAuthContext'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import OrderSummary from '@/components/checkout/OrderSummary'

interface CheckoutStep {
  id: string
  label: string
  isActive: boolean
  isCompleted: boolean
}

interface ContactInfo {
  email: string
  phone: string
}

interface ShippingAddress {
  firstName: string
  lastName: string
  country: string
  state: string
  address: string
  city: string
  postalCode: string
}

function CheckoutContent() {
  const router = useRouter()
  const { state, addItem, removeItem, updateQuantity, clearCart } = useCart()
  const { user, profile, isLoading } = useCustomerAuth()
  
  const [currentStep, setCurrentStep] = useState('information')
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: ''
  })
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    country: 'United States',
    state: '',
    address: '',
    city: '',
    postalCode: ''
  })
  const [saveAddress, setSaveAddress] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Pre-fill form with customer data if authenticated
  useEffect(() => {
    if (user && profile) {
      setContactInfo({
        email: user.primaryEmail || '',
        phone: profile.phone || ''
      })
      
      if (profile.address) {
        setShippingAddress({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          country: profile.country || 'United States',
          state: profile.state || '',
          address: profile.address || '',
          city: profile.city || '',
          postalCode: profile.postal_code || ''
        })
      }
    }
  }, [user, profile])

  const countries = [
    { value: 'United States', label: 'United States' },
    { value: 'Canada', label: 'Canada' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Japan', label: 'Japan' }
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!contactInfo.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(contactInfo.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!contactInfo.phone) {
      newErrors.phone = 'Phone is required'
    }

    if (!shippingAddress.firstName) {
      newErrors.firstName = 'First name is required'
    }

    if (!shippingAddress.lastName) {
      newErrors.lastName = 'Last name is required'
    }

    if (!shippingAddress.address) {
      newErrors.address = 'Address is required'
    }

    if (!shippingAddress.city) {
      newErrors.city = 'City is required'
    }

    if (!shippingAddress.state) {
      newErrors.state = 'State/Region is required'
    }

    if (!shippingAddress.postalCode) {
      newErrors.postalCode = 'Postal code is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = async () => {
    if (validateForm()) {
      // Save address to customer profile if authenticated and checkbox is checked
      if (user && profile && saveAddress) {
        try {
          const { updateProfile } = await import('@/contexts/CustomerAuthContext')
          // Note: This would need to be implemented in the CustomerAuthContext
          // For now, we'll just proceed to the next step
          console.log('Address would be saved to customer profile')
        } catch (error) {
          console.error('Error saving address:', error)
        }
      }
      setCurrentStep('shipping')
    }
  }

  const steps: CheckoutStep[] = [
    {
      id: 'information',
      label: 'INFORMATION',
      isActive: currentStep === 'information',
      isCompleted: false
    },
    {
      id: 'shipping',
      label: 'SHIPPING',
      isActive: currentStep === 'shipping',
      isCompleted: false
    },
    {
      id: 'payment',
      label: 'PAYMENT',
      isActive: currentStep === 'payment',
      isCompleted: false
    }
  ]

  const subtotal = state.total
  const shipping = 0 // Free shipping
  const total = subtotal + shipping

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleShippingAddressChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
              Your cart is empty
            </h1>
            <button
              onClick={() => router.push('/products')}
              className="text-label-secondary hover:text-label-primary transition-colors"
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back Button */}
      <div className="px-8 py-4 border-b border-separator">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Checkout Header */}
      <div className="px-8 py-6">
        <h1 className="text-3xl font-bold text-label-primary mb-8" style={{ fontFamily: 'Gilroy, sans-serif' }}>
          CHECKOUT
        </h1>
        
        {/* Step Navigation */}
        <div className="flex gap-8 mb-8">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`text-sm font-medium tracking-wider transition-colors ${
                step.isActive ? 'text-label-primary' : 'text-label-tertiary'
              }`}
              style={{ fontFamily: 'Gilroy, sans-serif' }}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left Side - Checkout Form */}
            <div className="space-y-8">
              {/* Customer Authentication Section */}
              {!user && (
                <div className="p-6 border border-separator bg-fill-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-label-secondary" />
                      <div>
                        <h3 className="text-sm font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Sign in for faster checkout
                        </h3>
                        <p className="text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                          Access your saved addresses and order history
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push('/handler/signin?redirect=/checkout')}
                      className="flex items-center gap-2 px-4 py-2 bg-label-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 transition-all"
                      style={{ fontFamily: 'Gilroy, sans-serif' }}
                    >
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Button>
                  </div>
                </div>
              )}

              {user && profile && (
                <div className="p-6 border border-separator bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-green-600" />
                    <div>
                      <h3 className="text-sm font-medium text-green-800" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Welcome back, {profile.first_name}!
                      </h3>
                      <p className="text-xs text-green-600" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Your information has been pre-filled from your account
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'information' && (
                <div className="space-y-6">
                  {/* Contact Info */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      CONTACT INFO
                    </h2>
                    <div className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Email"
                        value={contactInfo.email}
                        onChange={(e) => handleContactInfoChange('email', e.target.value)}
                        error={errors.email}
                      />
                      <Input
                        type="tel"
                        placeholder="Phone"
                        value={contactInfo.phone}
                        onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                        error={errors.phone}
                      />
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      SHIPPING ADDRESS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="First Name"
                        value={shippingAddress.firstName}
                        onChange={(e) => handleShippingAddressChange('firstName', e.target.value)}
                        error={errors.firstName}
                      />
                      <Input
                        type="text"
                        placeholder="Last Name"
                        value={shippingAddress.lastName}
                        onChange={(e) => handleShippingAddressChange('lastName', e.target.value)}
                        error={errors.lastName}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        value={shippingAddress.country}
                        onChange={(e) => handleShippingAddressChange('country', e.target.value)}
                        options={countries}
                        error={errors.country}
                      />
                      <Input
                        type="text"
                        placeholder="State / Region"
                        value={shippingAddress.state}
                        onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                        error={errors.state}
                      />
                    </div>
                    <Input
                      type="text"
                      placeholder="Address"
                      value={shippingAddress.address}
                      onChange={(e) => handleShippingAddressChange('address', e.target.value)}
                      error={errors.address}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        type="text"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                        error={errors.city}
                      />
                      <Input
                        type="text"
                        placeholder="Postal Code"
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleShippingAddressChange('postalCode', e.target.value)}
                        error={errors.postalCode}
                      />
                    </div>
                  </div>

                  {/* Save Address Option for Authenticated Users */}
                  {user && (
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="saveAddress"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-4 h-4 text-label-primary bg-background border-separator rounded focus:ring-2 focus:ring-label-primary"
                      />
                      <label
                        htmlFor="saveAddress"
                        className="text-sm text-label-secondary cursor-pointer"
                        style={{ fontFamily: 'Gilroy, sans-serif' }}
                      >
                        Save this address to my account
                      </label>
                    </div>
                  )}

                  {/* Shipping Button */}
                  <Button
                    onClick={handleNextStep}
                    className="w-full h-12 bg-fill-tertiary text-label-primary font-medium text-sm tracking-wider transition-all duration-200 hover:bg-fill-secondary"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    Shipping
                  </Button>
                </div>
              )}

              {currentStep === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    SHIPPING METHOD
                  </h2>
                  <div className="p-4 border border-separator bg-fill-secondary">
                    <p className="text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Free Standard Shipping (5-7 business days)
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep('payment')}
                    className="w-full h-12 bg-fill-tertiary text-label-primary font-medium text-sm tracking-wider transition-all duration-200 hover:bg-fill-secondary"
                    style={{ fontFamily: 'Gilroy, sans-serif' }}
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === 'payment' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    PAYMENT
                  </h2>
                  <div className="p-8 border border-separator bg-fill-secondary text-center">
                    <p className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Payment integration coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Order Summary */}
            <OrderSummary />
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CustomerAuthProvider>
      <CheckoutContent />
    </CustomerAuthProvider>
  )
}