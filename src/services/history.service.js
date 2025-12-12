import History from "@/models/History.model";

export async function createHistory({ userId, action = "create", resource = "sale", resourceId, description, businessId }, session = null) {
  const historyData = {
    user: userId,
    actions: action,
    resource,
    resourceId,
    description
  };

  if (businessId) {
    historyData.business = businessId;
  }

  await History.create([historyData], { session });
}