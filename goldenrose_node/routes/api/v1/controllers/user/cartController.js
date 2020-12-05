const express = require('express');
const router = express.Router();
const { Validator } = require('node-input-validator');

// Model

const User = require('../../../../../db/models/user');
const Guest = require('../../../../../db/models/guest');

const Product = require('../../../../../db/models/product');
const LogFile = require('../../../../../core/log/index');
const Settings = require('../../../../../db/models/settings');

// Middleware

const verifyUser = require('../../middlewares/verifyUser');
const Language = require('../../../../../core/language/index');

module.exports = router;

router.get('/list', verifyUser, async (req, res) => {
    try {

        let delivery_fee = {
            order_price:0,
            delivery_fee_above_min:0,
            delivery_fee_above_max:0,
            delivery_fee_below_min:0,
            delivery_fee_below_max:0,
        }

        let setting = await Settings.findOne({ type: 'SITE' });
        if (setting) {
            delivery_fee = {
                order_price:setting.order_price,
                delivery_fee_above_min:setting.delivery_fee_above_min,
                delivery_fee_above_max:setting.delivery_fee_above_max,
                delivery_fee_below_min:setting.delivery_fee_below_min,
                delivery_fee_below_max:setting.delivery_fee_below_max,
            }
        }

        let doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        if(req.session_token){
            let guest_doc = await Guest.findOne({ session_token:req.session_token});

            for(gue of guest_doc.cart){
                doc.cart.push(gue);
            }
            guest_doc.cart = [];
            await guest_doc.save();
        }

        await doc.save();

        doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_listed'),data:doc.cart ,delivery_fee:delivery_fee});

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(500).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/add', verifyUser, async (req, res) => {
    try {
        let check = await User.findOne({ email: req.email ,"cart.product_id":req.query.id,"cart.price_id":req.query.price_id});

        if(check){
            await User.findOneAndUpdate(
                { email: req.email ,"cart.product_id":req.query.id},
                {
                    $pull: {
                        cart: {
                            product_id:req.query.id,
                        },
                    },
                }
                );
        }

        await User.findOneAndUpdate(
            { email: req.email },
            {
                $push: {
                    cart: {
                        product_id:req.query.id,
                        price_id:req.query.price_id,
                        quantity:req.query.qty,
                    },
                },
            }
            );

        let doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });
       
        
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_added'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/remove', verifyUser, async (req, res) => {
    try {

        await User.findOneAndUpdate(
            { email: req.email },
            {
                $pull: {
                    cart: {
                        product_id:req.query.id,
                    },
                },
            }
            );

        let doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });
        
        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_removed'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/increase', verifyUser, async (req, res) => {
    try {
        let qty=0;
        let price_id=0;
        let check = await User.findOne({ email: req.email ,"cart.product_id":req.query.id}).select('cart');
        for(data of check.cart){
            if(data.product_id == req.query.id){
                data.quantity += 1;
            }
        }
        await check.save();
        
        let doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'cart_increased'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});

router.get('/decrease', verifyUser, async (req, res) => {
    try {
        let qty=0;
        let price_id=0;
        let check = await User.findOne({ email: req.email ,"cart.product_id":req.query.id}).select('cart');
        for(data of check.cart){
            if(data.product_id == req.query.id){
                data.quantity -= 1;
                qty = data.quantity;
            }
        }
        await check.save();

        if(qty<=0){

            await User.findOneAndUpdate(
                { email: req.email ,"cart.product_id":req.query.id},
                {
                    $pull: {
                        cart: {
                            product_id:req.query.id,
                        },
                    },
                }
                );
            
        }
        
        let doc = await User.findOne({ email: req.email}).select('cart').populate({
            path: "cart",
            populate: {path:"product_id"},
        });

        return res.status(200).json({ success: true, message: await Language.getResponse(req.session.language, 'card_decreased'),data:doc.cart });
        

    } catch (err) {
        LogFile.addLog('catch', req.email, req.originalUrl, err.message);
        return res.status(200).json({ success: false, message: await Language.getResponse(req.session.language, 'something_went_wrong'), error: err });
    }
});