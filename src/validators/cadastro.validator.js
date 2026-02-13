import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";
import fs from "fs";
import { validateCNPJ, validateCPF } from "../utils/documentValidators.js";

const empresaSchema = Joi.object({
    cnpj: Joi.string().required().custom((value, helpers) => {
        if (!validateCNPJ(value)) return helpers.message('CNPJ inválido');
        return value;
    }),
    razao_social: Joi.string().min(3).max(255).escapeHTML().required(),
    nome_fantasia: Joi.string().min(3).max(255).escapeHTML().allow('', null),
    email_corp: Joi.string().email().required(),
    telefone: Joi.string().min(10).max(11).escapeHTML().required(),
    nome_resp: Joi.string().min(3).max(100).escapeHTML().required(),
    cpf_resp: Joi.string().required().custom((value, helpers) => {
        if (!validateCPF(value)) return helpers.message('CPF inválido');
        return value;
    }),
    senha: Joi.string().min(8).escapeHTML().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    cep: Joi.string().length(8).escapeHTML().required(),
    estado: Joi.string().escapeHTML().required(),
    cidade: Joi.string().escapeHTML().required(),
    bairro: Joi.string().escapeHTML().required(),
    endereco: Joi.string().escapeHTML().required(),
    numero: Joi.string().escapeHTML().required(),
    complemento: Joi.string().escapeHTML().allow('', null),
    publicKey: Joi.string().escapeHTML().required(),
    privateKey: Joi.string().escapeHTML().required(),
    salt: Joi.string().escapeHTML().required(),
    iv: Joi.string().escapeHTML().required()
});

export const validateRegistration = async (req, res, next) => {
    const { error, value } = empresaSchema.validate(req.body, { abortEarly: false });

    if (error) {
        if (req.files) {
            const allFiles = Object.values(req.files).flat();
            
            await Promise.all(allFiles.map(async (file) => {
                try {
                    await fs.unlink(file.path);
                } catch (err) {
                    console.error(`[-] Failed to delete temp file: ${file.path}`, err);
                }
            }));
        }
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};