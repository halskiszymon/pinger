import express from 'express';
import paths from './paths.js';
import authGuard from "../middleware/authGuard.js";
import utils from "../utils.js";
import Monitor from "../models/Monitor.js";
import monitoring from "../monitoring.js";

const router = express.Router();

const validateMonitorInput = (type, name, address, interval, notifyEmailAddresses) => {
  if (!name || !interval || !type || !address) {
    throw new Error('400 - All fields are required.');
  }

  const httpRegex = /^https?:\/\/[a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(\/.*)?$/;
  const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipPortRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?):\d{1,5}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // todo: check name length
  if (isNaN(interval)) {
    throw new Error('400 - Invalid interval provided.');
  }
  if (type === 'http' && !httpRegex.test(address)) {
    throw new Error('400 - Please enter a valid URL.');
  } else if (type === 'ping' && !ipRegex.test(address)) {
    throw new Error('400 - Please enter a valid IP address.');
  } else if (type === 'port' && !ipPortRegex.test(address)) {
    throw new Error('400 - Please enter a valid IP address with a port.');
  }

  if (notifyEmailAddresses.trim() === '') {
    throw new Error('400 - Please enter valid email address(es) separated by commas.');
  } else {
    const emails = notifyEmailAddresses.split(',').map(email => email.trim());
    for (let email of emails) {
      if (!emailRegex.test(email)) {
        throw new Error('400 - Please enter valid email address(es) separated by commas.');
      }
    }
  }
}

router.get(paths.app.monitors.list, authGuard, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const result = await Monitor.query().where('userId', req.user.id).orderBy('id', 'desc').page(page - 1, limit);

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

router.get(paths.app.monitors.create, authGuard, async (req, res) => {
  res.render('app/create-monitor', {
    layout: 'main',
    title: 'Create new Monitor'
  });
});

router.post(paths.app.monitors.create, authGuard, async (req, res) => {
  const {type, name, address, interval, notifyEmailAddresses} = req.body;

  try {
    validateMonitorInput(type, name, address, interval, notifyEmailAddresses);

    const monitor = await Monitor.query().insert({
      type,
      name,
      address,
      interval: parseInt(interval),
      notifyEmailAddresses,
      userId: req.user.id
    });

    await monitoring.addMonitor(req.app, monitor);

    res.redirect(`${paths.app.monitors.list}?saved`);
  } catch (error) {
    console.error(error);

    // todo: add previous fields values

    if (error.message.startsWith('400 - ')) {
      res.redirect(`${paths.app.monitors.create}?invalid-input`);
    } else {
      res.redirect(`${paths.app.monitors.create}?app-error`);
    }
  }
});

router.get(paths.app.monitors.edit, authGuard, async (req, res) => {
  try {
    const monitor = await Monitor.query().findById(req.params.id);

    if (!monitor) {
      return utils.sendError(res, 400, 'Monitor not found.');
    }

    res.render('app/edit-monitor', {monitor});
  } catch (error) {
    utils.sendError(res, 500, error);
  }
});

router.post(paths.app.monitors.edit, authGuard, async (req, res) => {
  const {type, name, address, interval, notifyEmailAddresses} = req.body;

  try {
    validateMonitorInput(type, name, address, interval, notifyEmailAddresses);

    const monitor = await Monitor.query().findById(req.params.id);

    if (!monitor) {
      throw new Error('404 - Monitor not found.');
    }

    const updatedMonitor = await monitor
      .$query()
      .patchAndFetch({
        type,
        name,
        address,
        interval: parseInt(interval),
        notifyEmailAddresses
      });

    await monitoring.addMonitor(req.app, updatedMonitor);

    res.redirect(`${paths.app.monitors.edit.replace(':id', req.params.id)}?saved`);
  } catch (error) {
    console.error(error);

    if (error.message.startsWith('400 - ')) {
      res.redirect(`${paths.app.monitors.edit.replace(':id', req.params.id)}?invalid-input`);
    } else {
      res.redirect(`${paths.app.monitors.edit.replace(':id', req.params.id)}?app-error`);
    }
  }
});

router.get(paths.app.monitors.delete, authGuard, async (req, res) => {
  const id = req.params.id;

  try {
    const monitor = await Monitor.query().findById(id);

    if (!monitor) {
      throw new Error('404 - Monitor not found.');
    }

    await monitor.$query().delete();

    await monitoring.removeMonitor(req.app, monitor);

    res.redirect(paths.app.monitors.list);
  } catch (error) {
    console.error(error);

    if (error.message.startsWith('400 - ')) {
      res.redirect(`${paths.app.monitors.list}?invalid-input`);
    } else {
      res.redirect(`${paths.app.monitors.list}?app-error`);
    }
  }
});

export default router;