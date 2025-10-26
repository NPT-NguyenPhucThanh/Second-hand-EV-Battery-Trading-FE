// components/WarehouseAdd.jsx

import React from 'react';
import { Button, Popconfirm, message } from 'antd';
import { addProduct } from '../../../../services/warehouseService'; // Giả định bạn có hàm này

export default function WarehouseAdd({ record, onReload, type }) {
  const [messageApi, contextHolder] = message.useMessage();

  const handleConfirm = async () => {
    try {
      const response = await addProduct(record.productid); 
      
      // ĐIỀU KIỆN KIỂM TRA MỚI
      // Bây giờ chúng ta chỉ cần kiểm tra xem có nhận được phản hồi hay không
      // (vì hàm post đã xử lý lỗi)
      if (response) { 
        await messageApi.success(`Nhập kho thành công sản phẩm "${record.productname}"!`);
        onReload();
      } else {
        // Trường hợp này hiếm khi xảy ra nếu API trả về lỗi
        throw new Error("Không nhận được phản hồi hợp lệ từ server");
      }
    } catch (error) {
      messageApi.error(`Nhập kho thất bại: ${error.message}`);
    }
  };

  return (
    <>
      {contextHolder}
      <Popconfirm
        title="Xác nhận nhập kho?"
        description={`Bạn có chắc muốn nhập sản phẩm "${record.productname}" vào kho không?`}
        onConfirm={handleConfirm}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Button type={type}>
          Nhập kho
        </Button>
      </Popconfirm>
    </>
  );
}