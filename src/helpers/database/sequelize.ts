import { Sequelize } from 'sequelize-typescript';

import * as config from '../../config';

import { Location } from './../../models';

let sequelize: Sequelize;

const initialize = () => {
  if (!sequelize) {
    console.debug('Initializing database.');
    sequelize = new Sequelize({
      dialect: 'mysql',
      host: config.dbHost,
      database: config.dbSchema,
      username: config.dbUsername,
      password: config.dbPassword,
      logging: config.DEBUG ? console.debug : false
    });
    sequelize.addModels([Location]);
  }
};

export default { initialize };
