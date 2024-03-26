const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../Database/Auth');

// Login API function
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match, return error
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Return token and user data
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Signup API function
const signup = async (req, res) => {
  const { email, password,name,mobilenumber } = req.body;

  if (!email || !password || !name || !mobilenumber) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });

    // If user already exists, return error
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const existingPhone = await User.findOne({mobilenumber});
    if(existingPhone){
      return res.status(400).json({ message: 'Phone number already exists' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({email, password: hashedPassword ,name,mobilenumber });
    await user.save();

    // Create JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    // Return token and user data
    res.json({ token, message: 'User SignUp successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  const _id = req.user._id;
  const { password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ _id });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate({ _id }, { password: hashedPassword });
    res.json({ message: 'Password changed successfully' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { login, signup ,changePassword };
