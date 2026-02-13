import { JoiHtmlExtension as Joi } from "../utils/joiExtensions.js";

const userSchema = Joi.object({
    nome: Joi.string().min(3).max(100).escapeHTML().required(),
    email: Joi.string().email().escapeHTML().required(),
    cargo: Joi.string().max(25).escapeHTML().required(),
    status: Joi.boolean().required(),
    isAdmin: Joi.boolean().required(),
    manageCategories: Joi.boolean().required(),
    manageSolicitations: Joi.boolean().required(),
    senha: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).escapeHTML().required().allow("")
});

export const validateUserData = async (req, res, next) => {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
    }

    req.body = value;

    next();
};