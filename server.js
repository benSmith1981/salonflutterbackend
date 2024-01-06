const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  userType: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
  try {
    const { email, username, password, userType } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate a salt for password hashing
    // const saltRounds = 10; // You can adjust the number of rounds for security
    // const salt = bcrypt.genSaltSync(saltRounds);

    // // Hash the password with the generated salt
    // const hashedPassword = bcrypt.hashSync(password, salt);

    // Create a new user
    const newUser = new User({
      email,
      username,
      password,
      userType,
    });

    await newUser.save();
    res.status(200).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      // Check if the user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if the password is correct
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
      // Generate a JWT token for the user
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
  
      res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Login failed' });
    }
});
    
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});