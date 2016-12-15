
export function daysBetween(d1, d2) {
    return (d1 - d2) / 86400000;
}

export function daysSince(pastDate) {
    const now = new Date();
    return daysBetween(now, pastDate);
}
