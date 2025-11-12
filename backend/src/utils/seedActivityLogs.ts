import ActivityLog from '../models/ActivityLog';
import User from '../models/User';

export const seedActivityLogs = async () => {
  try {
    // Get some users to create logs for
    const users = await User.find().limit(5);
    
    if (users.length === 0) {
      console.log('No users found to seed activity logs');
      return;
    }

    const sampleLogs = [
      {
        userId: users[0]._id,
        action: 'create',
        resourceType: 'surplus',
        description: `${users[0].name} created a new surplus item`,
        metadata: { category: 'food' },
      },
      {
        userId: users[1]._id,
        action: 'claim',
        resourceType: 'surplus',
        description: `${users[1].name} claimed a surplus item`,
        metadata: { category: 'clothing' },
      },
      {
        userId: users[0]._id,
        action: 'accept',
        resourceType: 'task',
        description: `${users[0].name} accepted a delivery task`,
        metadata: { status: 'assigned' },
      },
      {
        userId: users[2]._id,
        action: 'create',
        resourceType: 'request',
        description: `${users[2].name} created a new request`,
        metadata: { urgency: 'high' },
      },
      {
        userId: users[0]._id,
        action: 'deliver',
        resourceType: 'task',
        description: `${users[0].name} completed a delivery`,
        metadata: { status: 'delivered' },
      },
    ];

    await ActivityLog.insertMany(sampleLogs);
    console.log('Sample activity logs seeded successfully');
  } catch (error) {
    console.error('Error seeding activity logs:', error);
  }
};
