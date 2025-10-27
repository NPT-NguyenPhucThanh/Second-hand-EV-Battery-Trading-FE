// postService.js
import { post } from '../api'; // Adjust path if needed

export const createPost = async (type, data) => {
  let path;
  if (type === 'car') {
    path = 'api/seller/products/cars';
  } else if (type === 'battery') {
    path = 'api/seller/products/batteries';
  } else {
    throw new Error('Invalid post type');
  }
  const response = await post(path, data);
  return response;
};