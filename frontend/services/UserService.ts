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
      await aptosClient().getAccountResource({
        accountAddress: address,
        resourceType: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::WardCouncillor`,
      });
      return true;
    } catch (error) {
      // Resource not found means user is not a councillor
      return false;
    }
  }

  /**
   * Get councillor information for a user
   */
  static async getCouncillorInfo(address: string): Promise<WardCouncillor | null> {
    try {
      const resource = await aptosClient().getAccountResource({
        accountAddress: address,
        resourceType: `${CIVIC_CONTRACT_ADDRESS}::civic_issues::WardCouncillor`,
      });

      return resource.data as WardCouncillor;
    } catch (error) {
      console.error("Error fetching councillor info:", error);
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
