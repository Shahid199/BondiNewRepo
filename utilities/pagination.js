const pagination = (totalCount, currentPage) => {
  const perPage = 5;
  let hasPrevPage = false;
  let hasNextPage = false;
  let skippedIndex = (currentPage - 1) * perPage;
  let totalPages = Math.ceil(totalCount / perPage);
  if (currentPage >= totalPages) {
    hasPrevPage = false;
    hasNextPage = false;
  } else if (currentPage == 1) {
    hasPrevPage = false;
    hasNextPage = true;
  } else if (Math.ceil(totalCount / perPage) == currentPage) {
    hasNextPage = false;
    hasPrevPage = true;
  } else {
    hasNextPage = true;
    hasPrevPage = true;
  }
  let paginateData = {
    totalCount: Number(totalCount),
    currentPage: Number(currentPage),
    perPage: Number(perPage),
    hasNextPage: Boolean(hasNextPage),
    hasPrevPage: Boolean(hasPrevPage),
    totalPages: Number(totalPages),
    skippedIndex: Number(skippedIndex),
  };
  return paginateData;
};
module.exports = pagination;
