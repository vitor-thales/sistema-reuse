import Joi from "joi";
import { validateCNPJ } from "../utils/documentValidators.js";

const resetPassSchema = Joi.object({
    cnpj: Joi.string().required().custom((value, helpers) => {
        if (!validateCNPJ(value)) return helpers.message("O CNPJ inserido é inválido!")
    })
});

export const validateResetPass = async (req, res, next) => {
    const { error } = resetPassSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessage = error.details.map(err => err.message);
        return res.status(400).json({ error: errorMessage });
    }

    next();
};