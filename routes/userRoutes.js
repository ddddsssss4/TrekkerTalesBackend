import express from 'express';
import { User, Blog, GlobalBlog, Profile } from '../models/usermodel.js'; // Adjust the import path
import { upload } from '../multer-config.js'; 
const router = express.Router();
router.use(express.json()); // Middleware to parse JSON bodies
import  uploadOnCloudinary  from '../cloudinary.js';

import sendWelcomeEmail from '../emailService.js';
router.post('/signup', async (req, res) => {
  try {
      const { name, username, email, password } = req.body;
       console.log(name, username, email, password);
      // Check if the username or email already exists
      const existingUser = await User.findOne({ $or: [{ username }, { email }] });
      if (existingUser) {
          return res.status(400).json({ message: 'Username or Email already exists.' });
      }

      // Create a new user
      const newUser = await User.create({ name, username, email, password });

      // Create an associated profile for the new user
      const newProfile = await Profile.create({ user: newUser._id });
      await sendWelcomeEmail(email, name);
      // Save the user's ID in the session
      //req.session.userId = newUser._id;

      res.status(201).json({ message: 'User signed up successfully', userId: newUser._id });
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

router.post('/signin', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Find the user by email
      const user = await User.findOne({ email });
      if (!user || user.password !== password) {
          return res.status(400).json({ message: 'Invalid email or password.' });
      }

      // Store the user's ID in the session
     // req.session.userId = user._id;

      res.status(200).json({ message: 'User signed in successfully', userId: user._id });
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});
/**
 * Create a new blog for a user
 */
router.post('/blogs', async (req, res) => {
    try {
        const { userId, title, description, place, tags } = req.body;
          console.log(userId, title, description, place, tags);
        // Find the profile for the given user
        const userProfile = await Profile.findOne({ user: userId });
        if (!userProfile) {
            return res.status(404).json({ message: 'Profile not found for the given user.' });
        }

        // Create the blog using .create
        const newBlog = await Blog.create({
            title,
            description,
            place,
            tags,
            profile: userProfile._id,
            blogCount: (userProfile.blogCount || 0) + 1
        });
        // Create the global blog entry using .create
        const globalBlog = await GlobalBlog.create({
            title,
            description,
            place,
            tags,
            author: userProfile.user // Store the user's ID or username as the author
        });

        res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

/**
 * Update user's favorite places
 */
router.put('/profiles/:userId/favorites', async (req, res) => {
  try {
      const { userId } = req.params;
      const { favorites } = req.body;

      // Ensure that favorites is always an array
      const favoritesArray = Array.isArray(favorites) ? favorites : [favorites];

      // Add the new favorites to the existing list using $addToSet
      const profile = await Profile.findOneAndUpdate(
          { user: userId },
          { $addToSet: { favorites: { $each: favoritesArray } } }, // Add favorites one by one
          { new: true } // Return the updated document
      ).populate('blogs'); // This will populate the blogs field

      if (!profile) {
          return res.status(404).json({ message: 'Profile not found' });
      }

      res.status(200).json({ message: 'Favorites updated successfully', profile });
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
});

router.post('/user/profile-picture', upload.single('profilePicture'), async (req, res) => {
    try {
      const userId = req.body.userId // Assume you have user authentication to get user ID
     console.log(userId);
    if (!req.file) {
        return res.status(400).json({ message: 'No property image uploaded.' });
      }
  
      // Upload the image to Cloudinary and get the URL
      const imageUrl = await uploadOnCloudinary(req.file.path);
      if (!imageUrl) {
        return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
      }
  console.log(imageUrl);
      // Update the user document with the new profile picture URL
      await User.findByIdAndUpdate(userId, { profileImage: imageUrl });
  
      res.status(200).json({ message: 'Profile picture updated successfully', imageUrl: imageUrl });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      res.status(500).json({ message: 'Error updating profile picture' });
    }
  });

router.get('/blogs/user/:userId', async (req, res) => {
  try {
      const { userId } = req.params;
      console.log(userId);

      // Find the profile for the given user
      const userProfile = await Profile.findOne({ user: userId });
      if (!userProfile) {
          return res.status(404).json({ message: 'Profile not found for the given user.' });
      }

      // Fetch all blogs associated with the user's profile
      const blogs = await Blog.find({ profile: userProfile._id }); // Populate profile details

      if (!blogs || blogs.length === 0) {
          return res.status(404).json({ message: 'No blogs found for this user.' });
      }
      const simplifiedBlogs = blogs.map(blog => ({
        description: blog.description,
        place: blog.place
    }));

      res.status(200).json({ 
        message: 'Blogs fetched successfully', 
       simplifiedBlogs:simplifiedBlogs 
      });
  } catch (error) {
    console.log(error.message);
      res.status(400).json({ message: error.message });
  }
});

router.get('/user/profile-picture/single/:userId', async (req, res) => {
    try {
      const { userId } = req.params; // Get userId from the route parameters
      console.log(userId);
  
      // Find the user and populate the profile
      const user = await User.findById(userId).populate('profile');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Access the profileImage from the populated profile
      if (!user.profile || !user.profile.profileImage) {
        return res.status(404).json({ message: 'Profile image not found' });
      }
  
      res.status(200).json({ profileImage: user.profile.profileImage });
  
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  router.get('global-blogs', async (req, res) => {
    try {
        const globalBlogs = await GlobalBlog.find();
        res.status(200).json({ message: 'Global blogs fetched successfully', globalBlogs });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
  })

  router.get('/user-information/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).populate('profile');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User information fetched successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

  router.post('/update-description/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { description } = req.body;

        const user = await User.findByIdAndUpdate(userId, { description }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Description updated successfully', user });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
  

router.post('/blog/search', async (req, res) => {
  const { searchTerm, tags } = req.body;

  try {
    // Build the search query
    const query = {
      ...(searchTerm && {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in title
          { description: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in description
          { place: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in place
          { author: { $regex: searchTerm, $options: 'i' } }, // Case-insensitive search in author (GlobalBlog schema)
        ],
      }),
      ...(tags && tags.length > 0 && { tags: { $in: tags } }),
    };

    // Query both Blog and GlobalBlog models and merge results
    const [blogs, globalBlogs] = await Promise.all([
      Blog.find(query).populate('profile').exec(),
      GlobalBlog.find(query).exec(),
    ]);

    // Combine results and send response
    res.json({ globalBlogs });
  } catch (error) {
    console.error('Error fetching search results:', error);
    res.status(500).json({ error: 'Server error occurred while searching.' });
  }
});






export default router;
