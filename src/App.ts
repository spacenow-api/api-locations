import express, { Application } from 'express';
import compression from 'compression';
import cookieParse from 'cookie-parser';
import bodyParser from 'body-parser';

import sequelize from './helpers/database/sequelize';
import loggerMiddleware from './helpers/middlewares/logger-middleware';
import errorMiddleware from './helpers/middlewares/error-middleware';
import sequelizeMiddleware from './helpers/middlewares/sequelize-middleware';

class App {
  public app: Application;
  public port: number;
  public host: string;

  constructor(controllers: any, port: number, host: string) {
    this.app = express();
    this.port = port;
    this.host = host;
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
    this.initializeDatabase();
  }

  private initializeMiddlewares(): void {
    this.app.use(loggerMiddleware);
    this.app.use(sequelizeMiddleware);
    this.app.use(bodyParser.json());
    this.app.use(cookieParse());
    this.app.use(compression());
  }

  private initializeErrorHandling(): void {
    this.app.use(errorMiddleware);
  }

  private initializeDatabase(): void {
    sequelize.initialize();
  }

  private initializeControllers(controllers: any): void {
    controllers.forEach((c: any) => this.app.use('/', c.router));
  }

  public listen() {
    this.app.listen(this.port, this.host, () => {
      console.info(`API * Locations * listening on ${this.host}:${this.port}`);
    });
  }
}

export default App;
