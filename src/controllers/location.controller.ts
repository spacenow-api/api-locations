import { Router, Request, Response, NextFunction, response } from 'express';
import crypto from 'crypto';

import HttpException from '../helpers/exceptions/HttpException';

import sequelizeErrorMiddleware from '../helpers/middlewares/sequelize-error-middleware';

import { Location, UniqueLocation } from '../models';

const getHash = (suggestAddress: string) => {
  return crypto
    .createHash('sha256')
    .update(suggestAddress, 'utf8')
    .digest('base64');
};

class LocationController {
  private router = Router();

  constructor() {
    this.intializeRoutes();
  }

  private intializeRoutes() {
    /**
     * Get location by id.
     */
    this.router.get(
      '/locations/:id',
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const locationObj: Location = await Location.findOne({
            where: { id: req.params.id }
          });
          res.send(locationObj);
        } catch (error) {
          sequelizeErrorMiddleware(error, req, res, next);
        }
      }
    );

    /**
     * Get or create location by address.
     */
    this.router.post(
      '/locations',
      async (req: Request, res: Response, next: NextFunction) => {
        const data = req.body;
        try {
          if (!data.suggestAddress) {
            next(new HttpException(400, 'A reference address must be provided.'));
          }
          const hash = getHash(data.suggestAddress);
          const uniLocationObj = await UniqueLocation.findOne({ where: { id: hash } });
          if (uniLocationObj) {
            const locationObj = await Location.findOne({ where: { id: uniLocationObj.locationId } });
            res.send(locationObj);
          } else {
            // Creating a new location...
            const locationObj = {
              userId: data.userId, // TODO Remove user id and get from token...
              country: data.country,
              address1: data.address1,
              address2: data.address2,
              buildingName: data.buildingName,
              city: data.city,
              state: data.state,
              zipcode: data.zipcode,
              lat: data.lat,
              lng: data.lng
            };
            const { dataValues } = await Location.create(locationObj);
            await UniqueLocation.create({ id: hash, locationId: dataValues.id });
            res.send({ ...dataValues });
          }
        } catch (error) {
          sequelizeErrorMiddleware(error, req, res, next);
        }
      }
    );
  }
}

export default LocationController;
