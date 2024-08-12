import express from 'express';
import paths from './paths.js';
import authGuard from "../middleware/authGuard.js";
import * as utils from "../utils.js";
import Monitor from "../models/Monitor.js";

const router = express.Router();

router.get(paths.app.monitors.list, authGuard, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const result = await Monitor.query().where('userId', req.user.id).page(page - 1, limit);

    const totalPages = Math.ceil(result.results.length / limit);

    const pages = Array.from({length: totalPages}, (_, i) => ({
      number: i + 1,
      active: i + 1 === page
    }));

    res.render('app/monitors', {
      layout: 'main',
      title: 'Monitors list',
      paginator: {
        pages,
        page: page,
        prevPage: page > 1 ? page - 1 : 1,
        nextPage: page < totalPages ? page + 1 : totalPages,
        limit: limit,
        total: result.total,
      },
      monitors: result.results,
    });
  } catch (error) {
    utils.sendError(res, 500, error);
  }
});

export default router;