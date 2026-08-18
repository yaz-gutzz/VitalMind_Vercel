import { buildPersonalizedRecommendations } from "../services/recommendations.service.js";

export async function getRecommendations(req, res, next) {
  try {
    const userId = req.user?.sub ?? req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "No se pudo identificar al usuario autenticado.",
      });
    }

    const result = await buildPersonalizedRecommendations(
      BigInt(userId),
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      "Recommendations controller error:",
      error,
    );

    return next(error);
  }
}