const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// รูปของ Crystal size (Honda) เก็บแยก folder ใน asset root
const ASSET_ROOT = "C:\\AutomationProject\\SAR\\asset";
const PIC_FOLDER = "pic_crystalsize_honda";
const PIC_DIR = path.join(ASSET_ROOT, PIC_FOLDER);

// ชื่อไฟล์ที่หน้าเว็บสร้าง = CSH_<RequestSample_ID>_R<รอบ>.jpg
const FILE_NAME = /^CSH_[A-Za-z0-9_-]+_R[1-6]\.jpg$/;

router.post("/Widget_uploadCrystalSizeHondaPicture", async (req, res) => {
  console.log("in uploadCrystalSizeHondaPicture");
  try {
    const fileName = String(req.body.fileName || "");
    const image = String(req.body.image || "");

    if (!FILE_NAME.test(fileName) || image === "") {
      res.send("error");
      return;
    }

    fs.mkdirSync(PIC_DIR, { recursive: true });
    fs.writeFileSync(path.join(PIC_DIR, fileName), Buffer.from(image, "base64"));

    res.send(`${PIC_FOLDER}/${fileName}`);
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

// รับรายชื่อไฟล์ (คั่นด้วย ,) แล้วคืนเฉพาะชื่อที่มีไฟล์อยู่จริง
router.post("/Widget_checkCrystalSizeHondaPicture", async (req, res) => {
  try {
    const files = String(req.body.files || "")
      .split(",")
      .map((name) => name.trim())
      .filter((name) => FILE_NAME.test(name));

    const found = files.filter((name) =>
      fs.existsSync(path.join(PIC_DIR, name))
    );

    res.json(found);
  } catch (error) {
    console.log(error);
    res.json([]);
  }
});

module.exports = router;
