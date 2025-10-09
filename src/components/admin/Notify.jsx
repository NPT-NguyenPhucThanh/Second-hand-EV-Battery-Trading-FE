import React from "react";
import { BellOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import "./Notify.css";
import { Badge } from "antd";

export default function Notify() {
  const items = [
    {
      label: (
        <div className="notify__item">
          <div className="notify__item-icon">
            <BellOutlined />
          </div>
          <div className="notify__item-content">
            <div className="notify__item-title">Item 1</div>
            <div className="notify__item-time">8 phut truoc</div>
          </div>
        </div>
      ),
      key: "1",
    },
    {
      label: "Item 2",
      key: "2",
    },
    {
      label: "Item 3",
      key: "3",
    },
    {
      label: "Item 4",
      key: "4",
    },
    {
      label: "Item 5",
      key: "5",
    },
    {
      label: "Item 6",
      key: "6",
    },
    {
      label: "Item 7",
      key: "7",
    },
    {
      label: "Item 8",
      key: "8",
    },
    {
      label: "Item 9",
      key: "9",
    },
  ];
  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        popupRender={(menu) => (
          <>
            <div className="notify-dropdown">
              <div className="notify__header">
                <div className="notify__header-title">
                  <BellOutlined />
                  Notification
                </div>
                <Button type="link">View All</Button>
              </div>
              <div className="notify__body">{menu}</div>
            </div>
          </>
        )}
      >
        <Badge dot >
          <Button type="text" icon={<BellOutlined />}></Button>
        </Badge>
      </Dropdown>
    </>
  );
}
