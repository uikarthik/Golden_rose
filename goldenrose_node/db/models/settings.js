const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var settingsSchema = mongoose.Schema({
  support_email: {
    type: String,
    default: 'support@goldenrose.com',
  },
  type: {
    type: String,
    default: 'SITE',
  },
  fav_icon: {
    type: String,
    default: '',
  },
  site_logo: {
    type: String,
    default: '',
  },
  site_name: {
    type: String,
    default: '',
  },
  terms: {
    type: String,
    default: '',
  },
  privacy: {
    type: String,
    default: '',
  },
  whats_new: {
    type: String,
    default: '',
  },
  android_link: {
    type: String,
    default: '',
  },
  ios_link: {
    type: String,
    default: '',
  },
  android_version: {
    type: String,
    default: '',
  },
  ios_version: {
    type: String,
    default: '',
  },
  user_site_maintainence: {
    type: Boolean,
    default: false,
  },
  copy_rights: {
    type: String,
    default: '',
  },
  twitter: {
    type: String,
    default: '',
  },
  telegram: {
    type: String,
    default: '',
  },
  youtube: {
    type: String,
    default: '',
  },
  facebook: {
    type: String,
    default: '',
  },
  linkedin: {
    type: String,
    default: '',
  },
  blog: {
    type: String,
    default: '',
  },
  instagram: {
    type: String,
    default: '',
  },
  site_tracker_code: {
    type: String,
    default: '',
  },
  currency: {
    type: String,
    default: '',
  },
  language: {
    type: String,
    default: '',
  },
  delivery_fee: {
    type: Number,
    default:0
  },
  order_price: {
    type: Number,
    default:0
  },
  delivery_fee_above_min: {
    type: Number,
    default:0
  },
  delivery_fee_below_min: {
    type: Number,
    default:0
  },
  delivery_fee_above_max: {
    type: Number,
    default:0
  },
  delivery_fee_below_max: {
    type: Number,
    default:0
  },
  guest_limit: {
    type: Number,
    default:0
  },
}, { timestamps: true });

var settings = mongoose.model('settings', settingsSchema);

module.exports = settings;
