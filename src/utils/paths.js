<<<<<<< HEAD
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.join(__dirname, "../../");

export const srcDir = path.join(__dirname, "../");

=======
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const rootDir = path.join(__dirname, "../../");

export const srcDir = path.join(__dirname, "../");

>>>>>>> 59aa0b15c2bf03ec5f160db01d20928fd82479a7
export const publicDir = path.join(__dirname, "../../public");