'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Edit, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Grid,
  FileText,
  ExternalLink
} from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { ToastProvider, useToastHelpers } from '@/components/admin/ui/Toast';

interface HomepageSection {
  id: string;
  content: any;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_publish_at?: string;
  images: Array<{
    id: string;
    image_url: string;
    alt_text: string;
    display_order: number;
  }>;
  collection_items: Array<{
    id: string;
    product_id: string;
    display_order: number;
    products: {
      id: string;
      name: string;
      price: number;
      images: string[];
    };
  }>;
  created_at: string;
  updated_at: string;
}

interface HomepageSections {
  hero?: HomepageSection;
  new_this_week?: HomepageSection;
  xiv_collections?: HomepageSection;
  approach?: HomepageSection;
}

function HomepageManagementContent() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [sections, setSections] = useState<HomepageSections>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastHelpers();

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/admin/login');
    }
  }, [user, isAdmin, authLoading, router]);

  // Fetch homepage sections
  useEffect(() => {
    const fetchSections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/homepage/sections');
        
        if (!response.ok) {
          throw new Error('Failed to fetch homepage sections');
        }

        const data = await response.json();
        setSections(data.sections || {});
        success('Homepage sections loaded successfully');
      } catch (err) {
        console.error('Error fetching homepage sections:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load homepage sections';
        setError(errorMessage);
        showError('Loading Failed', errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchSections();
    }
  }, [user, isAdmin]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'draft':
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Published';
      case 'scheduled':
        return 'Scheduled';
      case 'draft':
      default:
        return 'Draft';
    }
  };

  const getSectionDescription = (sectionType: string, section?: HomepageSection) => {
    switch (sectionType) {
      case 'hero':
        return `Hero section with ${section?.images?.length || 0} images and navigation categories`;
      case 'new_this_week':
        return `Featured collection with ${section?.collection_items?.length || 0} products`;
      case 'xiv_collections':
        return `XIV Collections with ${section?.collection_items?.length || 0} products`;
      case 'approach':
        return `Approach section with ${section?.images?.length || 0} images and content`;
      default:
        return 'Homepage section';
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return <ImageIcon className="w-6 h-6" />;
      case 'new_this_week':
      case 'xiv_collections':
        return <Grid className="w-6 h-6" />;
      case 'approach':
        return <FileText className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const formatSectionTitle = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return 'Hero Section';
      case 'new_this_week':
        return 'New This Week';
      case 'xiv_collections':
        return 'XIV Collections';
      case 'approach':
        return 'Our Approach';
      default:
        return sectionType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getEditPath = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return '/admin/homepage/hero';
      case 'new_this_week':
      case 'xiv_collections':
        return `/admin/homepage/collections?type=${sectionType}`;
      case 'approach':
        return '/admin/homepage/approach';
      default:
        return '/admin/homepage';
    }
  };

  if (authLoading || isLoading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/10 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white/10 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Homepage</h2>
            <p className="text-white/70 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const sectionTypes = ['hero', 'new_this_week', 'xiv_collections', 'approach'];

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Homepage Management</h1>
            <p className="text-white/70">Manage all homepage content and sections</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              target="_blank"
              className="flex items-center px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview Live Site
            </Link>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sectionTypes.map((sectionType) => {
            const section = sections[sectionType as keyof HomepageSections];
            const lastUpdated = section?.updated_at 
              ? new Date(section.updated_at).toLocaleDateString()
              : 'Never';

            return (
              <motion.div
                key={sectionType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: sectionTypes.indexOf(sectionType) * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/10 rounded-lg">
                      {getSectionIcon(sectionType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {formatSectionTitle(sectionType)}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(section?.status || 'draft')}
                        <span className="text-sm text-white/70">
                          {getStatusText(section?.status || 'draft')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-white/60 mb-4">
                  {getSectionDescription(sectionType, section)}
                </p>

                <div className="text-xs text-white/50 mb-4">
                  Last updated: {lastUpdated}
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    href={getEditPath(sectionType)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-white text-black rounded-lg hover:bg-white/90 transition-colors text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                  <button className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Published Sections</h3>
            <p className="text-3xl font-bold text-green-400">
              {Object.values(sections).filter(s => s?.status === 'published').length}
            </p>
            <p className="text-sm text-white/60 mt-1">out of {sectionTypes.length} sections</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Total Images</h3>
            <p className="text-3xl font-bold text-blue-400">
              {Object.values(sections).reduce((acc, section) => 
                acc + (section?.images?.length || 0), 0
              )}
            </p>
            <p className="text-sm text-white/60 mt-1">across all sections</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Featured Products</h3>
            <p className="text-3xl font-bold text-purple-400">
              {Object.values(sections).reduce((acc, section) => 
                acc + (section?.collection_items?.length || 0), 0
              )}
            </p>
            <p className="text-sm text-white/60 mt-1">in collections</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

// Wrap with ToastProvider
export default function HomepageManagement() {
  return (
    <ToastProvider>
      <HomepageManagementContent />
    </ToastProvider>
  );
}