import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (_: Request, res: Response) => {
	res.send("Hello from the Event Server!");
});

export default router;
