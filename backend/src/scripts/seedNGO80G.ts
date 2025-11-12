import mongoose from 'mongoose';
import dotenv from 'dotenv';
import NGO80G from '../models/NGO80G';
import User from '../models/User';

dotenv.config();

const seed80GNGOs = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/surplus-spark');
    console.log('✅ Connected to MongoDB');

    // Find all NGO users
    const ngos = await User.find({ role: 'ngo' });
    
    if (ngos.length === 0) {
      console.log('❌ No NGOs found. Please create NGO users first.');
      process.exit(1);
    }

    console.log(`📋 Found ${ngos.length} NGOs`);

    // Create 80G records for all NGOs
    for (const ngo of ngos) {
      const existing = await NGO80G.findOne({ ngoId: ngo._id });
      
      if (existing) {
        console.log(`⏭️  Skipping ${ngo.name} - already has 80G record`);
        continue;
      }

      const ngo80G = new NGO80G({
        ngoId: ngo._id,
        name: ngo.name,
        pan: `${ngo.name.substring(0, 5).toUpperCase().replace(/[^A-Z]/g, 'A')}${Math.floor(1000 + Math.random() * 9000)}F`,
        has80G: true,
        registrationNo: `80G-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        certificateValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3), // 3 years from now
        contactEmail: ngo.email,
        address: ngo.location || 'India',
        verifiedAt: new Date(),
        // Add payment details
        upiId: `${ngo.name.toLowerCase().replace(/\s+/g, '')}@upi`,
        accountNo: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        ifscCode: `SBIN0${Math.floor(100000 + Math.random() * 900000)}`,
        bankName: 'State Bank of India',
        acceptsMonetaryDonations: true,
      });

      await ngo80G.save();
      console.log(`✅ Created 80G record for ${ngo.name} with UPI: ${ngo80G.upiId}`);
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed80GNGOs();
