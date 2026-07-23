import express from 'express'
import { test } from '../controllers/test.controller.js';

const router = express();


router.get("/t", test)


export default router;