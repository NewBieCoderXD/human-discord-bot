import express, {Request,Response} from "express";
import * as path from "path";
const frontendRouter = express.Router();

// console.log(path.join(__dirname,"../public"))
frontendRouter.use("/",express.static(path.join(__dirname,"../../public")));


export default frontendRouter;