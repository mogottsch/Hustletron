const rankKey = (key: string) => {
  if (key === 'Control') {
    return 3;
  }
  if (key === 'Shift') {
    return 2;
  }
  if (key === 'Alt') {
    return 1;
  }
  return 0;
};

const displayKeys = (keys: Key[], toUpper = false) => {
  let names = keys.map(({ name }) => name);
  if (toUpper) {
    names = names.map((name) => name.charAt(0).toUpperCase() + name.slice(1));
  }
  names.sort((a, b) => {
    return rankKey(b) - rankKey(a);
  });
  names = names.map((name) => name.replace(/\s/g, 'Space'));
  return names.join(' + ') ?? '';
};

export { displayKeys, rankKey };
