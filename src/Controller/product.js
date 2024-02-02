const productSchema = require('../Database/productSchema');
const Favorite = require('../Database/favorite');
const {S3Client, PutObjectCommand}  = require('@aws-sdk/client-s3');
const fs = require('fs');
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, BUCKET_NAME } = process.env;
const s3Client = new S3Client({
    region: 'ap-south-1', 
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});


const  addProductImage = async (req, res ,next) => {
    const mainPicture  = req.files["pic"][0];
    const AltPictures = req.files["altpicture"];
    const { title } = JSON.parse(req.body.product);
    const key = "upload/"+title+"/"+mainPicture.filename;
    const AltPickey = "upload/"+title+"/"+AltPictures.filename;
    let altPic1,altPic2,altPic3;
    if (!mainPicture || !AltPictures) {
        res.status(400).send({ message: "Content can not be empty! Upload picture" });
        return;
    }
    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: fs.createReadStream(mainPicture.path),
        ContentType: mainPicture.mimetype,
    
    });
    
    try {
        const data = await s3Client.send(command);

        for (let i = 0; i < AltPictures.length; i++) {
            const altPic = AltPictures[i];
            const AltPickey = "upload/"+title+"/"+altPic.filename;
            // console.log(AltPickey);
    
            const commandForAltPic = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: AltPickey,
                Body: fs.createReadStream(altPic.path),
                ContentType: altPic.mimetype,
            
            });
            const dataAltPic = await s3Client.send(commandForAltPic);
            if(i==0){

                altPic1 = `https://d1ow83a3vk82qz.cloudfront.net/${AltPickey}`;
            }
            if(i==1){
                altPic2 = `https://d1ow83a3vk82qz.cloudfront.net/${AltPickey}`;
            }
            if(i==2){
                altPic3 = `https://d1ow83a3vk82qz.cloudfront.net/${AltPickey}`;
            }
        }
        const cloudFrontURL = `https://d1ow83a3vk82qz.cloudfront.net/${key}`;
        // All links are ready to be saved in the the req.mainPicture, req.altPic1, req.altPic2 ,req.altPic3
        req.mainPicture = cloudFrontURL;
        req.altPic1 = altPic1;
        req.altPic2 = altPic2;
        req.altPic3 = altPic3;
        
    } catch (error) {
        console.log("Error", error);
        return res.status(500).send({ message: "Error in uploading image" });
    }
    next();

}

const addProduct = (req, res) => {
    const productdetail = JSON.parse(req.body.product);
    const { title, price, size, description, specification, stock ,category ,color,colorToIndexMap } = productdetail;
    const mainPicture = req.mainPicture;
    const altPictures = [req.altPic1, req.altPic2 ,req.altPic3];
    if (!title || !price || !mainPicture || !size || !description || !specification || !stock || !altPictures || !category || !color || !colorToIndexMap) {
        res.status(400).send({ message: "Content can not be empty! Enter all details"});
        return;
    }

 
    const product = new productSchema({ title, price, mainPicture, size, description, specification, stock, category , color, altPictures, colorToIndexMap});
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
const addFavorite = (req, res) => {
    const favorite = new Favorite({ user: req.user._id, product: req.body.productId });
    favorite.save()
        .then(data => {
            res.send({message:"Product added to favorites successfully"});
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while Adding" });
        });
}

const removeFavorite = (req, res) => {
    Favorite.deleteOne({ user: req.user._id, product: req.body.productId })
        .then(data => {
            res.send({message:"Product removed from favorites successfully"});
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Some error occured while Removing" });
        });
}
const getFavorite = (req, res) => {
    Favorite.find({ user: req.user._id }).populate('product').exec()
        .then(data => {
                res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Error Occured" });
        });
}
    


module.exports = { addProduct, viewProduct ,addProductImage,addFavorite,removeFavorite,getFavorite};