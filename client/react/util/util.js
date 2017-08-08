export const getUrlQueryParameters = () => {
  const query = location.search.substr(1);
  const result = {};
  query.split('&').forEach(part => {
    const item = part.split('=');
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
};
