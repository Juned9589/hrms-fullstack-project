// import { ApiError } from "../utils/ApiError.js"
// import Tenant from "../models/Tenant.model.js"
// import asyncHandler from "../utils/asyncHandler.js"

// const verifyTenant = asyncHandler(async (req, res, next) => {
//     // Determine tenant ID from various possible sources
//     const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId;
//     if (!tenantId) {
//         throw new ApiError(400, "Tenant not found in request");
//     }
//     // Fetch tenant document
//     const tenant = await Tenant.findById(tenantId);
//     if (!tenant) throw new ApiError(404, "Tenant not found");
//     if (!tenant.isActive) throw new ApiError(403, "Tenant account is suspended");
//     // Attach tenant and tenantId to request for downstream handlers
//     req.tenant = tenant;
//     req.tenantId = tenantId;
//     if (req.user) {
//         req.user.tenantId = tenantId; // Ensure user object has tenantId
//     }
//     next();
// });

// export { verifyTenant }

import { ApiError } from "../utils/ApiError.js"
import Tenant from "../models/Tenant.model.js"
import asyncHandler from "../utils/asyncHandler.js"

const verifyTenant = asyncHandler(async (req, res, next) => {
    // Determine tenant ID from various possible sources
    const tenantId =
        req.headers['x-tenant-id'] ||
        req.user?.tenantId?.toString() ||
        null;

    if (!tenantId) {
        throw new ApiError(400, "Tenant ID not found — make sure you are logged in properly");
    }

    // Fetch tenant document
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) throw new ApiError(404, "Tenant not found");
    if (!tenant.isActive) throw new ApiError(403, "Tenant account is suspended");

    // Attach tenant and tenantId to request for downstream handlers
    req.tenant = tenant;
    req.tenantId = tenantId;
    if (req.user) {
        req.user.tenantId = tenantId;
    }

    next();
});

export { verifyTenant }