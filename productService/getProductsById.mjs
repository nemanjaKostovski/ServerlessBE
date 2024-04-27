import { getProductById } from './productService.mjs';

export const getProductsById = async (event) => {
  try {
    const productId = event.pathParameters.productId;
    const product = await getProductById(productId);

    if (!product) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ message: 'Product not found' }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(product),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
