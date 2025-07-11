import { ApiError } from "../utils/ApiError.js";

export const roleBasedAccess = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;

    // Step 1: Ensure user is authenticated and injected by verifyJWT
    if (!user || !user.role) {
      throw new ApiError(401, "User authentication required before role check");
    }

    // Step 2: Role normalization & validation
    const userRole = String(user.role).toLowerCase().trim();
    const allowed = allowedRoles.map((r) => String(r).toLowerCase().trim());

    // Optional: Console log for audit/debug (remove in prod)
    // console.log(`User role: ${userRole}, Allowed roles: ${allowed.join(", ")}`);

    // Step 3: Access check
    if (!allowed.includes(userRole)) {
      throw new ApiError(403, `Access denied. '${userRole}' role is not allowed`);
    }

    // Step 4: Proceed
    next();
  };
};
