import dotenv from 'dotenv';

dotenv.config();

function required(name) {
    const value = process.env[name];
    if(!value) {
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

    JWT_SECRET: required("JWT_SECRET")
};