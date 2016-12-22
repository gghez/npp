export function daysBetween(d1, d2) {
    if (typeof d1 == 'string') d1 = new Date(d1);
    if (typeof d2 == 'string') d2 = new Date(d2);

    return Math.round((d1 - d2) / 86400000);
}

export function weeksBetween(d1, d2) {
    return Math.round(daysBetween(d1, d2) / 7);
}
