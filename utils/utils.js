exports.parseDateFieldWithMap = (rows) => {
    return rows.map((row) => {
        const rowCopy = { ...row };
        rowCopy.created_at = Date.parse(rowCopy.created_at);
        return rowCopy;
    });
};
