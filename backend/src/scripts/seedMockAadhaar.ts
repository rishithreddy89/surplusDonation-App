import mongoose from 'mongoose';
import dotenv from 'dotenv';
import MockAadhaar from '../models/MockAadhaar';

dotenv.config();

const mockData = [
  { aadhaar: '374839462289', linkedPhone: '+917569680923', name: 'Vishnu' },
  { aadhaar: '632032286346', linkedPhone: '+919704093653', name: 'Rishith Reddy' }, // Your number - must be verified in Twilio
  { aadhaar: '476089247816', linkedPhone: '+919391187288', name: 'Javeed Shaik' },
  { aadhaar: '456745674567', linkedPhone: '+919876543213', name: 'Restaurant Owner' },
  { aadhaar: '567856785678', linkedPhone: '+919876543214', name: 'Grocery Store' },
];

const seedMockAadhaar = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/surplus-spark');
    console.log('✅ Connected to MongoDB');

    await MockAadhaar.deleteMany({});
    console.log('🗑️  Cleared existing mock Aadhaar records');

    await MockAadhaar.insertMany(mockData);
    console.log('✅ Mock Aadhaar records seeded successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding mock Aadhaar:', error);
    process.exit(1);
  }
};

seedMockAadhaar();
