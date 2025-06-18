function convertNumberToDate(num) {
    const str = num.toString().padStart(8, '0');
    const month = str.slice(0, 1);
    const day = str.slice(1, 3);
    const year = str.slice(3);
    return `${month}/${day}/${year}`;
}

export { convertNumberToDate };