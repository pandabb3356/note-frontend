export const isMatch = (data, query, keyword) => {
    return data[query].toLowerCase().includes(keyword.toLowerCase());
};

export const isFullMatch = (data, query, keyword) => {
    return data[query].toLowerCase() === keyword.toLowerCase();
};
