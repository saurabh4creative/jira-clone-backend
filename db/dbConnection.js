const mongoose = require("mongoose");

const dbConnection = async () => {
     try {
          mongoose.connect(process.env.MONGODB_URI, {
              useNewUrlParser: true,
              useUnifiedTopology: true,
          })
          .then((con) => {
              console.log(`DB Connection successful`);
          });
     } catch (error) {
          console.log("DB Error: " + error);
     }
};

module.exports = dbConnection;