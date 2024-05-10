const productSchema = require('../Database/productSchema');
const Favorite = require('../Database/favorite');
const PromoCode = require('../Database/promocode');
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
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }
    const mainPicture  = req.files["pic"][0];
    const AltPictures = req.files["altpicture"];
    console.log("product",req.body.product);
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

                altPic1 = `https://d2lwn8j9w6v60g.cloudfront.net/${AltPickey}`;
            }
            if(i==1){
                altPic2 = `https://d2lwn8j9w6v60g.cloudfront.net/${AltPickey}`;
            }
            if(i==2){
                altPic3 = `https://d2lwn8j9w6v60g.cloudfront.net/${AltPickey}`;
            }
        }
        const cloudFrontURL = `https://d2lwn8j9w6v60g.cloudfront.net/${key}`;
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
    const { title, price, priceAfterDiscount, size, description, specification, stock ,category ,color,colorToIndexMap,limitedEdition } = productdetail;
    const mainPicture = req.mainPicture;
    const altPictures = [req.altPic1, req.altPic2 ,req.altPic3];
    
    if (!title || !price || !priceAfterDiscount || !size || !description || !specification || !stock || !category || !color || !colorToIndexMap) {
        return res.status(400).send({ message: "Content can not be empty! Enter all details"});
       
    }

 
    const product = new productSchema({ title, price, priceAfterDiscount, mainPicture, size, description, specification, stock, category , color, altPictures, colorToIndexMap,limitedEdition});
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

const viewProductById = (req, res) => {
    const ProductId = req.params.id;
    if (!ProductId) {
        return res.status(400).send({ message: "Product Id cannot be Null!" });
    }
    productSchema.findById(ProductId)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({ message: err.message || "Error Occured" });
        });

}
const viewLimitedProduct = (req, res) => {
    productSchema.find({"limitedEdition":true})
        .then(data => {
            console.log("first",data)
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
            console.log(req.body.productId,"user",req.user._id)
            console.log(data)
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

const applyPromoCode = async (req, res) => {
    const { code } = req.body;

    try {
        const promoCode = await PromoCode.findOne({ code:code.toLowerCase()});

        if (!promoCode) {
            return res.status(404).json({ message: 'Promo code not found' });
        }

        if (promoCode.expiryDate < new Date()) {
            return res.status(400).json({ message: 'Promo code has expired' });
        }

        let flatDiscount = promoCode.flatDiscount;
        let percentDiscout = promoCode.percentDiscount;

        res.json({ flatDiscount, percentDiscout});

    } catch (err) {
        res.status(500).json({ message: 'An error occurred' });
    }
}

const makePromocode = (req, res) => {
    const { code, flatDiscount, percentDiscount, expiryDate } = req.body;

    if (!code || !expiryDate) {
        return res.status(400).json({ message: 'Code and expiry date are required' });
    }

    const promoCode = new PromoCode({ code:code.toLowerCase(), flatDiscount, percentDiscount, expiryDate });

    promoCode.save()
        .then(data => {
            res.json(data);
        })
        .catch(err => {
            res.status(500).json({ message: 'An error occurred' });
        });
}
    


module.exports = { addProduct, viewProduct ,viewProductById ,viewLimitedProduct ,addProductImage,addFavorite,removeFavorite,getFavorite,applyPromoCode,makePromocode};