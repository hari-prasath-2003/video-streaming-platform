import express, { Router } from "express";
import searchService from "../service/SearchService.js";
import { parse, searchQuerySchema } from "../validation/index.js";

const router: Router = express.Router();

/**
 * Search profiles and channels.
 * GET /search?q=&limit=
 */
router.get("/", async (req, res) => {
  const { q, limit } = parse(searchQuerySchema, req.query);

  const results = await searchService.search(q, limit);

  res.json(results);
});

export default router;
