const express = require("express");
const router = express.Router();
const pic = require('../../function/picture64');

router.post('/Widget_getPicture', async (req, res) => {
    console.log('in getpic');
    try {
        let picname = req.body.path;
        console.log(picname);
        let pic64 
        if(`${picname}` ==='N/A'){
//
            pic64 = pic.getpic(`C:\\SAR\\asset\\TPK_LOGO.jpg`);
        }else{
            pic64 = pic.getpic(`C:\\AutomationProject\\SAR\\asset\\${picname}`);
        }
        
        res.send(pic64);
    } catch (error) {
        res.json(error);
    }

})


module.exports = router;
