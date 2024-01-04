import express from "express";
import expressWS from "express-ws"

const app = express();
expressWS(app);

export default app;