import { WalletSelector } from "./WalletSelector";
import { useUserRole } from "@/hooks/useUserRole";
import { Badge } from "@/components/ui/badge";
import { Building, Users, Shield } from "lucide-react";

export function Header() {
  const { isCouncillor, councillorInfo } = useUserRole();

  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CivicChain
            </h1>
          </div>
          
          {isCouncillor && councillorInfo && (
            <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
              <Building className="h-3 w-3" />
              Ward {councillorInfo.ward} Councillor
            </Badge>
          )}
          {!isCouncillor && (
            <Badge variant="outline" className="flex items-center gap-1 bg-gray-50 text-gray-700 border-gray-200">
              <Users className="h-3 w-3" />
              Citizen
            </Badge>
          )}
        </div>

        <div className="flex gap-2 items-center">
          <WalletSelector />
        </div>
      </div>
    </header>
  );
}
