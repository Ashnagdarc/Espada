'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, User, LogIn } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { useCart } from '@/contexts/CartContext'
import { useAuth, SupabaseAuthProvider } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import OrderSummary from '@/components/checkout/OrderSummary'
import { useToastActions } from '@/contexts/ToastContext'

// Loading component for better UX
function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-label-secondary" />
          <span className="text-label-secondary font-gilroy">
            Loading checkout...
          </span>
        </div>
      </div>
      <Footer />
    </div>
  )
}

// Error fallback component
function CheckoutError({ retry }: { retry: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            Checkout Error
          </h2>
          <p className="text-label-secondary mb-6" style={{ fontFamily: 'Gilroy, sans-serif' }}>
            We encountered an error while loading the checkout page. Please try again.
          </p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-label-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            style={{ fontFamily: 'Gilroy, sans-serif' }}
          >
            Try Again
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}

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
  const { state, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { success, error: showError } = useToastActions()
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!user || !profile) {
      showError('Authentication required', 'Please sign in to place an order')
      return
    }

    // Validate required fields
    const newErrors: Record<string, string> = {}
    
    if (!contactInfo.email) newErrors.email = 'Email is required'
    if (!shippingAddress.firstName) newErrors.firstName = 'First name is required'
    if (!shippingAddress.lastName) newErrors.lastName = 'Last name is required'
    if (!shippingAddress.address) newErrors.address = 'Address is required'
    if (!shippingAddress.city) newErrors.city = 'City is required'
    if (!shippingAddress.postalCode) newErrors.postalCode = 'Postal code is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      showError('Missing information', 'Please fill in all required fields')
      setCurrentStep('information')
      return
    }

    setIsPlacingOrder(true)

    try {
      // Prepare order data
      const orderData = {
        customer_id: profile.id,
        items: state.items.map(item => ({
          product_id: String(item.id),
          quantity: item.quantity,
          unit_price: item.price,
          color: item.color,
          size: item.size
        })),
        total_amount: state.total,
        shipping_address: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country
        },
        billing_address: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postalCode,
          country: shippingAddress.country
        },
        payment_method: 'cash_on_delivery',
        notes: `Contact: ${contactInfo.phone || 'Not provided'}`
      }

      // Create order
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create order')
      }

      // Clear cart and show success
      clearCart()
      success('Order placed successfully!', `Order #${result.data.order_number} has been created`)
      
      // Redirect to order confirmation or orders page
      router.push(`/account/orders?new_order=${result.data.order_number}`)

    } catch (err) {
      console.error('Error placing order:', err)
      showError(
        'Order failed', 
        err instanceof Error ? err.message : 'Please try again or contact support'
      )
    } finally {
      setIsPlacingOrder(false)
    }
  }

  // Prevent hydration mismatch
  useEffect(() => {
    try {
      setMounted(true)
    } catch (err) {
      console.error('Error mounting component:', err)
      setError('Failed to initialize checkout')
    }
  }, [])

  // Pre-fill form with customer data if authenticated
  useEffect(() => {
    try {
      if (user && profile) {
        setContactInfo({
          email: user.email || '',
          phone: profile.phone || ''
        })

        if (profile.address) {
          setShippingAddress({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            country: profile.country || 'United States',
            state: '',
            address: profile.address || '',
            city: profile.city || '',
            postalCode: profile.postal_code || ''
          })
        }
      }
    } catch (err) {
      console.error('Error pre-filling form data:', err)
      setError('Failed to load user data')
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
      if (user && profile && saveAddress) {
        // Note: This would need to be implemented in the SupabaseAuthContext
        // For now, we'll just proceed to the next step
        console.log('Address would be saved to customer profile')
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

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleShippingAddressChange = (field: keyof typeof shippingAddress, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }))
  }

  // Show error state if there's an error
  if (error) {
    return <CheckoutError retry={() => setError(null)} />
  }

  // Show loading state until component is mounted and cart is loaded to prevent hydration mismatch
  if (!mounted || !state.isLoaded) {
    return <CheckoutLoading />
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
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-label-secondary hover:text-label-primary transition-colors mb-8"
          style={{ fontFamily: 'Gilroy, sans-serif' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex gap-8 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-2 ${step.isActive ? 'text-label-primary' : 'text-label-secondary'}`}>
                <span className="text-sm font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="w-8 h-px bg-separator mx-4" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            {!user && (
              <div className="p-6 border border-separator bg-fill-secondary">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5 text-label-secondary" />
                  <div>
                    <h3 className="font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Sign in for faster checkout
                    </h3>
                    <p className="text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Access your saved addresses and order history
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/auth/signin')}
                  className="flex items-center gap-2 text-sm text-label-primary hover:text-opacity-80 transition-colors"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            )}

            {user && profile && (
              <div className="p-6 border border-separator bg-fill-secondary">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-green-600" />
                  <div>
                    <h3 className="font-medium text-label-primary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Welcome back, {user.email}
                    </h3>
                    <p className="text-xs text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Signed in and ready to checkout
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 'information' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-label-primary mb-4" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    CONTACT INFORMATION
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
                      onChange={(value) => handleShippingAddressChange('country', value)}
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

                <Button
                  onClick={handleNextStep}
                  className="w-full h-12 bg-fill-tertiary text-label-primary font-medium text-sm tracking-wider transition-all duration-200 hover:bg-fill-secondary"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  Continue to Shipping
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
                
                {/* Payment Method Selection */}
                <div className="space-y-4">
                  <div className="p-4 border border-separator bg-fill-secondary rounded-lg">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="cash_on_delivery"
                        defaultChecked
                        className="w-4 h-4 text-label-primary"
                      />
                      <span className="text-label-primary font-medium" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Cash on Delivery
                      </span>
                    </label>
                    <p className="text-sm text-label-secondary mt-2 ml-7" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                      Pay when your order is delivered to your doorstep
                    </p>
                  </div>
                  
                  <div className="p-4 border border-separator bg-fill-tertiary rounded-lg opacity-60">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value="credit_card"
                        disabled
                        className="w-4 h-4 text-label-primary"
                      />
                      <span className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                        Credit Card (Coming Soon)
                      </span>
                    </label>
                  </div>
                </div>

                {/* Place Order Button */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={isPlacingOrder || !user}
                  className="w-full h-12 bg-label-primary text-white font-medium text-sm tracking-wider transition-all duration-200 hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Gilroy, sans-serif' }}
                >
                  {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                </button>

                {!user && (
                  <p className="text-sm text-label-secondary text-center" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                    Please sign in to place an order
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-label-primary mb-2" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                ORDER SUMMARY
              </h2>
              <p className="text-label-secondary" style={{ fontFamily: 'Gilroy, sans-serif' }}>
                ({state.items.length} {state.items.length === 1 ? 'item' : 'items'})
              </p>
            </div>

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
    <SupabaseAuthProvider>
      <Suspense fallback={<CheckoutLoading />}>
        <CheckoutContent />
      </Suspense>
    </SupabaseAuthProvider>
  )
}