const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');
const multer = require("multer");

//Model

const Product = require('../../../../../db/models/product');
const Category = require('../../../../../db/models/category');

//Middlewares and Core files

const verifyAdmin = require('../../middlewares/verifyAdmin');
const LogFile = require('../../../../../core/log/index.js');

module.exports = router;

var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/product/");
    },
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname + "-" + req.body.name + "-" + Date.now() + file.originalname
        );
    },
});

var storageImport = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./uploads/import/");
    },
    filename: function (req, file, callback) {
        callback(
            null,
            file.fieldname +"-" + Date.now() + file.originalname
        );
    },
});

var upload = multer({ storage: storage });

var cpImport = multer({ storage: storageImport });

var cpUpload = upload.fields([{ name: "file", maxCount: 10 }]);


router.post('/create', verifyAdmin, cpUpload, async (req, res) => {
    try {

        let validator = new Validator(req.body, {
            name: 'required',
            product_id: 'required',
            category_id: 'required',
            description: 'required',
            gender: 'required',
            stock_available: 'required',
            price: 'required',
            available_price: 'required',
            offer_percentage: 'required',
            price: 'required',
            price_by: 'required',
            type:'required',
            sub_type:'required'
        });

        let match = await validator.check();
        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }
        let {
            name,
            product_id,
            category_id,
            description,
            gender,
            stock_available,
            price,
            price_by,
            offer_percentage,
            available_price,
            weight,
            color,
            size,
            stock_count,
            stock_notification,
            offers,
            services,
            protection,
            warranty,
            specifications,
            type,
            sub_type
        } = req.body;
        var files;
        if (req.files && req.files.file) {
            files = req.files.file;
        }

        let new_product = new Product({
            name,
            product_id,
            file: files,
            category_id,
            description,
            gender,
            stock_available,
            price,
            price_by,
            available_price,
            offer_percentage,
            weight,
            color,
            size,
            stock_count,
            stock_notification,
            offers,
            services,
            protection,
            warranty,
            specifications,
            type: type,
            sub_type:sub_type
        });
        await new_product.save();
        return res.status(200).json({ success: true, message: 'Product Added Success', data: new_product });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);


        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/list', verifyAdmin, async (req, res) => {
    try {
        let doc = await Product.find({ deleted: false }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, message: 'Product Details Fetch Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/update', verifyAdmin, cpUpload, async (req, res) => {
    try {
        let validator = new Validator(req.body, {
            id: 'required',
            name: 'required',
            product_id: 'required',
            category_id: 'required',
            description: 'required',
            gender: 'required',
            stock_available: 'required',
            price: 'required',
            price_by: 'required',
            available_price: 'required',
            offer_percentage: 'required',
            type:'required',
            sub_type:'required'
        });
        let match = await validator.check();
        if (!match) {
            let errorMessage = [];
            let result = validator.errors;
            Object.keys(result).forEach(key => {
                if (result[key]) {
                    errorMessage.push(result[key].message);
                }
            });
            return res.status(422).send({ success: false, inputValid: true, errors: errorMessage });
        }
        let {
            id,
            name,
            product_id,
            category_id,
            description,
            gender,
            stock_available,
            price,
            price_by,
            offer_percentage,
            available_price,
            weight,
            color,
            size,
            stock_count,
            stock_notification,
            offers,
            services,
            protection,
            warranty,
            specifications,
            type,
            sub_type
        } = req.body;
        let doc = await Product.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(400).json({ success: false, message: 'Product doesnot exist' });
        }
        if (req.files) {
            if (req.files.file && req.files.file[0]) {
                doc.file = req.files.file;
            }
        }

        doc.name = name;
        doc.product_id = product_id;
        doc.category_id = category_id;
        doc.description = description;
        doc.gender = gender;
        doc.stock_available = stock_available;
        doc.price = price;
        doc.price_by = price_by;
        doc.available_price = available_price;
        doc.offer_percentage = offer_percentage;
        doc.weight = weight;
        doc.color = color;
        doc.size = size;
        doc.stock_count = stock_count;
        doc.stock_notification = stock_notification;
        doc.offers = offers;
        doc.services = services;
        doc.protection = protection;
        doc.warranty = warranty;
        doc.specifications = specifications;
        doc.type = type;
        doc.sub_type = sub_type;

        await doc.save();

        return res.status(200).json({ success: true, message: 'Product Detail Update Success', data: doc });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/delete', verifyAdmin, async (req, res) => {
    try {
        let id = req.query.id;
        let doc = await Product.findOne({ _id: id, deleted: false });
        if (!doc) {
            return res.status(404).json({ success: false, message: 'Product doesnot exist' });
        }
        doc.deleted = true;
        await doc.save();
        return res.status(200).json({ success: true, message: 'Product Delete Success' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.get('/status', verifyAdmin, async (req, res) => {

    try {
        let product = await Product.findOne({ _id: req.query.id, deleted: false });
        if (product) {
            if (product.status == true) {
                product.status = false;
            } else {
                product.status = true;
            }
            await product.save();
        } else {
            return res.status(404).json({ success: false, message: 'Product Details Not Found !' });
        }
        return res.status(200).json({ success: true, message: 'Product Details Status Changed !', data: product });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});

router.post('/import', cpImport.single('file'), async (req, res) => {

    try {

        let data = [];

        const readXlsxFile = require('read-excel-file/node');
 
        await readXlsxFile(req.file.path).then((rows) => {
            data = rows;
        });

        let params = data[0];

        for (var i = 1; i < data.length; i++) {

            let cat = await Category.findOne({ name: data[i][2] });

            if(cat){

                data[i][2] = cat._id;

                if(data[i][5] == 'TRUE' || data[i][5] == true){
                    data[i][5] = true;
                }else{
                    data[i][5] = false;
                }

                if(data[i][6] == 'CUSTOM'){
                    data[i][7]=StringToArray(data[i][7]);
                    data[i][9]=StringToArray(data[i][9]);
                    data[i][10]=StringToArray(data[i][10]);
                    data[i][11]=StringToArray(data[i][11]);
                    data[i][12]=StringToArray(data[i][12]);
                    data[i][13]=StringToArray(data[i][13]);
                }

                let new_product = new Product({
                    name:data[i][0],
                    product_id:data[i][1],
                    category_id:data[i][2],
                    description:data[i][3],
                    gender:data[i][4],
                    stock_available:data[i][5],
                    price_by:data[i][6],
                    available_price:data[i][7],
                    offer_percentage:data[i][8],
                    size:data[i][9],
                    weight:data[i][10],
                    price:data[i][11],
                    stock_count:data[i][12],
                    type:data[i][13],
                    sub_type:data[i][14]
                });
                await new_product.save();
            }
        }

        return res.status(200).json({ success: true, message: 'Product Details Imported Ssuccessfully!' });
    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message || err);

        return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
    }
});


const StringToArray=(str)=>{
    var strArr = str.split(',');
    var temp = [];
    for(i=0; i < strArr.length; i++)
        temp.push(strArr[i]);

    return temp;
}