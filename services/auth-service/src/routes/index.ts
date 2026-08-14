import loginRoutes from "./login.js";

import signupRoutes from "./signup.js";

import refreshRoutes from "./refresh.js";

import logoutRoutes from "./logout.js";

import accountRoutes from "./account.js";

import express from "express";

const router: express.Router = express.Router();

router.use("/login", loginRoutes);

router.use("/signup", signupRoutes);

router.use("/refresh", refreshRoutes);

router.use("/logout", logoutRoutes);

// Reached via the gateway's authenticated /api/account mount, not /api/auth.
router.use("/account", accountRoutes);

export default router;
