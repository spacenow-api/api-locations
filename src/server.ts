import { PORT } from './config';

import App from './App';

import LocationController from './controllers/location.controller';

const app = new App([new LocationController()], PORT, '0.0.0.0');

app.listen();
