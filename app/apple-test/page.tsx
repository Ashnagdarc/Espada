'use client';

import React, { useState } from 'react';
import { AppleButton, AppleInput, AppleCard, AppleHeader } from '@/components/apple';
import { Search, ShoppingCart, Heart, Star, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

function AppleTestPageContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { success, error, warning, info } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    success('Form Submitted', { description: 'Your form has been successfully submitted!' });
  };

  const showToastDemo = (type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: { title: 'Success!', message: 'This is a success toast notification.' },
      error: { title: 'Error!', message: 'This is an error toast notification.' },
      warning: { title: 'Warning!', message: 'This is a warning toast notification.' },
      info: { title: 'Info', message: 'This is an info toast notification.' }
    };
    
    const { title, message } = messages[type];
    if (type === 'success') {
      success(title, { description: message });
    } else if (type === 'error') {
      error(title, { description: message });
    } else if (type === 'warning') {
      warning(title, { description: message });
    } else {
      info(title, { description: message });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Apple Header Test */}
      <AppleHeader
        variant="large"
        sticky
        blurred
        title="Apple Design System"
        subtitle="Testing Apple-compliant components"
        leftContent={
          <AppleButton variant="ghost" size="sm">
            ← Back
          </AppleButton>
        }
        rightContent={
          <div className="flex items-center gap-apple-2">
            <AppleButton variant="tertiary" size="sm" leftIcon={<Search className="h-4 w-4" />}>
              Search
            </AppleButton>
            <AppleButton variant="secondary" size="sm" leftIcon={<ShoppingCart className="h-4 w-4" />}>
              Cart
            </AppleButton>
          </div>
        }
      />

      <div className="max-w-6xl mx-auto px-apple-4 py-apple-8 space-y-apple-8">
        {/* Typography Test */}
        <AppleCard variant="spacious" header="Typography Scale">
          <div className="space-y-apple-4">
            <div className="text-apple-large-title font-bold text-label-primary">
              Large Title - 34px
            </div>
            <div className="text-apple-title-1 font-semibold text-label-primary">
              Title 1 - 28px
            </div>
            <div className="text-apple-title-2 font-medium text-label-primary">
              Title 2 - 22px
            </div>
            <div className="text-apple-title-3 font-medium text-label-primary">
              Title 3 - 20px
            </div>
            <div className="text-apple-headline font-semibold text-label-primary">
              Headline - 17px
            </div>
            <div className="text-apple-body text-label-primary">
              Body - 17px Regular
            </div>
            <div className="text-apple-callout text-label-primary">
              Callout - 16px
            </div>
            <div className="text-apple-subheadline text-label-secondary">
              Subheadline - 15px
            </div>
            <div className="text-apple-footnote text-label-secondary">
              Footnote - 13px
            </div>
            <div className="text-apple-caption-1 text-label-tertiary">
              Caption 1 - 12px
            </div>
            <div className="text-apple-caption-2 text-label-tertiary">
              Caption 2 - 11px
            </div>
          </div>
        </AppleCard>

        {/* Toast Test */}
        <AppleCard variant="spacious" header="Toast Notifications">
          <div className="space-y-apple-4">
            <p className="text-apple-body text-label-primary">
              Test the toast notification system with different types and messages.
            </p>
            <div className="flex flex-wrap gap-apple-3">
              <AppleButton 
                variant="primary" 
                size="md" 
                onClick={() => showToastDemo('success')}
              >
                Show Success Toast
              </AppleButton>
              <AppleButton 
                variant="destructive" 
                size="md" 
                onClick={() => showToastDemo('error')}
              >
                Show Error Toast
              </AppleButton>
              <AppleButton 
                variant="secondary" 
                size="md" 
                onClick={() => showToastDemo('warning')}
              >
                Show Warning Toast
              </AppleButton>
              <AppleButton 
                variant="tertiary" 
                size="md" 
                onClick={() => showToastDemo('info')}
              >
                Show Info Toast
              </AppleButton>
            </div>
          </div>
        </AppleCard>

        {/* Button Test */}
        <AppleCard variant="spacious" header="Button Variants & States">
          <div className="space-y-apple-6">
            {/* Primary Buttons */}
            <div className="space-y-apple-3">
              <h3 className="text-apple-headline font-semibold text-label-primary">Primary Buttons</h3>
              <div className="flex flex-wrap gap-apple-3">
                <AppleButton variant="primary" size="sm">Small Primary</AppleButton>
                <AppleButton variant="primary" size="md">Medium Primary</AppleButton>
                <AppleButton variant="primary" size="lg">Large Primary</AppleButton>
                <AppleButton variant="primary" size="md" loading>Loading</AppleButton>
                <AppleButton variant="primary" size="md" disabled>Disabled</AppleButton>
              </div>
            </div>

            {/* Secondary Buttons */}
            <div className="space-y-apple-3">
              <h3 className="text-apple-headline font-semibold text-label-primary">Secondary Buttons</h3>
              <div className="flex flex-wrap gap-apple-3">
                <AppleButton variant="secondary" size="md">Secondary</AppleButton>
                <AppleButton variant="secondary" size="md" leftIcon={<Heart className="h-4 w-4" />}>
                  With Icon
                </AppleButton>
                <AppleButton variant="secondary" size="md" rightIcon={<Star className="h-4 w-4" />}>
                  Right Icon
                </AppleButton>
              </div>
            </div>

            {/* Other Variants */}
            <div className="space-y-apple-3">
              <h3 className="text-apple-headline font-semibold text-label-primary">Other Variants</h3>
              <div className="flex flex-wrap gap-apple-3">
                <AppleButton variant="tertiary" size="md">Tertiary</AppleButton>
                <AppleButton variant="destructive" size="md">Destructive</AppleButton>
                <AppleButton variant="ghost" size="md">Ghost</AppleButton>
              </div>
            </div>

            {/* Full Width */}
            <div className="space-y-apple-3">
              <h3 className="text-apple-headline font-semibold text-label-primary">Full Width</h3>
              <AppleButton variant="primary" size="md" fullWidth>
                Full Width Button
              </AppleButton>
            </div>
          </div>
        </AppleCard>

        {/* Input Test */}
        <AppleCard variant="spacious" header="Input Components">
          <form onSubmit={handleSubmit} className="space-y-apple-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-6">
              <AppleInput
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
                helperText="We'll never share your email"
                required
              />
              
              <AppleInput
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                helperText="Minimum 8 characters"
                required
              />
            </div>

            <div className="space-y-apple-4">
              <AppleInput
                label="Search Products"
                placeholder="Search for products..."
                variant="filled"
                leftIcon={<Search className="h-4 w-4" />}
              />
              
              <AppleInput
                label="Outlined Input"
                placeholder="This is an outlined input"
                variant="outlined"
                helperText="This input has an outlined style"
              />
              
              <AppleInput
                label="Error State"
                placeholder="This input has an error"
                errorText="This field is required"
                defaultValue="Invalid input"
              />
            </div>

            <AppleButton 
              type="submit" 
              variant="primary" 
              size="lg" 
              fullWidth 
              loading={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </AppleButton>
          </form>
        </AppleCard>

        {/* Card Variants Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-apple-6">
          <AppleCard variant="default" header="Default Card">
            <p className="text-apple-body text-label-primary">
              This is a default card with standard styling and spacing.
            </p>
          </AppleCard>

          <AppleCard variant="compact" header="Compact Card">
            <p className="text-apple-body text-label-primary">
              This is a compact card with reduced padding.
            </p>
          </AppleCard>

          <AppleCard variant="elevated" header="Elevated Card">
            <p className="text-apple-body text-label-primary">
              This is an elevated card with enhanced shadow.
            </p>
          </AppleCard>

          <AppleCard 
            variant="outlined" 
            header="Outlined Card"
            interactive
          >
            <p className="text-apple-body text-label-primary">
              This is an interactive outlined card. Try hovering over it!
            </p>
          </AppleCard>

          <AppleCard 
            variant="default"
            header="Card with Footer"
            footer="Footer content here"
          >
            <p className="text-apple-body text-label-primary">
              This card has both header and footer sections.
            </p>
          </AppleCard>

          <AppleCard variant="default" loading>
            Loading card content...
          </AppleCard>
        </div>

        {/* Accessibility Test */}
        <AppleCard variant="spacious" header="Accessibility Features">
          <div className="space-y-apple-4">
            <div className="text-apple-body text-label-primary">
              <strong>WCAG 2.1 AA Compliance Features:</strong>
            </div>
            <ul className="space-y-apple-2 text-apple-body text-label-secondary ml-apple-4">
              <li>• Minimum 44px touch targets for all interactive elements</li>
              <li>• High contrast ratios (4.5:1 for normal text, 3:1 for large text)</li>
              <li>• Focus indicators with proper visibility</li>
              <li>• Semantic HTML structure</li>
              <li>• Proper ARIA labels and descriptions</li>
              <li>• Keyboard navigation support</li>
              <li>• Reduced motion preferences respected</li>
            </ul>
            
            <div className="mt-apple-6 p-apple-4 bg-apple-blue-50 dark:bg-apple-blue-900/20 rounded-apple-md">
              <p className="text-apple-footnote text-apple-blue-700 dark:text-apple-blue-300">
                <strong>Note:</strong> All components follow Apple's Human Interface Guidelines 
                and meet WCAG 2.1 AA accessibility standards.
              </p>
            </div>
          </div>
        </AppleCard>

        {/* Color Test */}
        <AppleCard variant="spacious" header="Color System">
          <div className="space-y-apple-6">
            <div>
              <h3 className="text-apple-headline font-semibold text-label-primary mb-apple-3">
                Label Colors
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-apple-3">
                <div className="p-apple-3 rounded-apple-md bg-fill-secondary">
                  <div className="text-apple-footnote text-label-primary font-medium">Primary</div>
                  <div className="text-apple-caption-1 text-label-primary">Main content</div>
                </div>
                <div className="p-apple-3 rounded-apple-md bg-fill-secondary">
                  <div className="text-apple-footnote text-label-secondary font-medium">Secondary</div>
                  <div className="text-apple-caption-1 text-label-secondary">Subdued content</div>
                </div>
                <div className="p-apple-3 rounded-apple-md bg-fill-secondary">
                  <div className="text-apple-footnote text-label-tertiary font-medium">Tertiary</div>
                  <div className="text-apple-caption-1 text-label-tertiary">Placeholder text</div>
                </div>
                <div className="p-apple-3 rounded-apple-md bg-fill-secondary">
                  <div className="text-apple-footnote text-label-quaternary font-medium">Quaternary</div>
                  <div className="text-apple-caption-1 text-label-quaternary">Disabled text</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-apple-headline font-semibold text-label-primary mb-apple-3">
                System Colors
              </h3>
              <div className="grid grid-cols-3 gap-apple-3">
                <div className="p-apple-4 rounded-apple-md bg-apple-blue-500 text-white text-center">
                  <div className="text-apple-footnote font-medium">Apple Blue</div>
                  <div className="text-apple-caption-1">#007AFF</div>
                </div>
                <div className="p-apple-4 rounded-apple-md bg-apple-red-500 text-white text-center">
                  <div className="text-apple-footnote font-medium">Apple Red</div>
                  <div className="text-apple-caption-1">#FF3B30</div>
                </div>
                <div className="p-apple-4 rounded-apple-md bg-apple-green-500 text-white text-center">
                  <div className="text-apple-footnote font-medium">Apple Green</div>
                  <div className="text-apple-caption-1">#34C759</div>
                </div>
              </div>
            </div>
          </div>
        </AppleCard>
      </div>
    </div>
  );
}

export default function AppleTestPage() {
  return <AppleTestPageContent />;
}