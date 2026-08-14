import express, { Router } from "express";
import searchService from "../service/SearchService.js";
import { parse, searchQuerySchema } from "../validation/index.js";

const router: Router = express.Router();

/**
 * Unified search across people, channels and videos.
 * GET /search?q=&limit=&cursor=&type=all|profile|channel|video
 */
router.get("/", async (req, res) => {
  const query = parse(searchQuerySchema, req.query);

  const results = await searchService.search(query, req.user);

  res.json(results);
});

export default router;
