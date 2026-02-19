<<<<<<< HEAD
import { env } from '../config/env.js';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME
=======
import { env } from '../config/env.js';
import mysql from 'mysql2/promise';

export const db = mysql.createPool({
    host: env.DB_HOST,
    user: env.DB_USER,
    password: env.DB_PASS,
    database: env.DB_NAME
>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
});