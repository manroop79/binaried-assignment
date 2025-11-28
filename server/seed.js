/**
 * Database Seed Script
 * Run: node server/seed.js
 * 
 * Creates sample data for demo purposes
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mongoose = require('mongoose');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcryptjs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/binaried');

// Define schemas (simplified versions)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  displayName: { type: String, required: true },
  bio: String,
  avatar: String,
  coverImage: String,
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  images: [String],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  replyCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);

async function seed() {
  try {
    console.log('Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('✅ Cleared existing data');

    // Create demo users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        username: 'demo_user',
        email: 'demo@example.com',
        password: hashedPassword,
        displayName: 'Demo User',
        bio: 'Welcome to my profile! This is a demo account.',
        followers: [],
        following: [],
      },
      {
        username: 'jane_doe',
        email: 'jane@example.com',
        password: hashedPassword,
        displayName: 'Jane Doe',
        bio: 'Software Engineer | React Enthusiast | Coffee Lover ☕',
        followers: [],
        following: [],
      },
      {
        username: 'john_smith',
        email: 'john@example.com',
        password: hashedPassword,
        displayName: 'John Smith',
        bio: 'Full-stack developer building cool stuff 🚀',
        followers: [],
        following: [],
      },
    ]);

    console.log(`✅ Created ${users.length} demo users`);
    console.log('   Login with: demo@example.com / password123');

    // Create sample posts
    const posts = await Post.insertMany([
      {
        content: 'Welcome to Binaried! This is my first post. 🎉',
        author: users[0]._id,
        images: [],
        likes: [],
      },
      {
        content: 'Just deployed a new feature using Next.js 14 and it\'s blazing fast! ⚡',
        author: users[1]._id,
        images: [],
        likes: [users[0]._id],
      },
      {
        content: 'Working on some performance optimizations. Reduced bundle size by 57%! 📦',
        author: users[2]._id,
        images: [],
        likes: [users[0]._id, users[1]._id],
      },
      {
        content: 'Who else loves TypeScript? The type safety is a game changer! 💙',
        author: users[1]._id,
        images: [],
        likes: [users[2]._id],
      },
      {
        content: 'Just implemented virtual scrolling and it handles 10,000+ items smoothly! 🎯',
        author: users[0]._id,
        images: [],
        likes: [users[1]._id, users[2]._id],
      },
    ]);

    console.log(`✅ Created ${posts.length} demo posts`);

    // Set up some follow relationships
    users[0].following.push(users[1]._id, users[2]._id);
    users[1].followers.push(users[0]._id);
    users[2].followers.push(users[0]._id);
    
    await Promise.all(users.map(user => user.save()));
    console.log('✅ Set up follow relationships');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: password123');
    console.log('\n🚀 Start the app with: npm run dev\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
}

seed();

