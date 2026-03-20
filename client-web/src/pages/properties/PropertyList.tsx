// client-web/src/pages/properties/PropertyList.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyService, Property, PropertyCategory } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  MoreVertical,
  Edit,
  Eye,
  ClipboardCheck,
  Trash2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// ============================================================================
// TYPES
// ============================================================================

interface PropertyFilters {
  search?: string;
  category?: PropertyCategory | 'all';
  sort?: 'name' | 'created_at' | 'category';
  page?: number;
  limit?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, hasRole, can } = useAuth();

  // State for filters
  const [filters, setFilters] = useState<PropertyFilters>({
    search: '',
    category: 'all',
    sort: 'created_at',
    page: 1,
    limit: 10,
  });

  // Fetch properties with React Query
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['properties', filters],
    queryFn: () =>
      propertyService.getAll({
        page: filters.page,
        limit: filters.limit,
        search: filters.search,
      }).then((res) => res.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: (propertyId: string) => propertyService.delete(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: '✅ Property deleted',
        description: 'The property has been removed successfully',
      });
    },
    onError: () => {
      toast({
        title: '❌ Delete failed',
        description: 'Could not delete the property',
        variant: 'destructive',
      });
    },
  });

  // Handle search input
  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  };

  // Handle category filter
  const handleCategoryChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      category: value as PropertyCategory | 'all',
      page: 1,
    }));
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setFilters((prev) => ({ ...prev, sort: value as any }));
  };

  // Handle delete
  const handleDelete = (propertyId: string, propertyName: string) => {
    if (window.confirm(`Are you sure you want to delete "${propertyName}"?`)) {
      deleteMutation.mutate(propertyId);
    }
  };

  // Get category badge color
  const getCategoryColor = (category: PropertyCategory) => {
    const colors: Record<PropertyCategory, string> = {
      apartment: 'bg-blue-100 text-blue-800 border-blue-300',
      townhouse: 'bg-green-100 text-green-800 border-green-300',
      lodge: 'bg-purple-100 text-purple-800 border-purple-300',
      house: 'bg-orange-100 text-orange-800 border-orange-300',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-700">Failed to Load Properties</CardTitle>
            <CardDescription>
              We couldn't fetch your properties. Please try again.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================

  const properties = data?.properties || [];
  const total = data?.total || 0;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Property Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {total} {total === 1 ? 'property' : 'properties'} in your portfolio
            </p>
          </div>
          
          {/* Add Property Button - Owner/Admin only */}
          {hasRole(['admin', 'owner']) && (
            <Button
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              onClick={() => navigate('/properties/new')}
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Property
            </Button>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* FILTERS & SEARCH */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name or address..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 h-12 border-2 focus:border-blue-500"
                />
              </div>

              {/* Category Filter */}
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="townhouse">Townhouse</SelectItem>
                  <SelectItem value="lodge">Lodge</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={filters.sort} onValueChange={handleSortChange}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Newest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* EMPTY STATE */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {properties.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Properties Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start building your property portfolio by adding your first property.
              </p>
              {hasRole(['admin', 'owner']) && (
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={() => navigate('/properties/new')}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Property
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          /* ─────────────────────────────────────────────────────────────── */}
          {/* PROPERTY GRID */}
          {/* ─────────────────────────────────────────────────────────────── */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property: Property) => (
              <Card
                key={property.id}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group"
              >
                {/* Property Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                  {property.images?.[0]?.url ? (
                    <img
                      src={property.images[0].url}
                      alt={property.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Building2 className="h-16 w-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <Badge
                    className={`absolute top-3 right-3 ${getCategoryColor(property.property_category)}`}
                  >
                    {property.property_category}
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-1">
                    {property.name}
                  </h3>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{property.address}</span>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Added {new Date(property.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Structure Info */}
                  {property.buildings && property.buildings.length > 0 && (
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        🏢 {property.buildings.length} Building
                        {property.buildings.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between gap-2 pt-4 border-t">
                  {/* View Details - All roles */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>

                  {/* Role-Based Actions */}
                  {hasRole(['admin', 'owner']) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/properties/${property.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}

                  {hasRole(['admin', 'inspector']) && (
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                      onClick={() =>
                        navigate(`/properties/${property.id}/inspections/new`)
                      }
                    >
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      Inspect
                    </Button>
                  )}

                  {/* Delete - Admin/Owner only */}
                  {hasRole(['admin', 'owner']) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleDelete(property.id, property.name)
                          }
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PAGINATION */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {properties.length > 0 && (
          <div className="flex items-center justify-between mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {(filters.page! - 1) * filters.limit! + 1} to{' '}
              {Math.min(filters.page! * filters.limit!, total)} of {total}{' '}
              properties
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={filters.page! * filters.limit! >= total}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyList;