import React from "react";
import { Line } from "@ant-design/plots";

export default function RevenueChart(props) {
  const { data } = props;

  const config = {
    data: data,
    xField: 'month',
    yField: 'value',
    height: 300,
    colorField: 'category',
  };

  return <Line {...config} />;
}
