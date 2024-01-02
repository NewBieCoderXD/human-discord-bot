import express, {Request,Response} from "express";
import * as path from "path";
const frontendRouter = express.Router();

// console.log(path.join(__dirname,"../public"))
frontendRouter.use("/",express.static(path.join(__dirname,"../../dist/public")));
frontendRouter.use("/_snowpack",express.static(path.join(__dirname,"../../dist/_snowpack")));


export default frontendRouter;