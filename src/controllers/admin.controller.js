import path from "path";

import { publicDir } from "../utils/paths.js"

export default {
    async getDashboard(req, res) {
        res.sendFile(path.join(publicDir, "pages/admin.dashboard.html"));
    }
}