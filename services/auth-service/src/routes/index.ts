import loginRoutes from "./login.js";

import signupRoutes from "./signup.js";

import refreshRoutes from "./refresh.js";

import express from "express";

const router: express.Router = express.Router();

router.use("/login", loginRoutes);

router.use("/signup", signupRoutes);

router.use("/refresh", refreshRoutes);

export default router;
