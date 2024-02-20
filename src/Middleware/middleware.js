const jwt = require('jsonwebtoken');
const User = require('../Database/Auth');

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const authMiddleware = async (err,req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
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
