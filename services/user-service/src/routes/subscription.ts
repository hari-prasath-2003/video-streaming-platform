import express, { Router } from "express";
import subscriptionService from "../service/SubscriptionService.js";

const router: Router = express.Router();

router.post("/channels/:channelId/subscribe", async (req, res) => {
  const subscription = await subscriptionService.subscribe(
    req.user.uid,
    req.params.channelId,
  );

  res.status(201).json(subscription);
});

router.delete("/channels/:channelId/subscribe", async (req, res) => {
  await subscriptionService.unsubscribe(req.user.uid, req.params.channelId);

  res.sendStatus(204);
});

router.get("/channels/:channelId/subscribers/count", async (req, res) => {
  const result = await subscriptionService.getSubscriberCount(
    req.params.channelId,
  );

  res.json(result);
});

router.get("/users/me/subscriptions", async (req, res) => {
  const subscriptions = await subscriptionService.getMySubscriptions(
    req.user.uid,
  );

  res.json(subscriptions);
});

router.get("/channels/:channelId/subscribed", async (req, res) => {
  const subscribed = await subscriptionService.isSubscribed(
    req.user.uid,
    req.params.channelId,
  );

  res.json({
    subscribed,
  });
});

export default router;
