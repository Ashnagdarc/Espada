'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  Eye, 
  EyeOff,
  Trash2,
  Move,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToastActions } from '@/hooks/useToast';

interface ApproachImage {
  id?: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_temp?: boolean;
}

interface ApproachContent {
  title: string;
  subtitle: string;
  description: string;
  features: Array<{
    title: string;
    description: string;
  }>;
}

interface ApproachSection {
  id?: string;
  content: ApproachContent;
  status: 'draft' | 'published' | 'scheduled';
  images: ApproachImage[];
}

function ApproachEditorContent() {
  const { isLoading: authLoading } = useAuth();
  const { success, error } = useToastActions();
  const [approachSection, setApproachSection] = useState<ApproachSection>({
    content: {
      title: '',
      subtitle: '',
      description: '',
      features: []
    },
    status: 'draft',
    images: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Auth removed: no redirects

  // Fetch approach section data
  useEffect(() => {
    const fetchApproachSection = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/homepage/sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch approach section');
        }

        const data = await response.json();
        const approach = data.sections?.approach;
        
        if (approach) {
          setApproachSection({
            id: approach.id,
            content: approach.content || {
              title: '',
              subtitle: '',
              description: '',
              features: []
            },
            status: approach.status || 'draft',
            images: approach.images || []
          });
          success('Approach section loaded successfully');
        }
      } catch (err) {
        console.error('Error fetching approach section:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load approach section';
        setError(errorMessage);
        error('Loading Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApproachSection();
  }, []);

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
      const newImage: ApproachImage = {
        image_url: imageUrl,
        alt_text: '',
        display_order: approachSection.images.length,
        is_temp: true
      };

      setApproachSection(prev => ({
        ...prev,
        images: [...prev.images, newImage]
      }));
      success('Image uploaded successfully');
    } catch {
      const errorMessage = 'Failed to upload image';
      setError(errorMessage);
      error('Upload Failed', errorMessage);
    }
  };

  const removeImage = (index: number) => {
    setApproachSection(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const updateImageAlt = (index: number, altText: string) => {
    setApproachSection(prev => ({
      ...prev,
      images: prev.images.map((img, i) => 
        i === index ? { ...img, alt_text: altText } : img
      )
    }));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    setApproachSection(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      
      return {
        ...prev,
        images: newImages.map((img, i) => ({ ...img, display_order: i }))
      };
    });
  };

  const addFeature = () => {
    setApproachSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        features: [...prev.content.features, { title: '', description: '' }]
      }
    }));
  };

  const updateFeature = (index: number, field: 'title' | 'description', value: string) => {
    setApproachSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        features: prev.content.features.map((feature, i) => 
          i === index ? { ...feature, [field]: value } : feature
        )
      }
    }));
  };

  const removeFeature = (index: number) => {
    setApproachSection(prev => ({
      ...prev,
      content: {
        ...prev.content,
        features: prev.content.features.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch('/api/admin/homepage/sections', {
        method: approachSection.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section_type: 'approach',
          content: approachSection.content,
          status: approachSection.status,
          images: approachSection.images.map((img, index) => ({
            ...img,
            display_order: index
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save approach section');
      }

      const data = await response.json();
      setApproachSection(prev => ({ ...prev, id: data.section.id }));
      success('Approach section saved successfully!');
      
    } catch (err) {
      console.error('Error saving approach section:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save approach section';
      setError(errorMessage);
      error('Save Failed', errorMessage);
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
              <h1 className="text-3xl font-bold text-white">Our Approach Editor</h1>
              <p className="text-white/70">Manage the approach section content and images</p>
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
              value={approachSection.status}
              onChange={(e) => setApproachSection(prev => ({ 
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Content */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {approachSection.content.title || 'Our Approach'}
                </h2>
                <p className="text-xl text-white/80 mb-6">
                  {approachSection.content.subtitle || 'How we create exceptional experiences'}
                </p>
                <p className="text-white/70 mb-8">
                  {approachSection.content.description || 'Our approach description goes here...'}
                </p>
                
                {approachSection.content.features.length > 0 && (
                  <div className="space-y-4">
                    {approachSection.content.features.map((feature, index) => (
                      <div key={index} className="border-l-2 border-white/20 pl-4">
                        <h3 className="font-semibold text-white mb-2">
                          {feature.title || `Feature ${index + 1}`}
                        </h3>
                        <p className="text-white/70">
                          {feature.description || 'Feature description...'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Images */}
              <div className="grid grid-cols-2 gap-4">
                {approachSection.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative h-32 bg-white/10 rounded-lg overflow-hidden">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `Approach image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Content Editor */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Section Content</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={approachSection.content.title}
                      onChange={(e) => setApproachSection(prev => ({
                        ...prev,
                        content: { ...prev.content, title: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter section title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={approachSection.content.subtitle}
                      onChange={(e) => setApproachSection(prev => ({
                        ...prev,
                        content: { ...prev.content, subtitle: e.target.value }
                      }))}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter subtitle"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Description
                    </label>
                    <textarea
                      value={approachSection.content.description}
                      onChange={(e) => setApproachSection(prev => ({
                        ...prev,
                        content: { ...prev.content, description: e.target.value }
                      }))}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none"
                      placeholder="Enter description"
                    />
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Features</h2>
                  <button
                    onClick={addFeature}
                    className="flex items-center px-3 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </button>
                </div>
                
                <div className="space-y-4">
                  {approachSection.content.features.map((feature, index) => (
                    <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-sm font-medium text-white/70">Feature {index + 1}</h3>
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
                          placeholder="Feature title"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-white/40 focus:outline-none text-sm"
                          placeholder="Feature description"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {approachSection.content.features.length === 0 && (
                    <div className="text-center py-6 text-white/60">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No features added yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Manager */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Approach Images</h2>
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
                {approachSection.images.map((image, index) => (
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
                          alt={image.alt_text || 'Approach image'}
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
                
                {approachSection.images.length === 0 && (
                  <div className="text-center py-8 text-white/60">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No images uploaded yet</p>
                    <p className="text-sm">Upload images to showcase your approach</p>
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

export default function ApproachEditor() {
  return <ApproachEditorContent />;
}