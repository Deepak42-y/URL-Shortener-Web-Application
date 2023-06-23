const mongoose = require('mongoose');
const shortId = require('shortid');

const ShortUrlSchema = new mongoose.Schema({
full: {
type: String,
required: true
},
short: {
type: String,
required: true,
default: function () {
return shortId.generate();
}
},
clicks: {
type: Number,
required: true,
default: 0
},
note: {
type: String
}
});

const ShortUrlModel = mongoose.model('ShortUrl', ShortUrlSchema);

module.exports = ShortUrlModel;