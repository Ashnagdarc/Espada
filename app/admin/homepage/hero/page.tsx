'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X, 
  Plus, 
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle,
  Trash2,
  Edit3,
  Move
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ToastProvider, useToastHelpers } from '@/components/admin/ui/Toast';

interface HeroImage {
  id?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_temp?: boolean;
}

interface CategoryLink {
  name: string;
  href: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  categories: CategoryLink[];
}

interface HeroSection {
  id?: string;
  content: HeroContent;
  status: 'draft' | 'published' | 'scheduled';
  images: HeroImage[];
}

function HeroEditorContent() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [heroSection, setHeroSection] = useState<HeroSection>({
    content: {
      title: '',
      subtitle: '',
      categories: []
    },
    status: 'draft',
    images: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const { success, error: showError, info } = useToastHelpers();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Fetch hero section data
  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/homepage/sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch hero section');
        }

        const data = await response.json();
        const hero = data.sections?.hero;
        
        if (hero) {
          setHeroSection({
            id: hero.id,
            content: {
              title: hero.content?.title || '',
              subtitle: hero.content?.subtitle || '',
              categories: hero.content?.categories || []
            },
            status: hero.status || 'draft',
            images: hero.images || []
          });
        }
        success('Hero section loaded successfully');
      } catch (err) {
        console.error('Error fetching hero section:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load hero section';
        setError(errorMessage);
        showError('Loading Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchHeroSection();
    }
  }, [user, isAdmin]);

  const handleImageUpload = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/homepage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      console.error('Error uploading image:', err);
      throw err;
    }
  };

  const addImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await handleImageUpload(file);
      const newImage: HeroImage = {
        image_url: imageUrl,
        alt_text: '',
        display_order: heroSection.images.length,
        is_temp: true
      };

      setHeroSection(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      success('Image uploaded successfully');
    } catch (err) {
      const errorMessage = 'Failed to upload image';
      setError(errorMessage);
      showError('Upload Failed', errorMessage);
    }
  };

  const removeImage = (index: number) => {
    setHeroSection(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageAlt = (index: number, altText: string) => {
    setHeroSection(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, alt_text: altText } : img
      )
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setHeroSection(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      // Update display_order
      return {
        ...prev,
        images: newImages.map((img, i) => ({ ...img, display_order: i }))
      };
    });
  };

  const addCategory = () => {
    setHeroSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        categories: [...prev.content.categories, { name: '', href: '' }]
      }
    }));
  };

  const updateCategory = (index: number, field: 'name' | 'href', value: string) => {
    setHeroSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        categories: prev.content.categories.map((cat, i) => 
          i === index ? { ...cat, [field]: value } : cat
        )
      }
    }));
  };

  const removeCategory = (index: number) => {
    setHeroSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        categories: prev.content.categories.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/admin/homepage/sections', {
        method: heroSection.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: 'hero',
          content: heroSection.content,
          status: heroSection.status,
          images: heroSection.images.map((img, index) => ({
            ...img,
            display_order: index
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save hero section');
      }

      const data = await response.json();
      setHeroSection(prev => ({ ...prev, id: data.section.id }));
      success('Hero section saved successfully!');
    } catch (err) {
      console.error('Error saving hero section:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save hero section';
      setError(errorMessage);
      showError('Save Failed', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="h-64 bg-white/10 rounded-lg"></div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/admin/homepage"
              className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Hero Section Editor</h1>
              <p className="text-white/70">Manage the main hero section of your homepage</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            
            <select
              value={heroSection.status}
              onChange={(e) => setHeroSection(prev => ({ 
                ...prev, 
                status: e.target.value as 'draft' | 'published' | 'scheduled' 
              }))}
              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
            </select>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center px-6 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>



        {previewMode ? (
          /* Preview Mode */
          <div className="bg-white/5 border border-white/10 rounded-lg p-8">
            <div className="relative h-96 bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg overflow-hidden">
              {heroSection.images.length > 0 && (
                <Image
                  src={heroSection.images[0].image_url}
                  alt={heroSection.images[0].alt_text || 'Hero image'}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h1 className="text-4xl font-bold mb-4">{heroSection.content?.title || 'Hero Title'}</h1>
                  <p className="text-xl mb-8">{heroSection.content?.subtitle || 'Hero subtitle'}</p>
                  <div className="flex justify-center space-x-4">
                    {(heroSection.content?.categories || []).map((category, index) => (
                      <button
                        key={index}
                        className="px-6 py-3 bg-white text-black rounded-lg hover:bg-white/90 transition-colors"
                      >
                        {category.name || `Category ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Editor */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={heroSection.content?.title || ''}
                      onChange={(e) => setHeroSection(prev => ({
                        ...prev,
                        content: { ...prev.content, title: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter hero title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Subtitle
                    </label>
                    <textarea
                      value={heroSection.content?.subtitle || ''}
                      onChange={(e) => setHeroSection(prev => ({
                        ...prev,
                        content: { ...prev.content, subtitle: e.target.value }
                      }))}
                      rows={3}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter hero subtitle"
                    />
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Category Links</h2>
                  <button
                    onClick={addCategory}
                    className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Category
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(heroSection.content?.categories || []).map((category, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={category.name}
                        onChange={(e) => updateCategory(index, 'name', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                        placeholder="Category name"
                      />
                      <input
                        type="text"
                        value={category.href}
                        onChange={(e) => updateCategory(index, 'href', e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                        placeholder="Link URL"
                      />
                      <button
                        onClick={() => removeCategory(index)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Manager */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Hero Images</h2>
                <label className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={addImage}
                    className="hidden"
                  />
                </label>
              </div>
              
              <div className="space-y-4">
                {heroSection.images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative w-20 h-20 bg-white/10 rounded-lg overflow-hidden">
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || 'Hero image'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={image.alt_text}
                          onChange={(e) => updateImageAlt(index, e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
                          placeholder="Alt text"
                        />
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => index > 0 && moveImage(index, index - 1)}
                            disabled={index === 0}
                            className="p-1 text-white/60 hover:text-white disabled:opacity-30"
                          >
                            <Move className="w-4 h-4" />
                          </button>
                          <span className="text-xs text-white/60">Order: {index + 1}</span>
                          <button
                            onClick={() => removeImage(index)}
                            className="p-1 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {heroSection.images.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images to display in the hero section</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// Wrap with ToastProvider
export default function HeroEditor() {
  return (
    <ToastProvider>
      <HeroEditorContent />
    </ToastProvider>
  );
}