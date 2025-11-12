import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ShieldCheck } from "lucide-react";

const VerificationCenter = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Verification Center</h2>
        <p className="text-muted-foreground">Blockchain and QR-based verification system</p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <ShieldCheck className="w-20 h-20 mx-auto mb-6 text-primary" />
            <h3 className="text-2xl font-bold mb-3">Blockchain Verification System</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Every donation is secured on the blockchain for complete transparency and traceability. 
              This ensures trust between donors, NGOs, and logistics partners.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              QR Code Verification
            </CardTitle>
            <CardDescription>Track donations with QR codes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-8 text-center">
              <QrCode className="w-32 h-32 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Each donation receives a unique QR code for real-time tracking
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verification Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Total Verified Donations</span>
              <span className="font-bold">347</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Blockchain Transactions</span>
              <span className="font-bold">1,234</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <span>Verification Rate</span>
              <span className="font-bold text-success">99.8%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { id: "VER-001", donation: "D002", timestamp: "2 mins ago", status: "Verified" },
              { id: "VER-002", donation: "D005", timestamp: "15 mins ago", status: "Verified" },
              { id: "VER-003", donation: "D008", timestamp: "1 hour ago", status: "Verified" }
            ].map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{item.id} - Donation {item.donation}</p>
                  <p className="text-sm text-muted-foreground">{item.timestamp}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success" />
                  <span className="text-sm text-success">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationCenter;
