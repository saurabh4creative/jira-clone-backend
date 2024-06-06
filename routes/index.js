const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const taskRoutes = require('./taskRoutes');
const workspaceRoutes = require('./workspaceRoute');

router.get("/", (req, res) => {
     res.status(200).json({
          status: true,
          message: "API Route Works!",
     });
});

router.use("/api", userRoutes);
router.use("/api", workspaceRoutes);
router.use("/api", projectRoutes);
router.use("/api", taskRoutes);

module.exports = router;