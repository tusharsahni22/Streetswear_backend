const productSchema = require('../Database/productSchema');
const {S3Client, GetObjectCommand, PutObjectCommand}  = require('@aws-sdk/client-s3');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const fs = require('fs');
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME } = process.env;
const s3Client = new S3Client({
    region: 'ap-south-1', 
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});
const key = 'Beige Aesthetic Fashion Clothing Collection Medium Banner.png';

const addProduct = (req, res) => {
    const productdetail = JSON.parse(req.body.product);
    const { title, price, size, description, specification, stock } = productdetail;
    const pic = req.image;
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

const  addProductImage = async (req, res ,next) => {
    const pic  = req.file;
    console.log(pic)
    if (!pic ) {
        res.status(400).send({ message: "Content can not be empty! Upload picture" });
        return;
    }
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `upload/${pic.filename}`,
        Body: fs.createReadStream("./uploads/"+pic.filename),
        ContentType: pic.mimetype,
    
    });
    try {
        const data = await s3Client.send(command);
        const command2 = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `upload/${pic.filename}`,
        })
        const url = await getSignedUrl(s3Client, command2)
        req.image = url;
        // res.send({ message: "Image uploaded successfully", url:url });
    } catch (error) {
        console.log("Error", error);
        return res.status(500).send({ message: "Error in uploading image" });
    }
    next();

}

module.exports = { addProduct, viewProduct ,addProductImage};