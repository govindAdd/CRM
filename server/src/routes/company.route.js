import express from "express";
import { getCompanyInfo } from "../controllers/company.controller.js";

const router = express.Router();

router.get("/info", getCompanyInfo);

export default router;
