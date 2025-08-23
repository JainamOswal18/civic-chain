import { aptosClient } from "@/utils/aptosClient";
import { CIVIC_CONTRACT_ADDRESS } from "@/constants";

export interface WardInfo {
  ward: number;
  latitude: string;
  longitude: string;
  is_active: boolean;
}

export class WardService {
  /**
   * Fetch all registered wards from the contract
   */
  static async getAllWards(): Promise<WardInfo[]> {
    try {
      const result = await aptosClient().view({
        payload: {
          function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::get_all_wards`,
          typeArguments: [],
          functionArguments: [],
        },
      });

      // The result should be an array of ward objects
      return result[0] as WardInfo[];
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  }

  /**
   * Find the nearest ward to given coordinates using Euclidean distance
   */
  static findNearestWard(
    userLat: number,
    userLon: number,
    wards: WardInfo[]
  ): number | null {
    if (!wards.length) return null;

    const nearest = wards
      .filter(ward => ward.is_active)
      .reduce(
        (best, ward) => {
          const wardLat = parseFloat(ward.latitude);
          const wardLon = parseFloat(ward.longitude);
          
          const distance = Math.sqrt(
            Math.pow(userLat - wardLat, 2) + Math.pow(userLon - wardLon, 2)
          );
          
          return distance < best.distance
            ? { ward: ward.ward, distance }
            : best;
        },
        { ward: null as number | null, distance: Infinity }
      );

    return nearest.ward;
  }

  /**
   * Get user's current location using browser geolocation API
   */
  static getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      console.log("WardService.getCurrentLocation called");
      
      if (!navigator.geolocation) {
        console.error("Geolocation not supported");
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      console.log("Requesting geolocation...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Geolocation success:", position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          let errorMessage = "Failed to get location";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timeout";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
      );
    });
  }

  /**
   * Get ward info by ward number
   */
  static async getWardInfo(wardNumber: number): Promise<WardInfo | null> {
    const wards = await this.getAllWards();
    return wards.find(ward => ward.ward === wardNumber) || null;
  }
}
