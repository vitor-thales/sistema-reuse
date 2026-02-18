import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  res.clearCookie("reuseToken", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.clearCookie("device_secret", {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logout realizado com sucesso" });
});

export default router;