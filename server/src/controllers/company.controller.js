import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { COMPANY_INFO } from "../utils/constantCompany.js";

export const getCompanyInfo = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, COMPANY_INFO, "Company info fetched successfully")
  );
});
