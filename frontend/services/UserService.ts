import { aptosClient } from "@/utils/aptosClient";
import { CIVIC_CONTRACT_ADDRESS } from "@/constants";

export interface WardCouncillor {
  ward: number;
  is_active: boolean;
}

export class UserService {
  /**
   * Check if a user is a registered ward councillor
   */
  static async isCouncillor(address: string): Promise<boolean> {
    try {
      console.log("Checking councillor status for address:", address);
      console.log("Contract address:", CIVIC_CONTRACT_ADDRESS);
      console.log("Resource type:", `${CIVIC_CONTRACT_ADDRESS}::civic_issues::WardCouncillor`);
      
      // Normalize address format (ensure it starts with 0x and is lowercase)
      const normalizedAddress = address.toLowerCase().startsWith('0x') ? address.toLowerCase() : `0x${address.toLowerCase()}`;
      console.log("Normalized address:", normalizedAddress);
      
      const resource = await aptosClient().getAccountResource({
        accountAddress: normalizedAddress,
        resourceType: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::WardCouncillor`,
      });
      
      console.log("Councillor resource found:", resource);
      console.log("Resource.data:", resource.data);
      console.log("Full resource structure:", JSON.stringify(resource, null, 2));
      
      // The resource structure might be different than expected
      // Try both resource.data and resource directly
      const councillorData = (resource.data || resource) as WardCouncillor;
      console.log("Councillor data after parsing:", councillorData);
      
      const isActive = councillorData?.is_active;
      
      console.log("Is councillor active:", isActive);
      return Boolean(isActive);
    } catch (error) {
      console.error("Error checking councillor status:", error);
      console.error("Error details:", error);
      // Resource not found means user is not a councillor
      return false;
    }
  }

  /**
   * Get councillor information for a user
   */
  static async getCouncillorInfo(address: string): Promise<WardCouncillor | null> {
    try {
      console.log("Getting councillor info for address:", address);
      
      // Normalize address format (ensure it starts with 0x and is lowercase)
      const normalizedAddress = address.toLowerCase().startsWith('0x') ? address.toLowerCase() : `0x${address.toLowerCase()}`;
      console.log("Normalized address for councillor info:", normalizedAddress);
      
      const resource = await aptosClient().getAccountResource({
        accountAddress: normalizedAddress,
        resourceType: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::WardCouncillor`,
      });

      console.log("Councillor info resource:", resource);
      console.log("Resource.data for info:", resource.data);
      
      // The resource structure might be different than expected
      // Try both resource.data and resource directly
      const councillorData = (resource.data || resource) as WardCouncillor;
      console.log("Parsed councillor data:", councillorData);
      
      return councillorData;
    } catch (error) {
      console.error("Error fetching councillor info:", error);
      console.error("Error details:", error);
      return null;
    }
  }

  /**
   * Register as a ward councillor
   */
  static registerCouncillor(ward: number) {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::register_councillor`,
        functionArguments: [ward],
        typeArguments: [],
      },
    };
  }

  /**
   * Initialize the civic registry (admin only)
   */
  static initializeRegistry() {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::initialize_registry`,
        functionArguments: [],
        typeArguments: [],
      },
    };
  }

  /**
   * Initialize ward registry (admin only)
   */
  static initializeWardRegistry() {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::initialize_ward_registry`,
        functionArguments: [],
        typeArguments: [],
      },
    };
  }

  /**
   * Register a ward with coordinates (admin only)
   */
  static registerWard(ward: number, latitude: string, longitude: string) {
    return {
      data: {
        function: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::register_ward`,
        functionArguments: [ward, latitude, longitude],
        typeArguments: [],
      },
    };
  }
}
