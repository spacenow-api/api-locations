import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import axios from "axios";

import authMiddleware from "../../helpers/middlewares/auth-middleware";
import HttpException from "../../helpers/exceptions/HttpException";
import sequelizeErrorMiddleware from "../../helpers/middlewares/sequelize-error-middleware";

import { IGeoResponse } from "../../interfaces/location.interface";
import { RootObject } from "../../interfaces/geoCode.interface";
import { Location, UniqueLocation } from "../../models";

import * as config from "../../config";

const getHash = (suggestAddress: string, userId: string = "") => {
  const stringReference: string = suggestAddress + userId;
  return crypto
    .createHash("sha256")
    .update(stringReference, "utf8")
    .digest("base64");
};

class LocationController {
  private router = Router();

  constructor() {
    this.intializeRoutes();
  }

  async getGoogleGeoCodeAddress(suggestAddress: string): Promise<IGeoResponse> {
    const URL =
      "https://maps.googleapis.com/maps/api/geocode/json?address=" +
      encodeURI(suggestAddress) +
      "&key=" +
      config.googleMapAPI;
    const resp = await axios.get(URL);
    const geoData: RootObject = await resp.data;
    const locationData: any = {};
    if (geoData && geoData.results && geoData.results.length > 0) {
      geoData.results.map(item => {
        item.address_components.map(value => {
          if (
            value.types[0] == "administrative_area_level_1" ||
            value.types[0] == "country"
          ) {
            locationData[value.types[0]] = value.short_name;
          } else {
            locationData[value.types[0]] = value.long_name;
          }
        });
      });
      const city =
        locationData.locality != undefined
          ? locationData.locality
          : locationData.administrative_area_level_2;
      const buildingName =
        (locationData.subpremise != undefined ? locationData.subpremise : "") +
        " " +
        (locationData.premise != undefined ? locationData.premise : "");
      const address1 = locationData.street_number
        ? locationData.street_number + " " + locationData.route
        : locationData.route;
      return Promise.resolve({
        address1: address1,
        buildingName: buildingName,
        country: locationData.country,
        city: city,
        state: locationData.administrative_area_level_1,
        zipcode: locationData.postal_code,
        lat: geoData.results[0].geometry.location.lat,
        lng: geoData.results[0].geometry.location.lng
      });
    } else {
      return Promise.reject();
    }
  }

  private intializeRoutes() {
    /**
     * Get location by id.
     */
    this.router.get(
      "/locations/:id",
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const locationObj: Location | null = await Location.findOne({
            where: { id: req.params.id }
          });
          res.send(locationObj);
        } catch (err) {
          console.error(err);
          sequelizeErrorMiddleware(err, req, res, next);
        }
      }
    );

    /**
     * Get or create location by address.
     */
    this.router.post(
      "/locations",
      authMiddleware,
      async (req: Request, res: Response, next: NextFunction) => {
        const data = req.body;
        try {
          if (!data || !data.suggestAddress) {
            throw new HttpException(
              400,
              "A reference address must be provided."
            );
          }
          const hash = getHash(data.suggestAddress, req.userIdDecoded);
          const uniLocationObj = await UniqueLocation.findOne({
            where: { id: hash }
          });
          if (uniLocationObj) {
            const locationObj = await Location.findOne({
              where: { id: uniLocationObj.locationId }
            });
            res.send(locationObj);
          } else {
            // Creating a new location from Google API data...
            let geoAddress: any;
            try {
              geoAddress = await this.getGoogleGeoCodeAddress(
                data.suggestAddress
              );
            } catch (err) {
              throw new HttpException(
                400,
                `Address ${data.suggestAddress} not found by Google API.`
              );
            }
            const { dataValues }: any = await Location.create({
              ...geoAddress,
              userId: req.userIdDecoded,
              buildingName: data.unit,
              placeId: data.placeId
            });
            await UniqueLocation.create({
              id: hash,
              locationId: dataValues.id
            });
            res.send({ ...dataValues });
          }
        } catch (err) {
          console.error(err);
          sequelizeErrorMiddleware(err, req, res, next);
        }
      }
    );
  }
}

export default LocationController;
