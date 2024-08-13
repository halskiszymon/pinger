import Monitor from "./models/Monitor.js";
import ping from "ping";
import axios from "axios";

async function addMonitor(app, monitor) {
  console.log(new Date().toISOString(true), `Adding ${monitor.name} to monitoring.`)

  if (app.locals.monitoringIntervals[monitor.id]) {
    clearInterval(app.locals.monitoringIntervals[monitor.id]);
  }

  app.locals.monitoringIntervals[monitor.id] = setInterval(async () => {
    let status = false;

    try {
      if (monitor.type === 'http') {
        const response = await axios.get(monitor.address);
        status = response.status === 200;
      } else if (monitor.type === 'ping' || monitor.type === 'port') {
        const res = await ping.promise.probe(monitor.address);
        status = res.alive;
      }
    } catch (err) {
      status = false;
    }

    console.log(new Date().toISOString(true), `Monitor ${monitor.name} is ${status}.`);
  }, monitor.interval * 60 * 1000);
}

async function removeMonitor(app, monitor) {
  console.log(new Date().toISOString(true), `Removing ${monitor.name} from monitoring.`);

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