import History from "@/models/History.model";

export async function createHistory({ userId, action = "create", resource = "sale", resourceId, description }, session = null) {
  await History.create([{
    user: userId,
    actions: action,
    resource,
    resourceId,
    description
  }], { session });
}