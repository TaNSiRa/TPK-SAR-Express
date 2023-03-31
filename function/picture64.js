const express = require("express");
const router = express.Router();
const fs = require('fs');

// function to encode file data to base64 encoded string
/* 
exports function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return bitmap.toString('base64');
} */
/*
var base64str = base64_encode('kitten.jpg'); */
//module.exports = router;
exports.getpic = (file) => {

    try {
        // read binary data
        var bitmap = fs.readFileSync(file);
        // convert binary data to base64 encoded string
        return bitmap.toString('base64');
    } catch (error) {
        return error;
    }

}
