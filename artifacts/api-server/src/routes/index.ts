import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import organizationsRouter from "./organizations.js";
import agentsRouter from "./agents.js";
import chatRouter from "./chat.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(organizationsRouter);
router.use(agentsRouter);
router.use(chatRouter);

export default router;
