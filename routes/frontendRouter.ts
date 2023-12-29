import express from "express";
const frontendRouter = express.Router();

frontendRouter.use("/",express.static(__dirname+"/public"));

export default frontendRouter;