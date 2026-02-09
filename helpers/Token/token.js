import jwt from "jsonwebtoken";

//TOKEN HELPERS
export const createAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "24h" }); //24hour
};

export const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" }); // 7 days
};