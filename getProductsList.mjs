import { products } from './products.mjs';

export const getProductsList = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify(products),
  };
};
