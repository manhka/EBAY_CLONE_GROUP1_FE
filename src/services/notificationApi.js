import apiInterceptor from "./apiInterceptor";

export const fetchUserNotifications = async () => {
  const res = await apiInterceptor.get("/user-activity/activity");
  return res.data;
};