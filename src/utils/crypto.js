function toBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
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