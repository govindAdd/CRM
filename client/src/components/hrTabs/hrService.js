    // Example only – implement with axios/fetch
export const getAllHRRecords = async () => { /* GET /api/v1/hr */ };
export const createHRRecord = async (data) => { /* POST */ };
export const updateHRRecord = async (id, data) => { /* PUT */ };
export const deleteHRRecord = async (id) => { /* DELETE */ };
export const restoreHRRecord = async (id) => { /* PATCH /restore */ };
export const bulkUpdateHRRecords = async (ids, data) => { /* PATCH /bulk */ };
export const exportHRData = async () => { /* GET /export */ };
export const searchHRRecords = async (query) => { /* GET /search?q= */ };
