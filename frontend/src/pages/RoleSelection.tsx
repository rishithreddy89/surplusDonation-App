import { Card, CardContent } from "@/components/ui/card";
import { User, Building2, Truck, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const RoleSelection = () => {
  const navigate = useNavigate();

  const roles = [
    {
      icon: User,
      title: "Donor",
      description: "Share your surplus items with those in need",
      color: "from-blue-500 to-blue-600",
      path: "/auth/donor"
    },
    {
      icon: Building2,
      title: "NGO / Recipient",
      description: "Request items for your community",
      color: "from-green-500 to-green-600",
      path: "/auth/ngo"
    },
    {
      icon: Truck,
      title: "Logistics Partner",
      description: "Help transport items efficiently",
      color: "from-orange-500 to-orange-600",
      path: "/auth/logistics"
    },
    {
      icon: ShieldCheck,
      title: "Admin",
      description: "Manage and oversee the platform",
      color: "from-purple-500 to-purple-600",
      path: "/auth/admin"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex items-center justify-center p-4">
      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Who are you?</h1>
          <p className="text-lg text-muted-foreground">Select your role to continue</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {roles.map((role, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            >
              <Card
                className="cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-2 hover:border-primary"
                onClick={() => navigate(role.path)}
              >
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-6`}>
                    <role.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{role.title}</h3>
                  <p className="text-muted-foreground">{role.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
