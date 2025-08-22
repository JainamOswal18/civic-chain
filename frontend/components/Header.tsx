import { WalletSelector } from "./WalletSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { Building, Users } from "lucide-react";

export function Header() {
  const { isCouncillor, councillorInfo } = useUserRole();

  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <div className="flex items-center gap-3">
        <h1 className="display text-2xl font-bold">CivicChain</h1>
        {isCouncillor && councillorInfo && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Building className="h-3 w-3" />
            Ward {councillorInfo.ward} Councillor
          </Badge>
        )}
        {!isCouncillor && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Citizen
          </Badge>
        )}
      </div>

      <div className="flex gap-2 items-center flex-wrap">
        <WalletSelector />
      </div>
    </div>
  );
}
