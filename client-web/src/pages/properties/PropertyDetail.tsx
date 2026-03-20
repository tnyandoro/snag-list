// client-web/src/pages/properties/PropertyDetail.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertyService, Property, Building, Floor, Room } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  ClipboardCheck,
  Edit,
  Layers,
  Home,
  DoorOpen,
  Loader2,
  AlertCircle,
  Plus,
} from 'lucide-react';

// ============================================================================
// COMPONENT
// ============================================================================

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [expandedBuilding, setExpandedBuilding] = useState<string | null>(null);
  const [expandedFloor, setExpandedFloor] = useState<string | null>(null);

  // Fetch property details
  const { data: property, isLoading, error, refetch } = useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getById(id!).then((res) => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  // Fetch property structure (buildings, floors, rooms, items)
  const { data: structure, isLoading: isLoadingStructure } = useQuery({
    queryKey: ['property-structure', id],
    queryFn: () => propertyService.getStructure(id!).then((res) => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading || isLoadingStructure) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error || !property) {
    return (
      <div className="p-8 min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <CardTitle className="text-red-700">Property Not Found</CardTitle>
            <CardDescription>
              We couldn't find the property you're looking for.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/properties')}>
              Back to Properties
            </Button>
            <Button onClick={() => refetch()}>Retry</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      apartment: 'bg-blue-100 text-blue-800 border-blue-300',
      townhouse: 'bg-green-100 text-green-800 border-green-300',
      lodge: 'bg-purple-100 text-purple-800 border-purple-300',
      house: 'bg-orange-100 text-orange-800 border-orange-300',
      structural: 'bg-gray-100 text-gray-800',
      electrical: 'bg-yellow-100 text-yellow-800',
      plumbing: 'bg-blue-100 text-blue-800',
      appliance: 'bg-green-100 text-green-800',
      exterior: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  // ============================================================================
  // MAIN CONTENT
  // ============================================================================

  const buildings = structure?.buildings || [];
  const totalFloors = buildings.reduce((acc, b) => acc + (b.floors?.length || 0), 0);
  const totalRooms = buildings.reduce(
    (acc, b) => acc + (b.floors?.reduce((acc2, f) => acc2 + (f.rooms?.length || 0), 0) || 0),
    0
  );

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto">
        
        {/* ─────────────────────────────────────────────────────────────── */}
        {/* HEADER */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/properties')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {property.name}
              </h1>
              <Badge className={getCategoryColor(property.property_category)}>
                {property.property_category}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {property.address}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Added {new Date(property.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {hasRole(['admin', 'inspector']) && (
              <Button
                className="bg-gradient-to-r from-green-500 to-emerald-600"
                onClick={() => navigate(`/properties/${id}/inspections/new`)}
              >
                <ClipboardCheck className="h-4 w-4 mr-2" />
                Start Inspection
              </Button>
            )}
            {hasRole(['admin', 'owner']) && (
              <Button
                variant="outline"
                onClick={() => navigate(`/properties/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PROPERTY INFO CARDS */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Buildings
              </CardTitle>
              <Building2 className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{buildings.length}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total structures on property
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Floors
              </CardTitle>
              <Layers className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalFloors}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Across all buildings
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Rooms
              </CardTitle>
              <Home className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalRooms}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Total inspectable spaces
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* PROPERTY STRUCTURE HIERARCHY */}
        {/* ─────────────────────────────────────────────────────────────── */}
        <Card className="border-0 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Structure
            </CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Building → Floor → Room → Item hierarchy for inspections
            </p>
          </CardHeader>
          <CardContent>
            {buildings.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Structure Defined</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Add buildings, floors, and rooms to enable detailed inspections.
                </p>
                {hasRole(['admin', 'owner']) && (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={() => navigate(`/properties/${id}/structure`)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Structure
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {buildings.map((building: Building) => (
                  <div key={building.id} className="border rounded-lg overflow-hidden">
                    {/* Building Header */}
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 cursor-pointer flex items-center justify-between"
                      onClick={() => setExpandedBuilding(expandedBuilding === building.id ? null : building.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="h-5 w-5" />
                        <div>
                          <h3 className="font-semibold">{building.name}</h3>
                          <p className="text-xs text-blue-100">
                            {building.floors?.length || 0} Floor
                            {(building.floors?.length || 0) !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-2xl">
                        {expandedBuilding === building.id ? '▼' : '▶'}
                      </span>
                    </div>

                    {/* Building Content */}
                    {expandedBuilding === building.id && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800/50">
                        {building.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {building.description}
                          </p>
                        )}

                        {/* Floors */}
                        <div className="space-y-4">
                          {building.floors?.map((floor: Floor) => (
                            <div key={floor.id} className="border rounded-lg overflow-hidden">
                              {/* Floor Header */}
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white p-3 cursor-pointer flex items-center justify-between"
                                onClick={() => setExpandedFloor(expandedFloor === floor.id ? null : floor.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <Layers className="h-4 w-4" />
                                  <div>
                                    <h4 className="font-medium text-sm">
                                      {floor.name || `Floor ${floor.floor_number}`}
                                    </h4>
                                    <p className="text-xs text-green-100">
                                      {floor.rooms?.length || 0} Room
                                      {(floor.rooms?.length || 0) !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-lg">
                                  {expandedFloor === floor.id ? '▼' : '▶'}
                                </span>
                              </div>

                              {/* Floor Content */}
                              {expandedFloor === floor.id && (
                                <div className="p-3 bg-white dark:bg-gray-900">
                                  {/* Rooms Grid */}
                                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {floor.rooms?.map((room: Room) => (
                                      <div
                                        key={room.id}
                                        className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <DoorOpen className="h-4 w-4 text-purple-600" />
                                          <h5 className="font-medium text-sm">
                                            {room.name}
                                          </h5>
                                        </div>
                                        {room.room_type && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {room.room_type}
                                          </Badge>
                                        )}
                                        {room.items && room.items.length > 0 && (
                                          <div className="mt-2 space-y-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                              {room.items.length} Item
                                              {room.items.length !== 1 ? 's' : ''}:
                                            </p>
                                            <div className="flex flex-wrap gap-1">
                                              {room.items.slice(0, 5).map((item) => (
                                                <Badge
                                                  key={item.id}
                                                  className={`text-xs ${getCategoryColor(item.category)}`}
                                                >
                                                  {item.name}
                                                </Badge>
                                              ))}
                                              {room.items.length > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                  +{room.items.length - 5} more
                                                </Badge>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─────────────────────────────────────────────────────────────── */}
        {/* DESCRIPTION */}
        {/* ─────────────────────────────────────────────────────────────── */}
        {property.description && (
          <Card className="border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>About This Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">
                {property.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PropertyDetail;