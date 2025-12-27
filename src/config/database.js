import { env } from '../config/env.js';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME
});