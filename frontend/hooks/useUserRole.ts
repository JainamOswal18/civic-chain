import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { UserService, type WardCouncillor } from "@/services/UserService";

export interface UserRole {
  isCouncillor: boolean;
  councillorInfo: WardCouncillor | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useUserRole(): UserRole {
  const { account, connected } = useWallet();
  const [isCouncillor, setIsCouncillor] = useState(false);
  const [councillorInfo, setCouncillorInfo] = useState<WardCouncillor | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserRole = async () => {
    if (!account?.address || !connected) {
      setIsCouncillor(false);
      setCouncillorInfo(null);
      return;
    }

    setIsLoading(true);
    try {
      const address = account.address.toString();
      const [isCouncillorResult, councillorInfoResult] = await Promise.all([
        UserService.isCouncillor(address),
        UserService.getCouncillorInfo(address),
      ]);

      setIsCouncillor(isCouncillorResult);
      setCouncillorInfo(councillorInfoResult);
    } catch (error) {
      console.error("Error fetching user role:", error);
      setIsCouncillor(false);
      setCouncillorInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRole();
  }, [account?.address, connected]);

  return {
    isCouncillor,
    councillorInfo,
    isLoading,
    refetch: fetchUserRole,
  };
}
