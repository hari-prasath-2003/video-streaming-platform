import express, { Router } from "express";
import profileService from "../service/ProfileService.js";
import {
  createProfileSchema,
  parse,
  updateProfileSchema,
} from "../validation/index.js";

const router: Router = express.Router();

router.post("/", async (req, res) => {
  const profile = await profileService.createProfile(
    req.user.uid,
    parse(createProfileSchema, req.body),
  );

  res.status(201).json(profile);
});

router.get("/me", async (req, res) => {
  const profile = await profileService.getMyProfile(req.user.uid);

  res.json(profile);
});

router.get("/:username", async (req, res) => {
  const profile = await profileService.getProfileByUsername(
    req.params.username,
  );

  res.json(profile);
});

router.patch("/me", async (req, res) => {
  const profile = await profileService.updateProfile(
    req.user.uid,
    parse(updateProfileSchema, req.body),
  );

  res.json(profile);
});

router.delete("/me", async (req, res) => {
  await profileService.deleteProfile(req.user.uid);

  res.sendStatus(204);
});

export default router;
