const express = require('express');
const router = express.Router();
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Validator } = require('node-input-validator');

const redis = require('redis');
var client = redis.createClient();

// Model

const Admin = require('../../../../../db/models/admin');
const User = require('../../../../../db/models/user');
const Card = require('../../../../../db/models/card');
const Order = require('../../../../../db/models/order');

// Middleware

const verifyAdmin = require('../../middlewares/verifyAdmin');

// Utils

const sendgrid = require('../../../../../utils/sendgrid');
const { getSocket } = require("../../../../../core/socket/server");
const Stripe = require('../../../../../core/stripe/index');

const LogFile = require('../../../../../core/log/index.js');

module.exports = router;


router.get('/list', verifyAdmin, async (req, res) => {
	try {
		let doc = await User.find().sort({ createdAt: -1 });
		return res.status(200).json({ success: true, message: 'User Details Fetch Success', data: doc, count: doc.length });
	} catch (err) {
		LogFile.addLog('catch', req.email,  req.originalUrl, err.message || err);
		return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
	}
});

router.post('/create', verifyAdmin, async (req, res) => {
	try {
		let validator = new Validator(req.body, {
			email: 'required',
			password: 'required',
			user_name: 'required',
			mobile: 'required',
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
		let { email, password, user_name, ref_token, mobile ,gender,birthday} = req.body;
		let language = 'en';
		var emailExist = await User.findOne({ email: email });
		if (emailExist) {
			return res.status(400).json({ success: false, message: 'Email has been registered already' });
		}
		var mobileExist = await User.findOne({ mobile });
		if (mobileExist) {
			return res.status(400).json({ success: false, message: 'Mobile Number has been registered already' });
		}
		var genSalt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(password, genSalt);
		var referral_token = randomstring.generate(6);
		let referred_by = '';
		if (ref_token) {
			let user = await User.findOne({ referral_token: ref_token });
			if (user) {
				referred_by = user._id;
			}
		}
		let card_customer_id = await Stripe.createCustomer(email);
		if (card_customer_id == null) {
			return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: "Card Customer Id Not Created" });
		}
		let user = new User({
			email,
			password: hash,
			user_name,
			nick_name: user_name,
			referral_token,
			referred_by,
			card_customer_id,
			mobile,
			language,
			gender,
			birthday
		});
		let doc = await user.save();
		if (doc._id) {
			var token = jwt.sign({ email: user.email }, process.env.jwt_secret, { expiresIn: '24h' });
			var redirectUrl = process.env.email_verify_url + '/' + token;
			let replacements = {
				username: doc.user_name,
				redirectUrl: redirectUrl,
				emailImages: process.env.email_images,
			};
			let email_array = [];
			email_array.push(email);
			let send = await sendgrid.sendMail(email_array,process.env.from_email, process.env.verify_email_template, replacements);
			
			return res.status(200).json({ success: true, message: 'User Created Successfully !', data: doc });
		} else {
			return res.status(400).json({ success: false, message: 'Failed to register? Please contact the support team' });
		}
	} catch (err) {
		LogFile.addLog('catch', req.email,  req.originalUrl, err.message || err);

		return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
	}

});

router.post('/update', verifyAdmin, async (req, res) => {
	try {
		let validator = new Validator(req.body, {
			id: 'required',
			user_name: 'required',
			email: 'required',
			mobile: 'required|minLength:6',
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
		let { email,user_name, mobile, id ,birthday,nick_name,gender} = req.body;


		var user = await User.findOne({ _id: id });
		if (user) {

			var emailExist = await User.findOne({ _id:{$ne:user._id} ,email: email });
			if (emailExist) {
				return res.status(400).json({ success: false, message: 'Email has been registered already' });
			}
			var mobileExist = await User.findOne({ _id:{$ne:user._id} ,mobile:mobile });
			if (mobileExist) {
				return res.status(400).json({ success: false, message: 'Mobile Number has been registered already' });
			}

			user.user_name = user_name;
			user.email = email;
			user.nick_name = nick_name;
			user.mobile = mobile;
			user.birthday = birthday;
			user.gender = gender;

			await user.save();

			return res.status(200).json({ success: true, message: 'Profile updated successfully !', data: user });
		} else {
			return res.status(404).json({ success: false, message: 'User not Found !' });
		}
	} catch (err) {
		LogFile.addLog('catch', req.email,  req.originalUrl, err.message || err);

		return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
	}
});

router.post('/resetpassword', verifyAdmin, async (req, res) => {
	try {
		let validator = new Validator(req.body, {
			id: 'required',
			password: 'required'
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
		let { password, id } = req.body;
		var user = await User.findOne({ _id: id }).select('password');
		if (user) {
			var old_password = user.password;
			let passwordCheck = await bcrypt.compareSync(password, old_password);
			if (passwordCheck) {
				return res.status(400).json({ success: false, message: 'Please enter a diffrent password' });
			} else {
				var genSalt = bcrypt.genSaltSync(10);
				var hash = bcrypt.hashSync(password, genSalt);
				user.password = hash;
				await user.save();
				return res.status(200).json({ success: true, message: 'Password Change Successful' });
			}
		} else {
			return res.status(404).json({ success: false, message: 'User not Found !' });
		}
	} catch (err) {
		LogFile.addLog('catch', req.email,  req.originalUrl, err.message || err);
		return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
	}
});


router.get('/getdetails', verifyAdmin, async (req, res) => {
	try {
		let user = await User.findOne({ _id: req.query.id, deleted: false });
		if (user) {

			
			let card = await Card.find({ user_id: user._id ,deleted:false});
			let order = await Order.find({ user_id: user._id ,deleted:false});

			let details = {
				user,
				card,
				order
			}
			
			return res.status(200).json({ success: true, message: 'User Details Fetch Success', data: details });
		} else {
			return res.status(404).json({ success: false, message: 'User Not Found' });
		}
	} catch (err) {
		LogFile.addLog('catch', req.email,  req.originalUrl, err.message || err);

		return res.status(500).json({ success: false, message: 'Something Went Wrong, Try again later !', error: err });
	}
});

