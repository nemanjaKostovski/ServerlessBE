import { getProductList } from './productService.mjs';

export const getProductsListHandler = async (event) => {
  try {
    console.log('getProductList event: ', event);
    const products = await getProductList();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(products),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
