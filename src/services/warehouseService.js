import { useState, useCallback } from 'react';
import { get } from '../utils/api'; 

export const useWarehouseProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
      const data = await get("api/manager/warehouse"); 
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
  }, []);

  return { products, loading, fetchProducts };
};