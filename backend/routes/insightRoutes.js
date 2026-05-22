const express = require("express");
const authenticate = require("../middleware/authenticate");
const {
  getLatestInsight,
  generateInsight,
} = require("../controllers/insightController");

const router = express.Router();

router.use(authenticate);
router.get("/latest", getLatestInsight);
router.post("/generate", generateInsight);

module.exports = router;
