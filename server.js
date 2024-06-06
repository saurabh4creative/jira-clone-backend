const express  = require("express"); 
const dotenv   = require("dotenv");
const cors     = require("cors");
const morgan   = require('morgan'); 
const router   = require("./routes/index");
const dbConnection = require("./db/dbConnection");

dotenv.config();

/**
 * Connection MongoDB
 */
dbConnection()

const app = express();

/**
 * Enable JSON Form Parsing
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Enable CORS 
 */
app.use(cors({ origin: "*", optionsSuccessStatus: 200, maxAge: 3600 }));

/**
 * Enable HTTP Logger Console
 */
app.use(morgan("dev"));

/**
 * Use Router for User
 */
app.use("/", router);

/**
 * Handle Error on the all Routes
 */
app.use((err, req, res, next) => {
     console.error(err);
     res.status(500).json({ message: "Internal Server Error" });
});

/**
 * Define Port and Server Config
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));