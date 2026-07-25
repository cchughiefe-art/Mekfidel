'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Search, Smartphone, Filter, ChevronDown, CheckCircle, XCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';

export default function PhoneScreenCompatibilityPage() {
  const supabase = createClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [result, setResult] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const { data: brands } = useQuery({
    queryKey: ['compatibility-brands'],
    queryFn: async () => {
      const { data } = await supabase
        .from('screen_compatibility')
        .select('brand')
        .eq('is_active', true)
        .order('brand');
      
      // Deduplicate brands
      const uniqueBrands = [...new Set((data || []).map(d => d.brand))];
      return uniqueBrands as string[];
    },
  });

  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['compatibility-search', searchQuery, selectedBrand],
    queryFn: async () => {
      let query = supabase
        .from('screen_compatibility')
        .select('*')
        .eq('is_active', true);

      if (searchQuery) {
        query = query.or(
          `model.ilike.%${searchQuery}%,series.ilike.%${searchQuery}%,screen_code.ilike.%${searchQuery}%,manufacturer_model.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`
        );
      }
      if (selectedBrand) {
        query = query.eq('brand', selectedBrand);
      }

      query = query.order('brand').order('model').limit(50);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: hasSearched || !!searchQuery || !!selectedBrand,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    if (!searchQuery && !selectedBrand) {
      setHasSearched(true);
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-custom py-8 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center mx-auto mb-6">
              <Smartphone className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Phone Screen Compatibility
            </h1>
            <p className="text-lg text-gray-500 mb-8">
              Check if a phone screen or part is compatible with your device model.
            </p>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by phone model, brand, or screen code..."
                  className="input-field pl-12"
                />
              </div>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="input-field w-auto min-w-[150px]"
              >
                <option value="">All Brands</option>
                {brands?.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <Button variant="primary" type="submit">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-custom py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : !results || results.length === 0 ? (
          <EmptyState
            icon={<Smartphone className="w-10 h-10" />}
            title="No compatibility data found"
            description="Search for a phone model or brand to check screen compatibility."
          />
        ) : (
          <div className="space-y-6">
            <p className="text-sm text-gray-500">{results.length} result{results.length !== 1 ? 's' : ''} found</p>
            <div className="grid gap-4">
              {results.map((item: any) => (
                <div key={item.id} className="card p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Brand</p>
                      <p className="font-semibold text-gray-900">{item.brand}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Model</p>
                      <p className="font-semibold text-gray-900">{item.model}</p>
                    </div>
                    {item.series && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Series</p>
                        <p className="text-gray-700">{item.series}</p>
                      </div>
                    )}
                    {item.screen_code && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Screen Code</p>
                        <p className="text-gray-700 font-mono">{item.screen_code}</p>
                      </div>
                    )}
                    {item.manufacturer_model && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Manufacturer Model</p>
                        <p className="text-gray-700 font-mono">{item.manufacturer_model}</p>
                      </div>
                    )}
                  </div>
                  {item.compatible_with && item.compatible_with.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Compatible With</p>
                      <div className="flex flex-wrap gap-2">
                        {item.compatible_with.map((comp: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {item.notes && (
                    <p className="mt-3 text-sm text-gray-500 italic">{item.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

