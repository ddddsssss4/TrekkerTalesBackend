import mongoose from 'mongoose';
const { Schema, model } = mongoose;

/**
 * User Schema
 */
const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  description: { type: String,default:"Change Your Description so people can know you better"},
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
}, { timestamps: true });

const User = model('User', userSchema);

/**
 * Profile Schema
 */
const profileSchema = new Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
  highlights: [String],  // Array of highlighted blogs (e.g., "Leh Ladakh")
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  profileImage: { type: String },
  favorites: [String],  // List of favorite places (just as strings, no reference)
  description: { type: String },
  
}, { timestamps: true });

const Profile = model('Profile', profileSchema);

/**
 * Blog Schema
 */
const blogSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  place: { type: String, required: true },  // Simple place name as a string
  blogCount: { type: Number, default: 0 },
  tags: [String],  // Optional tags like "good for family", "pet-friendly"
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true }
}, { timestamps: true });

const Blog = model('Blog', blogSchema);

/**
 * Global Blog Schema
 * This schema collects all blogs from all users globally for everyone to see.
 */
const globalBlogSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  place: { type: String, required: true },  // Place as a simple string
  tags: [String],  // Optional tags like "good for family", "pet-friendly"
  author: { type: String },  // Store the username or name of the blog author
}, { timestamps: true });

const GlobalBlog = model('GlobalBlog', globalBlogSchema);

export  { User, Profile, Blog, GlobalBlog };
