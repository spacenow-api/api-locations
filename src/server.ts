import { PORT } from "./config";

import App from "./App";

import LocationController from "./controllers/locations/location.controller";
import HealthController from "./controllers/health/health.controller";

const app = new App(
  [new HealthController(), new LocationController()],
  PORT,
  "0.0.0.0"
);

app.listen();
