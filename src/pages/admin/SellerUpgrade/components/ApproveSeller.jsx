import React from "react";
import { Button, Popconfirm, message } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import { approveSellerRequest } from "../../../../services/sellerUpgradeService";

export default function ApproveSeller(props) {
  const { record, onReload } = props
  const [messageApi, contextHolder] = message.useMessage();
  const handleApprove = async () => {
      const body = {
        approved: true,
        rejectionReason: "",
      };
      const response = await approveSellerRequest(record.userId, body);
      
      if (response.status === "success") {
        await messageApi.open({ type: "success", content: "Duyệt yêu cầu thành công!" });
        onReload();
      } else {
        await messageApi.open({ type: "error", content: "Duyệt yêu cầu thất bại!" });
      }
  };

  return (
   <>
     {contextHolder}
    <div>
      <Popconfirm
      title="Bạn có chắc muốn duyệt yêu cầu này không?"
      onConfirm={handleApprove}
      okText="Có"
      cancelText="Không"
    >
      <Button size="small" type="primary" icon={<CheckOutlined />}>
        Duyệt
      </Button>
    </Popconfirm>
    </div>
   </>
  );
}
