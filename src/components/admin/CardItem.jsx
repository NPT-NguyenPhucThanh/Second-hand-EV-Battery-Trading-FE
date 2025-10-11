import React, { Children } from 'react'
import './CardItem.css'
import { Card } from 'antd';
import { CarOutlined } from '@ant-design/icons';

export default function CardItem(props) {
    const { title, style, value, icon, children  } = props;
  return (
    <Card className='card-item' 
    style={style} 
    title={title}
    extra={icon && <span style={{ fontSize: 20 }}>{icon}</span>}>
        {value && (
        <h2 style={{ margin: 0, fontWeight: 700, fontSize: 24 }}>{value}</h2>
      )}
      {children}
    </Card>
  )
}
