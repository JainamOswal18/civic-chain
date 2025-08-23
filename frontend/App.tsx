import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { TopBanner } from "@/components/TopBanner";
import { WalletSelector } from "@/components/WalletSelector";
// Civic Chain Components
import { CitizenView } from "@/components/civic/CitizenView";
import { CouncillorView } from "@/components/civic/CouncillorView";
import { useUserRole } from "@/hooks/useUserRole";
import { Loader2, Users, Building, Shield, Vote, Eye, CheckCircle } from "lucide-react";

function App() {
  const { connected } = useWallet();
  const { isCouncillor, isLoading: roleLoading } = useUserRole();

  return (
    <>
      <TopBanner />
      <Header />
      <div className="flex items-center justify-center flex-col">
        {connected ? (
          <div className="w-full max-w-7xl mx-auto">
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
          </div>
        ) : (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="max-w-6xl mx-auto px-4 py-16">
              {/* Hero Section */}
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
                  <Shield className="h-4 w-4" />
                  Decentralized Civic Engagement Platform
                </div>
                
                <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Transform Your
                  <span className="block text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                    Community Together
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
                  CivicChain empowers citizens and local authorities to collaborate on community issues through 
                  blockchain-powered transparency, accountability, and democratic participation.
                </p>
                
                <div className="flex justify-center">
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 max-w-md w-full">
                    <div className="text-center space-y-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Started</h3>
                        <p className="text-gray-600 text-sm mb-6">
                          Connect your wallet to join the civic engagement platform
                        </p>
                      </div>
                      <WalletSelector />
                    </div>
                  </div>
                </div>
              </div>

              {/* User Types Section */}
              <div className="mb-16">
                <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
                  Who Can Participate?
                </h2>
                <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
                  Our platform serves two key roles in civic engagement, each with unique capabilities and responsibilities.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Citizens Card */}
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-xl">
                          <Users className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Citizens</CardTitle>
                          <p className="text-gray-600">Community Members & Residents</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-700">
                        As a citizen, you're the eyes and ears of your community. Report issues, 
                        participate in verification, and help ensure your neighborhood thrives.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Eye className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Report Issues</h4>
                            <p className="text-sm text-gray-600">Easily report civic problems with location and photos</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Vote className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Community Verification</h4>
                            <p className="text-sm text-gray-600">Vote to verify reported issues and their resolution</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Track Progress</h4>
                            <p className="text-sm text-gray-600">Monitor the status of your reports and community issues</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ward Councillors Card */}
                  <Card className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Building className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl text-gray-900">Ward Councillors</CardTitle>
                          <p className="text-gray-600">Elected Local Representatives</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <p className="text-gray-700">
                        Ward councillors manage and resolve community issues within their jurisdiction, 
                        ensuring transparent and accountable governance.
                      </p>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Issue Management</h4>
                            <p className="text-sm text-gray-600">Review, acknowledge, and manage verified community issues</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Status Updates</h4>
                            <p className="text-sm text-gray-600">Update progress and mark issues as resolved</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-semibold text-gray-900">Community Dashboard</h4>
                            <p className="text-sm text-gray-600">Monitor ward statistics and resolution rates</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* How It Works Section */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  How It Works
                </h2>
                <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
                  Our transparent, blockchain-powered process ensures accountability and community-driven solutions.
                </p>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-green-600">1</span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Report & Verify</h3>
                    <p className="text-gray-600 text-sm">
                      Citizens report issues, community verifies authenticity through voting
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">2</span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Action & Progress</h3>
                    <p className="text-gray-600 text-sm">
                      Ward councillors acknowledge, manage, and update issue resolution progress
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-purple-600">3</span>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">Community Validation</h3>
                    <p className="text-gray-600 text-sm">
                      Citizens verify completion, ensuring transparency and accountability
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
