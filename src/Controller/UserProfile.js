const User = require('../Database/Auth');
function updateUserProfile(req, res) {
  const { id } = req.user;
  const { name, mobilenumber } = req.body;

  User.findByIdAndUpdate(id, { name, mobilenumber }, { new: true })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}

module.exports = { updateUserProfile};