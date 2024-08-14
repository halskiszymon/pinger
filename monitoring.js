import Monitor from "./models/Monitor.js";
import ping from "ping";
import axios from "axios";
import MonitorLog from "./models/MonitorLog.js";
import Email from "./nodemailer.js";
import * as net from "node:net";

async function checkPort(address) {
  return new Promise((resolve) => {
    const [host, port] = address.split(':');
    const socket = new net.Socket();

    socket.setTimeout(3000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, host);
  });
}

async function addMonitor(app, monitor) {
  // console.log(new Date().toISOString(true), `Adding ${monitor.name} to monitoring.`)

  if (app.locals.monitoringIntervals[monitor.id]) {
    clearInterval(app.locals.monitoringIntervals[monitor.id]);
  }

  app.locals.monitoringIntervals[monitor.id] = setInterval(async () => {
    let status = false;

    try {
      if (monitor.type === 'http') {
        const response = await axios.get(monitor.address);
        status = response.status === 200;
      } else if (monitor.type === 'ping') {
        const res = await ping.promise.probe(monitor.address);
        status = res.alive;
      } else if (monitor.type === 'port') {
        status = await checkPort(monitor.address);
      }
    } catch (err) {
      status = false;
    }

    const lastLog = await MonitorLog.query().where({monitorId: monitor.id}).orderBy('id', 'desc').first();

    if (!lastLog || lastLog.status !== status) {
      await MonitorLog.query().insert({
        status,
        monitorId: monitor.id,
      });

      if (!status) {
        for (const email of monitor.notifyEmailAddresses.split(',')) {
          await new Email(email).sendMonitorIsDown(monitor);
        }
      } else if (lastLog && !lastLog.status && status) {
        for (const email of monitor.notifyEmailAddresses.split(',')) {
          await new Email(email).sendMonitorIsUp(monitor);
        }
      }
    }

    // console.log(new Date().toISOString(true), `Monitor ${monitor.name} is ${status}.`);
  }, monitor.interval * 60 * 1000);
}

async function removeMonitor(app, monitor) {
  // console.log(new Date().toISOString(true), `Removing ${monitor.name} from monitoring.`);

  if (app.locals.monitoringIntervals[monitor.id]) {
    clearInterval(app.locals.monitoringIntervals[monitor.id]);
    delete app.locals.monitoringIntervals[monitor.id];
  }
}

async function init(app) {
  const monitors = await Monitor.query();

  monitors.forEach(monitor => {
    addMonitor(app, monitor);
  });
}

export default {
  addMonitor,
  removeMonitor,
  init
}