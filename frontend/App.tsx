import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WalletDetails } from "@/components/WalletDetails";
import { NetworkInfo } from "@/components/NetworkInfo";
import { AccountInfo } from "@/components/AccountInfo";
import { TransferAPT } from "@/components/TransferAPT";
import { MessageBoard } from "@/components/MessageBoard";
import { TopBanner } from "@/components/TopBanner";
// Civic Chain Components
import { CitizenView } from "@/components/civic/CitizenView";
import { CouncillorView } from "@/components/civic/CouncillorView";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, Loader2 } from "lucide-react";
import { useState } from "react";

function App() {
  const { connected } = useWallet();
  const { isCouncillor, isLoading: roleLoading } = useUserRole();
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  return (
    <>
      <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <div className="w-full max-w-6xl mx-auto px-4 py-6">
            {/* Role-based Main Content */}
            {roleLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading user role...</span>
              </div>
            ) : isCouncillor ? (
              <CouncillorView />
            ) : (
              <CitizenView />
            )}

            {/* Debug/Development Section */}
            <div className="mt-12 pt-8 border-t">
              <Collapsible open={showDebugInfo} onOpenChange={setShowDebugInfo}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    <Settings className="mr-2 h-4 w-4" />
                    Developer Tools & Wallet Info
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <Card>
                    <CardContent className="flex flex-col gap-10 pt-6">
                      <WalletDetails />
                      <NetworkInfo />
                      <AccountInfo />
                      <TransferAPT />
                      <MessageBoard />
                    </CardContent>
                  </Card>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        ) : (
          <CardHeader>
            <CardTitle>To get started Connect a wallet</CardTitle>
          </CardHeader>
        )}
      </div>
    </>
  );
}

export default App;
