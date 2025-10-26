import { useState, useEffect } from 'react'
import { getSellerUpgradeRequests } from '../../../services/sellerUpgradeService';
import TableSellerUpgrade from './components/TableSellerUpgrade';

export default function SellerUpgradePage() {
   const [sellerUpgrade, setSellerUpgrade] = useState([]);
   const fetchApi = async () => {
      const response = await getSellerUpgradeRequests();
      setSellerUpgrade(response.requests || []);
    };
  useEffect(() => {
    fetchApi();
  }, [])
  const handleReload = () => {
    fetchApi();
  }
  return (
    <>
      <TableSellerUpgrade sellerUpgrade={sellerUpgrade} onReload={handleReload} />
    </>
  )
}

