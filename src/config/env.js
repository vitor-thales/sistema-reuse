import dotenv from "dotenv";

dotenv.config();

function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Variável de ambiente ${name} não definida`);
    }
    return value;
}

export const env = {
    PORT: Number(process.env.PORT || 8080),

    DB_HOST: required("DB_HOST"),
    DB_USER: required("DB_USER"),
    DB_PASS: required("DB_PASS"),
    DB_NAME: required("DB_NAME"),

    JWT_SECRET: required("JWT_SECRET"),
    TFAUTH_JWT_SECRET: required("TFAUTH_JWT_SECRET"),
    ADMIN_JWT_SECRET: required("ADMIN_JWT_SECRET"),
    TOKEN_EXPIRY: parseInt(required("TOKEN_EXPIRY")),
    SALT: parseInt(required("SALT")),

    SMTP_SERVER: required("SMTP_SERVER"),
    SMTP_PORT: required("SMTP_PORT"),
    BREVO_LOGIN: required("BREVO_LOGIN"),
    BREVO_PASS: required("BREVO_PASS"),
    MAIL_NAME: required("MAIL_NAME"),
    MAIL_SENDER: required("MAIL_SENDER")
};
