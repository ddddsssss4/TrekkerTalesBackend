import express from 'express';
import mongoose from 'mongoose';
import router from './routes/userRoutes.js'; // Adjust the path accordingly
import cors from 'cors';
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: ['http://localhost:5173', 'http://another-origin.com'], // add more origins as needed
    credentials: true
}));
// Connect to MongoDB
mongoose.connect('mongodb+srv://pranav:1812kedar@pranav.tigxsvl.mongodb.net/TrekkerTales', )
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Use the user routes
app.use('/api', router);
app.get('/', (req,res)=>{
    res.send("Hello World");
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
