import { createProduct } from './productService.mjs';

export const createProduct = async (event) => {
  try {
    console.log('createProduct event: ', event);
    const body = JSON.parse(event.body);
    await createProduct(body);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Product created successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ message: 'Could not create product' }),
    };
  }
};
