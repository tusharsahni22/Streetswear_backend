const productSchema = require('../Database/productSchema');

const addProduct = (req, res) => {
    const { title, price, pic, size, description, specification, stock } = req.body;
    if (!title || !price || !pic || !size || !description || !specification || !stock) {
        res.status(400).send({ message: "Content can not be empty! Enter all details" });
        return;
    }

    const product = new productSchema({ title, price, pic, size, description, specification, stock });
    product.save(product)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while creating a create operation" });
        });

}
const viewProduct = (req, res) => {
    productSchema.find()
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Error Occured" });
        });

}

const addProductImage = (req, res) => {
    const pic  = req.files;
    if (!pic ) {
        res.status(400).send({ message: "Content can not be empty! Upload picture" });
        return;
    }

  console.log("pictures",pic)
  res.send({ message: "Image uploaded successfully" });


}

module.exports = { addProduct, viewProduct ,addProductImage};