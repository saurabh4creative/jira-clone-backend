const jwt    = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const validateToken = (req, res, next) => {
     const authHeader = req.headers.authorization;

     if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res
               .status(401)
               .json({
                    error: "Unauthorized - Missing or invalid Bearer token",
               });
     }

     const token = authHeader.split(" ")[1];

     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
          if (err) {
               return res
                    .status(401)
                    .json({ error: "Unauthorized - Invalid Bearer token" });
          } 
          req.user = decoded;
          next();
     });
};

module.exports = validateToken;