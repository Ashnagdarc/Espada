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
import { useToastActions } from '@/hooks/useToast';

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
  const { success, error: showError } = useToastActions();

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
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-amber-500" />;
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
        return `${section?.images?.length || 0} images • Navigation categories`;
      case 'new_this_week':
        return `${section?.collection_items?.length || 0} featured products`;
      case 'xiv_collections':
        return `${section?.collection_items?.length || 0} collection items`;
      case 'approach':
        return `${section?.images?.length || 0} images • Content sections`;
      default:
        return 'Homepage section';
    }
  };

  const getSectionIcon = (sectionType: string) => {
    switch (sectionType) {
      case 'hero':
        return <ImageIcon className="w-5 h-5" />;
      case 'new_this_week':
      case 'xiv_collections':
        return <Grid className="w-5 h-5" />;
      case 'approach':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
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
        <div className="p-8 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-3">
              <div className="h-8 bg-white/10 rounded-lg w-80"></div>
              <div className="h-5 bg-white/5 rounded w-96"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-white/5 rounded-xl"></div>
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
        <div className="p-8 max-w-7xl mx-auto">
          <div className="bg-red-50/10 border border-red-200/20 rounded-xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Error Loading Homepage</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
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
      <div className="p-8 max-w-7xl mx-auto" style={{ fontFamily: 'Gilroy, -apple-system, BlinkMacSystemFont, sans-serif' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white tracking-tight">Homepage Management</h1>
            <p className="text-white/60 text-lg">Manage all homepage content and sections</p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-xl transition-all duration-200 font-medium backdrop-blur-sm border border-white/10"
          >
            <ExternalLink className="w-4 h-4" />
            Preview Live Site
          </Link>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {sectionTypes.map((sectionType, index) => {
            const section = sections[sectionType as keyof HomepageSections];
            const lastUpdated = section?.updated_at 
              ? new Date(section.updated_at).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })
              : 'Never';

            return (
              <motion.div
                key={sectionType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-xl p-6 transition-all duration-300 backdrop-blur-sm"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-white/10 rounded-lg group-hover:bg-white/15 transition-colors">
                      {getSectionIcon(sectionType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-base">
                        {formatSectionTitle(sectionType)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(section?.status || 'draft')}
                        <span className="text-sm text-white/60">
                          {getStatusText(section?.status || 'draft')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-white/50 mb-4 leading-relaxed">
                  {getSectionDescription(sectionType, section)}
                </p>

                {/* Last Updated */}
                <div className="text-xs text-white/40 mb-6">
                  Updated {lastUpdated}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={getEditPath(sectionType)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white hover:bg-white/90 text-black rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button className="p-2.5 bg-white/10 hover:bg-white/15 text-white rounded-lg transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-base font-semibold text-white mb-3">Published Sections</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-green-400">
                {Object.values(sections).filter(s => s?.status === 'published').length}
              </p>
              <p className="text-sm text-white/50">of {sectionTypes.length}</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-base font-semibold text-white mb-3">Total Images</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-blue-400">
                {Object.values(sections).reduce((acc, section) => 
                  acc + (section?.images?.length || 0), 0
                )}
              </p>
              <p className="text-sm text-white/50">across sections</p>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6 backdrop-blur-sm"
          >
            <h3 className="text-base font-semibold text-white mb-3">Featured Products</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-purple-400">
                {Object.values(sections).reduce((acc, section) => 
                  acc + (section?.collection_items?.length || 0), 0
                )}
              </p>
              <p className="text-sm text-white/50">in collections</p>
            </div>
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function HomepageManagement() {
  return <HomepageManagementContent />;
}