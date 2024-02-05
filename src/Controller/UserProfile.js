const User = require('../Database/Auth');


function updateUserProfile(req, res) {
  const { id } = req.user;
  const { name, mobilenumber ,password ,dob,gender } = req.body;
  console.log(req.body);
 
  User.findByIdAndUpdate(id, { name, mobilenumber,  password, dob, address, gender }, { new: true })
    .then((result) => {
      res.status(200).json({ message: 'User profile updated successfully'});
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}
const removeAddress = (req, res) => {
  const { id } = req.user;
  const { addressId } = req.body;

  User.findByIdAndUpdate(id, { $pull: { address: { _id: addressId } } }, { new: true })
    .then((result) => {
      res.status(200).json({ message: 'Address removed successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
  }
const addAddress = (req, res) => {
  const { id } = req.user;
  const { address } = req.body;

  User.findByIdAndUpdate(id, { $push: { address } }, { new: true })
    .then((result) => {
      res.status(200).json({ message: 'Address added successfully' });
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}

const getUserProfile = (req, res) => {
  const { id } = req.user;

  User.findById(id).select('-password')
    .then((result) => {
      // remove password from the result
      // result.password = undefined;
      res.status(200).json(result);
    })
    .catch(error => {
      res.status(500).json({ error: error.message });
    });
}

module.exports = { updateUserProfile,getUserProfile,removeAddress,addAddress};