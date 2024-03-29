const jwt = require('jsonwebtoken');
const User = require('../Database/Auth');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization").split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(decoded)
    const user = await User.findOne({ _id: decoded._id});

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ error: 'Token authenticate failed' });
  }
};

module.exports = authMiddleware;
