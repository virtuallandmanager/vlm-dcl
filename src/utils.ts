export const findItem = (array: any[] = [], condition: CallableFunction) => {
  for (let i = 0; i < array.length; i++) {
    if (condition(array[i], i)) {
      return array[i];
    }
  }
};

export const findIndex = (array: any[] = [], condition: CallableFunction) => {
  for (let i = 0; i < array.length; i++) {
    if (condition(array[i], i)) {
      return i;
    }
  }
};

export const includes = (array: any[] = [], searchItem: any) => {
  for (let i = 0; i < array.length; i++) {
    if (JSON.stringify(array[i]) === JSON.stringify(searchItem)) {
      return true;
    }
  }
};
