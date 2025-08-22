import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { IssueService } from "@/services/IssueService";
import { useUserLocation, useNearestWard } from "@/hooks/useWards";
import { useIssueActions } from "@/hooks/useIssues";
import { MapPin, Loader2 } from "lucide-react";

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

export function IssueForm() {
  const { signAndSubmitTransaction } = useWallet();
  const { location, isLoading: locationLoading, getCurrentLocation } = useUserLocation();
  const { nearestWard } = useNearestWard();
  const { invalidateAllIssues } = useIssueActions();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    customCategory: "",
  });

  const handleLocationClick = () => {
    getCurrentLocation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!location) {
      toast({
        variant: "destructive",
        title: "Location Required",
        description: "Please enable location access to report an issue.",
      });
      return;
    }

    if (!nearestWard) {
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
      const transaction = IssueService.reportIssue(
        nearestWard,
        category.trim(),
        formData.description.trim(),
        location.latitude.toString(),
        location.longitude.toString()
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

      // Invalidate queries to refresh issue lists
      invalidateAllIssues();
      
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Report a Civic Issue
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Location Section */}
          <div className="space-y-2">
            <Label>Location</Label>
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

          <Button
            type="submit"
            disabled={isSubmitting || !location || !nearestWard}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Reporting Issue...
              </>
            ) : (
              "Report Issue"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
