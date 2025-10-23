const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    originalUrl: { type: String, required: true },
    shortId: { type: String, required: true, unique: true },
      createdBy: {type: mongoose.Schema.Types.ObjectId,ref: "User"}    //created by whom //ref from signup
});

module.exports = mongoose.model('Url', urlSchema);