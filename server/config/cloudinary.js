const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dvoygipns",
  api_key: "917576439771731",
  api_secret: "qpfZMP2G5h3R47Yzi1seZV3nUh8"
});

module.exports = cloudinary;