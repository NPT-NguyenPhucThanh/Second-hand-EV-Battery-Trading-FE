import { useState, useCallback } from 'react';
import { get, post, put, del } from '../utils/api'; 

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
      const data = await get("api/manager/packages");
      setPackages(Array.isArray(data) ? data : []);
      setLoading(false);
  }, []);

  const addPackage = async (newPackage) => {
      await post('api/manager/packages', newPackage); 
      fetchPackages(); 
  };

  const updatePackage = async (packageId, updatedPackage) => {
      await put(`api/manager/packages/${packageId}`, updatedPackage);
      fetchPackages(); 
  };

  const deletePackage = async (packageId) => {
      await del(`api/manager/packages/${packageId}`);
      fetchPackages(); 
  };

  return { packages, loading, fetchPackages, addPackage, updatePackage, deletePackage };
};