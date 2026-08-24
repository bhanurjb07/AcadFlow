import createApp from "./app.js";
import { env } from './config/env.js';
import logger from "./utils/logger.js";

let server = null;
//Server start
const startServer=async()=>{
  try{
    logger.info(`Starting server in ${env.nodeEnv} mode`);

    const app=createApp();

    server = app.listen(env.port, ()=>{
      logger.success(`Server listening on port ${env.port}`);
    });


  }catch (error: unknown){
    logger.error(`Failed to start server: ${ error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

startServer();