import { db } from "../config/database.js";

export default {

  async getByEmpresaId(idEmpresa) {
    const [rows] = await db.query(
      `SELECT e.nomeFantasia, e.cnpj, e.razaoSocial, e.emailCorporativo, e.foneCorporativo, 
              e.descricao, e.cepEmpresa, e.estado, e.cidade, e.bairro, e.endereco, 
              e.numEndereco, e.compEndereco,
            c.privPerfilPrivado, c.privMostrarEmail, 
              c.privMostrarFone, c.privMostrarEndCompleto, c.privMostrarCNPJ, 
              c.privMostrarRazaoSocial, c.segAutDuasEtapas, c.aparenciaTema
       FROM tbEmpresas e
       LEFT JOIN tbConfigEmpresas c ON e.idEmpresa = c.idEmpresa
       WHERE e.idEmpresa = ?;`,
      [idEmpresa]
    );
    return rows[0];
  },

  async updateFullConfig(idEmpresa, data) {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        const sqlEmpresa = `
            UPDATE tbEmpresas SET 
                emailCorporativo = ?,
                foneCorporativo = ?,
                descricao = ?,
                cepEmpresa = ?,
                cidade = ?,
                endereco = ?,
                bairro = ?,
                estado = ?,
                numEndereco = ?,
                compEndereco = ?
            WHERE idEmpresa = ?
        `;
        
        await connection.query(sqlEmpresa, [
            data.emailCorporativo,
            data.foneCorporativo,
            data.descricao,
            data.cepEmpresa,
            data.cidade,
            data.endereco,
            data.bairro,
            data.estado,
            data.numEndereco,
            data.compEndereco,
            idEmpresa
        ]);

        const sqlConfig = `
            INSERT INTO tbConfigEmpresas (
                idEmpresa, privPerfilPrivado,
                privMostrarEmail, privMostrarFone, privMostrarEndCompleto,
                privMostrarCNPJ, privMostrarRazaoSocial, segAutDuasEtapas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                privPerfilPrivado = VALUES(privPerfilPrivado),
                privMostrarEmail = VALUES(privMostrarEmail),
                privMostrarFone = VALUES(privMostrarFone),
                privMostrarEndCompleto = VALUES(privMostrarEndCompleto),
                privMostrarCNPJ = VALUES(privMostrarCNPJ),
                privMostrarRazaoSocial = VALUES(privMostrarRazaoSocial),
                segAutDuasEtapas = VALUES(segAutDuasEtapas)
        `;

        await connection.query(sqlConfig, [
            idEmpresa,
            data.privPerfilPrivado ?? false,
            data.privMostrarEmail ?? true,
            data.privMostrarFone ?? true,
            data.privMostrarEndCompleto ?? false,
            data.privMostrarCNPJ ?? false,
            data.privMostrarRazaoSocial ?? true,
            data.segAutDuasEtapas ?? false
        ]);

        await connection.commit();
        return true;
    } catch (error) {
        await connection.rollback();
        console.error("Transaction Error:", error);
        throw error;
    } finally {
        connection.release();
    }
  }
};
