import { Sequelize } from 'sequelize-typescript';

import * as config from '../../config';

import { Location } from './../../models';

let sequelize: Sequelize;

const initialize = () => {
  if (!sequelize) {
    console.debug('Initializing database.');
    sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.dbEndpoint,
      database: config.dbSchema,
      username: config.dbUsername,
      password: config.dbPassword,
      logging: () => config.DEBUG
    });
    sequelize.addModels([Location]);
  }
};

export default { initialize };
