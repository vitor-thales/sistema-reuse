import Joi from "joi";
import { validateCNPJ, validateCPF } from "../utils/documentValidators.js";

const empresaSchema = Joi.object({
    cnpj: Joi.string().required().custom((value, helpers) => {
        if (!validateCNPJ(value)) return helpers.message('CNPJ inválido');
        return value;
    }),
    razao_social: Joi.string().min(3).max(255).required(),
    nome_fantasia: Joi.string().min(3).max(255).allow('', null),
    email_corp: Joi.string().email().required(),
    telefone: Joi.string().min(10).max(11).required(),
    nome_resp: Joi.string().min(3).max(100).required(),
    cpf_resp: Joi.string().required().custom((value, helpers) => {
        if (!validateCPF(value)) return helpers.message('CPF inválido');
        return value;
    }),
    senha: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    cep: Joi.string().length(8).required(),
    estado: Joi.string().required(),
    cidade: Joi.string().required(),
    bairro: Joi.string().required(),
    endereco: Joi.string().required(),
    numero: Joi.string().required(),
    complemento: Joi.string().allow('', null),
    publicKey: Joi.string().required(),
    privateKey: Joi.string().required(),
    salt: Joi.string().required(),
    iv: Joi.string().required()
});

export const validateRegistration = (req, res, next) => {
    const { error } = empresaSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    next();
}