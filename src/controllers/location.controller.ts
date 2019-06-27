import { Router, Request, Response, NextFunction } from 'express';

import sequelizeErrorMiddleware from '../helpers/middlewares/sequelize-error-middleware';

import { Location } from '../models';

class LocationController {
  private router = Router();

  constructor() {
    this.intializeRoutes();
  }

  private intializeRoutes() {
    this.router.get(
      '/locations/:id',
      async (request: Request, response: Response, next: NextFunction) => {
        try {
          const locationObj: Location = await Location.findOne({
            where: { id: request.params.id }
          });
          response.send(locationObj);
        } catch (error) {
          console.error(error);
          sequelizeErrorMiddleware(error, request, response, next);
        }
      }
    );
  }
}

export default LocationController;
