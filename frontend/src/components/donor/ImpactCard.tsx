import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Download, Facebook, Twitter, Linkedin, Copy, Check, MessageCircle, Instagram, Sparkles, Heart, Award } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ImpactCardProps {
  data: {
    donorName: string;
    donationTitle: string;
    quantity: number;
    unit: string;
    peopleHelped: number;
    ngoName: string;
    date: string;
    totalDonations: number;
    totalImpact: number;
    shareUrl: string;
  };
  open: boolean;
  onClose: () => void;
}

const ImpactCard = ({ data, open, onClose }: ImpactCardProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [celebrating, setCelebrating] = useState(false);

  useEffect(() => {
    if (open) {
      // Trigger celebration animation when card opens
      setCelebrating(true);
      triggerConfetti();
      
      setTimeout(() => {
        setCelebrating(false);
      }, 3000);
    }
  }, [open]);

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const shareMessage = `🎉 I just made a difference through Surplus Spark Network!\n\n✨ ${data.donationTitle}\n👥 Helped ${data.peopleHelped}\n🏆 ${data.totalDonations} total donations made\n\nJoin me in creating impact! 💝`;

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(data.shareUrl);
    const text = encodeURIComponent(shareMessage);

    let shareUrl = '';
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct web sharing, so we copy to clipboard with instructions
        handleCopyLink();
        toast({
          title: "Ready to share on Instagram!",
          description: "Link copied! Open Instagram and paste in your story or bio.",
          duration: 5000,
        });
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareMessage}\n\n${data.shareUrl}`);
      setCopied(true);
      toast({
        title: "✨ Link copied!",
        description: "Share your impact with the world!",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    try {
      const cardElement = document.getElementById('impact-card-content');
      if (!cardElement) {
        toast({
          title: "Error",
          description: "Could not find impact card to download",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Generating PDF...",
        description: "Please wait while we create your impact card",
      });

      // Capture the card as an image
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      // Calculate dimensions to fit the card nicely on the page
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = 10;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      
      // Download the PDF
      pdf.save(`impact-card-${data.donorName.replace(/\s+/g, '-')}-${new Date().getTime()}.pdf`);

      toast({
        title: "✅ Downloaded!",
        description: "Your impact card has been saved as PDF",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download impact card",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-0 bg-transparent shadow-2xl">
        {/* Main Impact Card */}
        <div className="relative">
          {/* Celebration overlay */}
          {celebrating && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <div className="absolute top-10 left-10 animate-bounce">
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="absolute top-10 right-10 animate-bounce delay-100">
                <Heart className="w-6 h-6 text-red-400" />
              </div>
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce delay-200">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          )}

          {/* Impact Card Content - for PDF capture */}
          <div id="impact-card-content">
            {/* Header with gradient - lighter colors */}
            <div className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-400 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full -ml-24 -mb-24 blur-3xl" />
              </div>
              
              <div className="relative z-10 text-center space-y-2">
                <div className="inline-flex items-center gap-2 bg-white/25 backdrop-blur-sm px-3 py-1.5 rounded-full mb-1">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span className="text-sm font-semibold">Impact Created!</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold tracking-tight">You Made a Difference!</h2>
                <p className="text-lg text-white/95">By {data.donorName}</p>
              </div>
            </div>

            {/* Main Content - lighter background */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-4">
              {/* Impact Stats - lighter colors */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-100 mb-2">
                      <Heart className="w-6 h-6 text-teal-600" />
                    </div>
                    <div className="text-4xl font-bold text-teal-600 mb-1">{data.peopleHelped}</div>
                    <div className="text-xs font-medium text-gray-600">People Helped</div>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-4 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-2">
                      <Award className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-4xl font-bold text-purple-600 mb-1">{data.quantity}</div>
                    <div className="text-xs font-medium text-gray-600">{data.unit} Donated</div>
                  </CardContent>
                </Card>
              </div>

              {/* NGO and Date Info - lighter */}
              <div className="bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg p-4 text-center space-y-1">
                <div className="flex items-center justify-center gap-2 text-gray-700">
                  <span className="text-xs font-medium">Received by</span>
                  <span className="font-bold text-teal-600">{data.ngoName}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
              </div>

              {/* Total Impact Banner - lighter gradient */}
              <div className="bg-gradient-to-r from-amber-400 to-orange-400 rounded-lg p-4 text-white text-center shadow-lg">
                <p className="text-xs font-medium opacity-95 mb-1">🌟 Your Total Impact 🌟</p>
                <p className="text-2xl font-bold">
                  {data.totalDonations} Donations • {data.totalImpact} Items
                </p>
              </div>

              {/* Call to Action */}
              <div className="text-center py-2">
                <p className="text-base font-semibold text-gray-800">💝 Share Your Story 💝</p>
                <p className="text-xs text-gray-600">Inspire others to make a difference!</p>
              </div>
            </div>
          </div>

          {/* Share Actions - outside PDF capture */}
          <div className="bg-white p-4 space-y-3 border-t">
            <p className="text-center text-xs font-medium text-gray-700 mb-2">Share on your favorite platform</p>
            
            {/* Social Media Buttons */}
            <div className="grid grid-cols-5 gap-2">
              <Button 
                onClick={() => handleShare('whatsapp')} 
                className="bg-[#25D366] hover:bg-[#20BD5A] text-white flex-col h-auto py-2.5 gap-1"
                size="sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-[10px]">WhatsApp</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('instagram')} 
                className="bg-gradient-to-r from-[#833AB4] via-[#E1306C] to-[#FD1D1D] hover:from-[#7332A6] hover:via-[#C72D62] hover:to-[#E51B1B] text-white flex-col h-auto py-2.5 gap-1"
                size="sm"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-[10px]">Instagram</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('facebook')} 
                className="bg-[#1877F2] hover:bg-[#0D65D9] text-white flex-col h-auto py-2.5 gap-1"
                size="sm"
              >
                <Facebook className="w-4 h-4" />
                <span className="text-[10px]">Facebook</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('twitter')} 
                className="bg-[#1DA1F2] hover:bg-[#1A91DA] text-white flex-col h-auto py-2.5 gap-1"
                size="sm"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-[10px]">Twitter</span>
              </Button>
              
              <Button 
                onClick={() => handleShare('linkedin')} 
                className="bg-[#0A66C2] hover:bg-[#095BA8] text-white flex-col h-auto py-2.5 gap-1"
                size="sm"
              >
                <Linkedin className="w-4 h-4" />
                <span className="text-[10px]">LinkedIn</span>
              </Button>
            </div>

            {/* Copy and Download */}
            <div className="flex gap-2">
              <Button onClick={handleCopyLink} variant="outline" className="flex-1 border-2" size="sm">
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5 text-green-600" />
                    <span className="text-green-600 font-semibold text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1.5" />
                    <span className="text-sm">Copy Link</span>
                  </>
                )}
              </Button>
              <Button onClick={handleDownload} className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white border-0" size="sm">
                <Download className="w-4 h-4 mr-1.5" />
                <span className="text-sm">Download PDF</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImpactCard;
