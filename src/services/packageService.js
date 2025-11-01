// src/services/packageService.js
import { useState, useCallback } from 'react';
import { get, post, put, del } from '../utils/api';

export const usePackages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // === ADMIN: LẤY DANH SÁCH GÓI ===
  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await get("api/manager/packages");
      setPackages(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.message || "Lỗi tải gói";
      setError(msg);
      console.error("fetchPackages error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // === ADMIN: THÊM GÓI ===
  const addPackage = useCallback(async (newPackage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await post('api/manager/packages', newPackage);
      setPackages(prev => [result, ...prev]);
      return result;
    } catch (err) {
      setError(err.message || "Lỗi tạo gói");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // === ADMIN: SỬA GÓI ===
  const updatePackage = useCallback(async (packageId, updatedPackage) => {
    try {
      setLoading(true);
      setError(null);
      const result = await put(`api/manager/packages/${packageId}`, updatedPackage);
      setPackages(prev => prev.map(p => p.packageid === packageId ? result : p));
      return result;
    } catch (err) {
      setError(err.message || "Lỗi cập nhật gói");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // === ADMIN: XÓA GÓI ===
  const deletePackage = useCallback(async (packageId) => {
    try {
      setLoading(true);
      setError(null);
      await del(`api/manager/packages/${packageId}`);
      setPackages(prev => prev.filter(p => p.packageid !== packageId));
    } catch (err) {
      setError(err.message || "Lỗi xóa gói");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // === PUBLIC: LẤY GÓI ĐỂ MUA ===
  const getPublicPackages = useCallback(async () => {
    try {
      const data = await get("api/public/package-services");
      const list = data?.packages || data || [];
      return Array.isArray(list) ? list : [];
    } catch (err) {
      console.error("getPublicPackages error:", err);
      return [];
    }
  }, []);

  // === PUBLIC: LẤY GÓI THEO ID ===
  const getPackageById = useCallback(async (packageid) => {
    const list = await getPublicPackages();
    const pkg = list.find(p => p.packageid === parseInt(packageid));
    if (!pkg) throw new Error("Gói không tồn tại");
    return pkg;
  }, [getPublicPackages]);

  return {
    // Admin
    packages,
    loading,
    error,
    fetchPackages,
    addPackage,
    updatePackage,
    deletePackage,

    // Public
    getPublicPackages,
    getPackageById,
  };
};