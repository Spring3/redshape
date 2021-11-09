const indexById = <T extends { id: number }>(array: Array<T>): Record<number, T> => array.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});

export {
  indexById
};
