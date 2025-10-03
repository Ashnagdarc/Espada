"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Phone, MapPin } from "lucide-react";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/contexts/ToastContext";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error } = useToast();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      error(
        "Please fix the errors above",
        "All fields are required and must be valid"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Show success toast
      success(
        "Message sent successfully!",
        `Thank you ${formData.name}, we'll get back to you soon.`
      );

      // Reset form
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      error(
        "Failed to send message",
        "Please try again or contact us directly"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-24">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-large-title font-bold text-label-primary mb-6 uppercase tracking-tight">
              Contact Us
            </h1>
            <p className="text-title-3 text-label-secondary max-w-2xl mx-auto leading-relaxed">
              We'd love to hear from you. Send us a message and we'll respond as
              soon as possible.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Information */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div>
                <h2 className="text-title-2 font-semibold text-label-primary mb-6">
                  Get in Touch
                </h2>
                <p className="text-body text-label-secondary leading-relaxed mb-8">
                  Whether you have questions about our products, need styling
                  advice, or want to collaborate with us, we're here to help.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-fill-quaternary flex items-center justify-center">
                    <Mail className="h-5 w-5 text-label-primary" />
                  </div>
                  <div>
                    <p className="text-headline font-medium text-label-primary">
                      Email
                    </p>
                    <p className="text-callout text-label-secondary">
                      hello@espada.com
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-fill-quaternary flex items-center justify-center">
                    <Phone className="h-5 w-5 text-label-primary" />
                  </div>
                  <div>
                    <p className="text-headline font-medium text-label-primary">
                      Phone
                    </p>
                    <p className="text-callout text-label-secondary">
                      +1 (555) 123-4567
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-fill-quaternary flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-label-primary" />
                  </div>
                  <div>
                    <p className="text-headline font-medium text-label-primary">
                      Studio
                    </p>
                    <p className="text-callout text-label-secondary">
                      New York, NY
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-headline font-medium text-label-primary mb-3"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full h-12 px-4 rounded-xl border transition-all duration-200 text-body bg-fill-quaternary/50 placeholder:text-label-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.name ? "border-red-500" : "border-separator-opaque"
                    }`}
                    placeholder="Your full name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-caption text-red-500">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-headline font-medium text-label-primary mb-3"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full h-12 px-4 rounded-xl border transition-all duration-200 text-body bg-fill-quaternary/50 placeholder:text-label-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      errors.email
                        ? "border-red-500"
                        : "border-separator-opaque"
                    }`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-2 text-caption text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Message Field */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-headline font-medium text-label-primary mb-3"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-xl border transition-all duration-200 text-body bg-fill-quaternary/50 placeholder:text-label-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                      errors.message
                        ? "border-red-500"
                        : "border-separator-opaque"
                    }`}
                    placeholder="Tell us how we can help you..."
                  />
                  {errors.message && (
                    <p className="mt-2 text-caption text-red-500">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-headline font-medium"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </div>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
