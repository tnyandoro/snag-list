// client-web/src/pages/properties/PropertyForm.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { propertyService, Property, PropertyCategory } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  Loader2,
  MapPin,
  Save,
  Upload,
  X,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface FormData {
  name: string;
  address: string;
  property_category: PropertyCategory;
  description?: string;
  gps_lat?: number;
  gps_lng?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    address: '',
    property_category: 'apartment',
    description: '',
    gps_lat: undefined,
    gps_lng: undefined,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch existing property for edit mode
  const { data: existingProperty, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id!).then((res) => res.data),
    enabled: isEditMode,
    staleTime: 1000 * 60 * 5,
  });

  // Populate form when editing
  useEffect(() => {
    if (existingProperty) {
      setFormData({
        name: existingProperty.name || '',
        address: existingProperty.address || '',
        property_category: existingProperty.property_category || 'apartment',
        description: existingProperty.description || '',
        gps_lat: existingProperty.gps_lat || undefined,
        gps_lng: existingProperty.gps_lng || undefined,
      });
    }
  }, [existingProperty]);

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      if (isEditMode) {
        return propertyService.update(id!, data).then((res) => res.data);
      } else {
        return propertyService.create(data).then((res) => res.data);
      }
    },
    onSuccess: (property) => {
      toast({
        title: isEditMode ? '✅ Property updated' : '✅ Property created',
        description: isEditMode
          ? 'The property has been updated successfully'
          : 'The property has been created successfully',
      });
      navigate(`/properties/${property.id}`);
    },
    onError: () => {
      toast({
        title: `❌ ${isEditMode ? 'Update' : 'Creation'} failed`,
        description: `Could not ${isEditMode ? 'update' : 'create'} the property`,
        variant: 'destructive',
      });
    },
  });

  // Image upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      propertyService.uploadImage(id!, formData).then((res) => res.data.image),
    onSuccess: () => {
      toast({
        title: '✅ Image uploaded',
        description: 'Property image has been uploaded successfully',
      });
    },
  });

  // Validate form
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Property name must be at least 3 characters';
    }

    if (!formData.address || formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters';
    }

    if (!formData.property_category) {
      newErrors.property_category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: '❌ Validation error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    mutation.mutate(formData);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: '❌ Invalid file type',
        description: 'Please upload an image file (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '❌ File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoadingProperty) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading property...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // MAIN FORM
  // ============================================================================

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(isEditMode ? `/properties/${id}` : '/properties')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isEditMode ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {isEditMode ? 'Update property information' : 'Create a new property in your portfolio'}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-2xl">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
              <CardDescription>
                Fill in the information below to {isEditMode ? 'update' : 'create'} your property
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              
              {/* Property Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Property Name *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Riverside Apartments"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`h-12 border-2 ${errors.name ? 'border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Property Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold">
                  Property Category *
                </Label>
                <Select
                  value={formData.property_category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, property_category: value as PropertyCategory })
                  }
                >
                  <SelectTrigger className={`h-12 ${errors.property_category ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">🏢 Apartment</SelectItem>
                    <SelectItem value="house">🏠 House</SelectItem>
                    <SelectItem value="townhouse">🏘️ Townhouse</SelectItem>
                    <SelectItem value="lodge">🏕️ Lodge</SelectItem>
                  </SelectContent>
                </Select>
                {errors.property_category && (
                  <p className="text-sm text-red-600">{errors.property_category}</p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Full Address *
                </Label>
                <Textarea
                  id="address"
                  placeholder="Street address, city, state, zip code"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`min-h-[100px] border-2 ${errors.address ? 'border-red-500' : 'focus:border-blue-500'}`}
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the property features, amenities, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px] border-2 focus:border-blue-500"
                />
              </div>

              {/* GPS Coordinates (Optional) */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gps_lat" className="text-sm font-semibold">
                    Latitude (Optional)
                  </Label>
                  <Input
                    id="gps_lat"
                    type="number"
                    step="0.000001"
                    placeholder="-17.825200"
                    value={formData.gps_lat || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, gps_lat: parseFloat(e.target.value) || undefined })
                    }
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gps_lng" className="text-sm font-semibold">
                    Longitude (Optional)
                  </Label>
                  <Input
                    id="gps_lng"
                    type="number"
                    step="0.000001"
                    placeholder="31.033500"
                    value={formData.gps_lng || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, gps_lng: parseFloat(e.target.value) || undefined })
                    }
                    className="h-12 border-2 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Image Upload (Edit mode only) */}
              {isEditMode && (
                <div className="space-y-2">
                  <Label className="text-sm font-semibold flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Property Image (Optional)
                  </Label>
                  
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border-2 border-dashed">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drag and drop an image, or click to browse
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label htmlFor="image-upload" asChild>
                        <Button type="button" variant="outline">
                          Choose Image
                        </Button>
                      </Label>
                      <p className="text-xs text-gray-500 mt-2">
                        Max 5MB. JPG, PNG, or WebP
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(isEditMode ? `/properties/${id}` : '/properties')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || uploadMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    {isEditMode ? 'Update Property' : 'Create Property'}
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default PropertyForm;