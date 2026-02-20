import path from "path";

import { publicDir } from "../utils/paths.js";

export default {
    notFound(req, res) {
        res.status(404);

        if (req.accepts('html')) {
            return res.sendFile(path.join(publicDir, "pages/404.html")); 
        }

        if (req.accepts('json')) {
            return res.json({ error: 'Not found', message: 'A rota solicitada não existe.' });
        }

        res.type('txt').send('Not found');
    },

    forbidden(err, req, res, next) {
        const status = err.status || 500;
        res.status(status);

        if (status === 401) {
            if (req.accepts('html')) {
                res.sendFile(path.join(publicDir, 'pages/401.html'));
                return;
            }
            res.json({ error: 'Unauthorized', message: 'Sessão inválida ou expirada.' });
            return;
        }

        res.json({ error: 'Internal Server Error' });
    }
}