import { db } from "../config/database.js";

export default {

  async getByEmpresaId(idEmpresa) {
    const [rows] = await db.query(
      "SELECT * FROM tbConfigEmpresas WHERE idEmpresa = ?",
      [idEmpresa]
    );
    return rows[0];
  },

  async upsert(idEmpresa, data) {
    const sql = `
      INSERT INTO tbConfigEmpresas (
        idEmpresa,
        notMsgEmpresas,
        notAttAnuncios,
        privPerfilPrivado,
        privMostrarEmail,
        privMostrarFone,
        privMostrarEndCompleto,
        privMostrarCNPJ,
        privMostrarRazaoSocial,
        segAutDuasEtapas,
        aparenciaTema
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        notMsgEmpresas = VALUES(notMsgEmpresas),
        notAttAnuncios = VALUES(notAttAnuncios),
        privPerfilPrivado = VALUES(privPerfilPrivado),
        privMostrarEmail = VALUES(privMostrarEmail),
        privMostrarFone = VALUES(privMostrarFone),
        privMostrarEndCompleto = VALUES(privMostrarEndCompleto),
        privMostrarCNPJ = VALUES(privMostrarCNPJ),
        privMostrarRazaoSocial = VALUES(privMostrarRazaoSocial),
        segAutDuasEtapas = VALUES(segAutDuasEtapas),
        aparenciaTema = VALUES(aparenciaTema)
    `;

    await db.query(sql, [
      idEmpresa,
      data.notMsgEmpresas ?? true,
      data.notAttAnuncios ?? true,
      data.privPerfilPrivado ?? false,
      data.privMostrarEmail ?? true,
      data.privMostrarFone ?? true,
      data.privMostrarEndCompleto ?? false,
      data.privMostrarCNPJ ?? false,
      data.privMostrarRazaoSocial ?? true,
      data.segAutDuasEtapas ?? false,
      data.aparenciaTema ?? 1
    ]);
  }
};
