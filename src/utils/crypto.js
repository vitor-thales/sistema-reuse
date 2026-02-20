function toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function fromBase64(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export async function generateEncryptedKeyPair(password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    );

    const publicKeyBuffer = await crypto.subtle.exportKey(
        "spki",
        keyPair.publicKey
    );
    const publicKeyBase64 = toBase64(publicKeyBuffer);

    const privateKeyBuffer = await crypto.subtle.exportKey(
        "pkcs8",
        keyPair.privateKey
    );

    const baseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const wrappingKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt,
            iterations: 150_000,
            hash: "SHA-256"
        },
        baseKey,
        { name: "AES-GCM", length: 256},
        false,
        ["encrypt", "decrypt"]
    );

    const encryptedPrivateKey = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        wrappingKey,
        privateKeyBuffer
    );

    return {publicKey: publicKeyBase64, privateKey: toBase64(encryptedPrivateKey), salt: toBase64(salt), iv: toBase64(iv)};
}

export async function changePrivateKeyPassword(
    encryptedPrivateKeyBase64, 
    saltBase64, 
    ivBase64, 
    currentPassword, 
    newPassword
) {
    const encryptedPrivateKeyBuffer = fromBase64(encryptedPrivateKeyBase64);
    const oldSalt = fromBase64(saltBase64);
    const oldIv = fromBase64(ivBase64);

    const oldBaseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(currentPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const oldWrappingKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: oldSalt,
            iterations: 150_000,
            hash: "SHA-256"
        },
        oldBaseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    let rawPrivateKeyBuffer;
    try {
        rawPrivateKeyBuffer = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: oldIv },
            oldWrappingKey,
            encryptedPrivateKeyBuffer
        );
    } catch (error) {
        throw new Error("Invalid current password or corrupted key data.");
    }

    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    const newIv = crypto.getRandomValues(new Uint8Array(12));

    const newBaseKey = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(newPassword),
        "PBKDF2",
        false,
        ["deriveKey"]
    );

    const newWrappingKey = await crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: newSalt,
            iterations: 150_000,
            hash: "SHA-256"
        },
        newBaseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    const newEncryptedPrivateKey = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: newIv },
        newWrappingKey,
        rawPrivateKeyBuffer
    );

    return {
        privateKey: toBase64(newEncryptedPrivateKey),
        salt: toBase64(newSalt),
        iv: toBase64(newIv)
    };
}