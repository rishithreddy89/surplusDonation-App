import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, TrendingUp, Users, Sparkles, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Star, Shield, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SponsorBanner from "@/components/ui/SponsorBanner";
import SponsorCarousel from "@/components/ui/SponsorCarousel";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Connect Donors",
      description: "Match surplus resources with those who need them most"
    },
    {
      icon: TrendingUp,
      title: "AI-Powered Matching",
      description: "Smart algorithms optimize distribution and reduce waste"
    },
    {
      icon: Users,
      title: "Community Impact",
      description: "Track your contribution and see real-time impact metrics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by AI & Blockchain</span>
          </div>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mt-12 text-center lg:text-left">
  <img
    src="https://i.pinimg.com/1200x/13/9d/98/139d98651600bbf32f37bdde6ef08795.jpg"
    alt="Hero Image"
    className="w-64 md:w-80 lg:w-[600px] rounded-2xl shadow-lg object-cover"
  />
  
  <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
    Turning Urban Surplus into Shared Smiles
  </h1>
</div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the intelligent network connecting donors, NGOs, and logistics partners 
            to redistribute surplus food, clothing, books, and more to those who need them.
          </p>
        </motion.div>

        {/* Sponsor Carousel - Auto-scrolling horizontal carousel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 -mx-4 md:mx-0"
        >
          <SponsorCarousel />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-12"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/select-role")}
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => navigate("/be-a-sponsor")}
            >
              <Award className="mr-2 w-5 h-5" />
              Be a Sponsor
            </Button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid md:grid-cols-3 gap-8 mt-20"
        >
          {features.map((feature, index) => (
            <motion.div
               key={index}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
  className="bg-card rounded-2xl p-8 border border-border shadow-lg transition-all duration-700 ease-in-out
             hover:border-indigo-400 hover:shadow-[0_0_70px_rgba(99,102,241,1)] hover:scale-[1.03]"
  style={{
    boxShadow: "0 10px 15px -3px rgba(26, 85, 158, 0.79)"
  }}
> 
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Problem & Solution Section */}
        <motion.div
          initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.8, duration: 0.6 }}
  className="mt-24 grid md:grid-cols-2 gap-12"
>
  <div
    className="bg-card rounded-2xl p-8 border border-border shadow-lg transition-all duration-500 ease-in-out
               hover:border-indigo-400 hover:shadow-[0_0_70px_rgba(79,70,229,1)] hover:scale-[1.02]"
    style={{
      boxShadow: "0 10px 15px -3px rgba(26, 85, 158, 0.5)",
    }}
>
             <h2 className="text-3xl font-bold mb-4 text-primary">The Problem</h2>
  <p className="text-muted-foreground leading-relaxed">
    Every day, tons of surplus food, clothing, and essential items go to waste in urban areas, 
    while many people struggle to access basic necessities. The disconnect between abundance 
    and need creates both environmental and social challenges.
  </p>
</div>

<div
  className="bg-card rounded-2xl p-8 border border-border shadow-lg transition-all duration-700 ease-in-out 
             hover:border-indigo-400 hover:shadow-[0_0_70px_rgba(79,70,229,1)] hover:scale-[1.02]"
  style={{
    boxShadow: "0 10px 15px -3px rgba(26, 85, 158, 0.79)",
  }}>
            <h2 className="text-3xl font-bold mb-4 text-success">Our Solution</h2>
            <p className="text-muted-foreground leading-relaxed">
              We've built an intelligent platform that bridges this gap using AI-powered matching, 
              blockchain verification, and optimized logistics. Connect surplus with need efficiently, 
              transparently, and sustainably.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white border-t border-slate-700 mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Company Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-400" />
                Surplus Spark
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Connecting surplus resources with those who need them most. Building a sustainable and compassionate community.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs text-slate-400">4.9/5 (2.5k+ reviews)</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button 
                    onClick={() => navigate("/select-role")} 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Get Started
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/select-role")} 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                    Login / Signup
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/")} 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                    About Us
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/")} 
                    className="text-slate-300 hover:text-blue-400 transition-colors duration-200 flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowRight className="w-3 h-3" />
                    How It Works
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <Mail className="w-4 h-4 mt-0.5 text-blue-400" />
                  <span>wespreadgood@gmail.org</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <Phone className="w-4 h-4 mt-0.5 text-green-400" />
                  <span>+91 98486453245</span>
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 mt-0.5 text-red-400" />
                  <span>Hyderabad, Telangana, India</span>
                </li>
              </ul>
              <div className="flex items-center gap-2 pt-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-xs text-slate-400">Verified & Secure Platform</span>
              </div>
            </div>

            {/* Social Media & Recognition */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Connect With Us</h4>
              <div className="flex gap-3">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-700 hover:bg-blue-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-700 hover:bg-sky-500 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-700 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a 
                  href="https://linkedin.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-700 hover:bg-blue-700 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-700 hover:bg-red-600 flex items-center justify-center transition-all duration-300 hover:scale-110"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              </div>
              
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-slate-400">UN SDG Partner 2024</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-slate-400">AI-Powered Platform</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-6 pt-4 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-400">
            <p>&copy; 2025 Surplus Spark Network. All rights reserved.</p>
            <div className="flex gap-4">
              <button className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</button>
              <button className="hover:text-blue-400 transition-colors duration-200">Terms of Service</button>
              <button className="hover:text-blue-400 transition-colors duration-200">Cookie Policy</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
