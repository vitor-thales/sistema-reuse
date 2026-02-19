// Storage Register Progress

const STORAGE_KEY = "reuse_register_progress_v1";
const TTL_HOURS = 4;

function now() {
    return Date.now();
}

function expiresAt() {
    return now() + TTL_HOURS * 60 * 60 * 1000;
}

export function saveStep(step, data) {
    const stored = loadRaw() || {
        steps: {},
        lastStep: 0,
        expiresAt: expiresAt()
    };

    stored.steps[step] = data;
    stored.lastStep = Math.max(stored.lastStep, step);
    stored.expiresAt = expiresAt();

    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

export function loadProgress() {
    const stored = loadRaw();
    if (!stored) return null;

    if (now() > stored.expiresAt) {
        clearProgress();
        return null;
    }

    return stored;
}

export function clearProgress() {
    localStorage.removeItem(STORAGE_KEY);
}

function loadRaw() {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}
