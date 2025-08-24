import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { IssueService } from "@/services/IssueService";
import { ImageService } from "@/services/ImageService";
import { useUserLocation, useNearestWard, useWards } from "@/hooks/useWards";
import { useIssueActions } from "@/hooks/useIssues";
import { WardService } from "@/services/WardService";
import { MapPin, Loader2, Upload, X, Image as ImageIcon, Navigation, Edit3 } from "lucide-react";

const ISSUE_CATEGORIES = [
  "Road Maintenance",
  "Street Lighting",
  "Garbage Collection",
  "Water Supply",
  "Drainage",
  "Public Safety",
  "Parks & Recreation",
  "Traffic Management",
  "Other"
];

interface IssueFormProps {
  onSuccess?: () => void;
}

export function IssueForm({ onSuccess }: IssueFormProps = {}) {
  const { signAndSubmitTransaction } = useWallet();
  const { location, isLoading: locationLoading, getCurrentLocation } = useUserLocation();
  const { nearestWard } = useNearestWard();
  const { data: wards = [], isLoading: wardsLoading } = useWards();
  const { invalidateAllIssues } = useIssueActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [manualLocation, setManualLocation] = useState({
    latitude: "",
    longitude: "",
  });
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    customCategory: "",
  });

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const validateCoordinates = (lat: string, lng: string): boolean => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    
    return !isNaN(latitude) && 
           !isNaN(longitude) && 
           latitude >= -90 && 
           latitude <= 90 && 
           longitude >= -180 && 
           longitude <= 180;
  };

  const calculateWardFromCoordinates = (lat: number, lng: number): number | null => {
    // Use the actual ward data from the contract to find the nearest ward
    // This makes it dynamic and scalable for any number of wards
    if (wards.length === 0) {
      console.warn("No wards available for calculation");
      return null;
    }
    
    return WardService.findNearestWard(lat, lng, wards);
  };

  const getCurrentLocationData = () => {
    if (useManualLocation) {
      if (!validateCoordinates(manualLocation.latitude, manualLocation.longitude)) {
        return null;
      }
      const lat = parseFloat(manualLocation.latitude);
      const lng = parseFloat(manualLocation.longitude);
      return {
        latitude: lat,
        longitude: lng,
        ward: calculateWardFromCoordinates(lat, lng)
      };
    }
    return location ? {
      latitude: location.latitude,
      longitude: location.longitude,
      ward: nearestWard
    } : null;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    const validation = ImageService.validateImageFiles(files);
    
    if (!validation.isValid) {
      toast({
        variant: "destructive",
        title: "Invalid Images",
        description: validation.errors.join(", "),
      });
      return;
    }

    setSelectedImages(files);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const locationData = getCurrentLocationData();
    
    if (!locationData) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: useManualLocation 
          ? "Please enter valid latitude and longitude coordinates." 
          : "Please enable location access to report an issue.",
      });
      return;
    }

    if (!locationData.ward) {
      toast({
        variant: "destructive",
        title: "Ward Not Found",
        description: "Could not determine your ward. Please try again.",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Description Required",
        description: "Please provide a description of the issue.",
      });
      return;
    }

    const category = formData.category === "Other" ? formData.customCategory : formData.category;
    if (!category.trim()) {
      toast({
        variant: "destructive",
        title: "Category Required",
        description: "Please select or enter a category for the issue.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      let imageCid = "";
      let imageFilenames: string[] = [];

      // Upload images if any are selected
      if (selectedImages.length > 0) {
        setIsUploadingImages(true);
        try {
          const uploadResult = await ImageService.uploadImagesWithJWT(selectedImages);
          imageCid = uploadResult.cid;
          imageFilenames = uploadResult.filenames;
          
          toast({
            title: "Images Uploaded",
            description: `${selectedImages.length} images uploaded to IPFS successfully.`,
          });
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast({
            variant: "destructive",
            title: "Image Upload Failed",
            description: "Failed to upload images. Proceeding without images.",
          });
        } finally {
          setIsUploadingImages(false);
        }
      }

      const transaction = IssueService.reportIssue(
        locationData.ward,
        category.trim(),
        formData.description.trim(),
        locationData.latitude.toString(),
        locationData.longitude.toString(),
        imageCid,
        imageFilenames
      );

      const result = await signAndSubmitTransaction(transaction);
      
      toast({
        title: "Issue Reported Successfully",
        description: `Your issue has been submitted for verification. Transaction: ${result.hash}`,
      });

      // Reset form
      setFormData({
        category: "",
        description: "",
        customCategory: "",
      });
      setSelectedImages([]);
      setManualLocation({
        latitude: "",
        longitude: "",
      });

      // Invalidate queries to refresh issue lists
      invalidateAllIssues();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Error reporting issue:", error);
      toast({
        variant: "destructive",
        title: "Failed to Report Issue",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8">
          {/* Location Section */}
          <div className="space-y-4 p-6 bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-100/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-lg font-bold text-gray-900">Location Information</Label>
                <p className="text-sm text-gray-600 mt-1">Choose how to specify the issue location</p>
              </div>
            </div>
            
            {/* Location Method Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl border border-gray-100/50">
              <Button
                type="button"
                variant={!useManualLocation ? "default" : "outline"}
                size="sm"
                onClick={() => setUseManualLocation(false)}
                className={`flex items-center gap-2 transition-all duration-300 ${!useManualLocation ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'hover:bg-blue-50'}`}
              >
                <Navigation className="h-4 w-4" />
                GPS Location
              </Button>
              <Button
                type="button"
                variant={useManualLocation ? "default" : "outline"}
                size="sm"
                onClick={() => setUseManualLocation(true)}
                className={`flex items-center gap-2 transition-all duration-300 ${useManualLocation ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg' : 'hover:bg-purple-50'}`}
              >
                <Edit3 className="h-4 w-4" />
                Manual Entry
              </Button>
            </div>

            {/* GPS Location */}
            {!useManualLocation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLocationClick}
                    disabled={locationLoading}
                    className="flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MapPin className="h-4 w-4" />
                    )}
                    {locationLoading ? "Getting Location..." : "Get Current Location"}
                  </Button>
                  {location && (
                    <span className="text-sm text-muted-foreground">
                      Ward: {nearestWard || "Unknown"}
                    </span>
                  )}
                </div>
                {location && (
                  <p className="text-xs text-muted-foreground">
                    Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            )}

            {/* Manual Location Entry */}
            {useManualLocation && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="latitude" className="text-sm">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 18.5204"
                      value={manualLocation.latitude}
                      onChange={(e) => setManualLocation({ ...manualLocation, latitude: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="longitude" className="text-sm">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 73.8567"
                      value={manualLocation.longitude}
                      onChange={(e) => setManualLocation({ ...manualLocation, longitude: e.target.value })}
                      className="text-sm"
                    />
                  </div>
                </div>
                
                {/* Show calculated ward for manual coordinates */}
                {validateCoordinates(manualLocation.latitude, manualLocation.longitude) && (
                  (() => {
                    if (wardsLoading) {
                      return (
                        <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          <span className="text-sm text-blue-700">
                            Loading ward information...
                          </span>
                        </div>
                      );
                    }
                    
                    const calculatedWard = calculateWardFromCoordinates(
                      parseFloat(manualLocation.latitude), 
                      parseFloat(manualLocation.longitude)
                    );
                    
                    return calculatedWard ? (
                      <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-md">
                        <MapPin className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">
                          Ward: {calculatedWard}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                        <MapPin className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-700">
                          No nearby ward found for these coordinates
                        </span>
                      </div>
                    );
                  })()
                )}
                
                {/* Validation error for invalid coordinates */}
                {(manualLocation.latitude || manualLocation.longitude) && 
                 !validateCoordinates(manualLocation.latitude, manualLocation.longitude) && (
                  <p className="text-xs text-red-600">
                    Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)
                  </p>
                )}
                
                <p className="text-xs text-muted-foreground">
                  💡 Tip: You can find coordinates using Google Maps by right-clicking on a location
                </p>
              </div>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 border border-input rounded-md bg-background"
              required
            >
              <option value="">Select a category</option>
              {ISSUE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Category Input */}
          {formData.category === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customCategory">Custom Category</Label>
              <Input
                id="customCategory"
                value={formData.customCategory}
                onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                placeholder="Enter custom category"
                required
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the issue in detail..."
              className="w-full p-2 border border-input rounded-md bg-background min-h-[100px] resize-y"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="images">Images (Optional)</Label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('images')?.click()}
                  className="flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  <Upload className="h-4 w-4" />
                  Choose Images
                </Button>
                {selectedImages.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearAllImages}
                    className="text-red-600 hover:text-red-700"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              
              {selectedImages.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedImages.length} image{selectedImages.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {selectedImages.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                <ImageIcon className="inline h-3 w-3 mr-1" />
                Max 10 images, 10MB each. Supported: JPG, PNG, GIF, WebP
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || isUploadingImages || !getCurrentLocationData()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploadingImages ? "Uploading Images..." : "Reporting Issue..."}
              </>
            ) : (
              "Report Issue"
            )}
          </Button>
      </form>
    </div>
  );
}
