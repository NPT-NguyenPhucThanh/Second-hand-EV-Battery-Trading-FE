import React from 'react'
import { Pie } from "@ant-design/plots";

export default function PieChart({ data }) {
  const config = {
    data: data,
    angleField: "value",
    colorField: "status",
    height: 300,
    label: {
      text: "value",
      style: { fontWeight: "bold" },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };

  return <Pie {...config} />;
}
