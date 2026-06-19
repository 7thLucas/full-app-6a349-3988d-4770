// Import global routes
import { Router } from "express";
import discoveredRoutes from "./routes";
import { initializeModels } from "./models";

// Initialize module-discovered models
await initializeModels();

// ── Hong Tang domain wiring (lives under app/api, not a module) ───────────────
// Register domain Typegoose models so Mongoose knows their schemas.
import "./domain/models/outlet.model";
import "./domain/models/menu-item.model";
import "./domain/models/order.model";
import "./domain/models/transaction.model";
import "./domain/models/referral.model";
import "./domain/models/reward-redemption.model";
import domainRoutes from "./domain/routes/domain.routes";

const router = Router();
router.use(discoveredRoutes);
router.use(domainRoutes);

export default router;
