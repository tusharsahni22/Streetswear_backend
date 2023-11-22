const User = require('../Database/Auth');


function updateUserProfile(req, res) {
  const { id } = req.user;
  const { name, mobilenumber ,password } = req.body;
 
  User.findByIdAndUpdate(id, { name, mobilenumber ,password }, { new: true })
    .then((result) => {
      res.status(200).json({ message: 'User profile updated successfully'});
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}

const getUserProfile = (req, res) => {
  const { id } = req.user;

  User.findById(id)
    .then((result) => {
      // remove password from the result
      result.password = undefined;
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}

module.exports = { updateUserProfile,getUserProfile};