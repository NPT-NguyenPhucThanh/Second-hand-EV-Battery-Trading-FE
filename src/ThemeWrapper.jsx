import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useTheme } from './contexts/ThemeContext'; // Import hook của chúng ta

export default function ThemeWrapper({ children }) {
  const { theme: appTheme } = useTheme(); 

  const antdAlgorithm = appTheme === 'dark' 
    ? theme.darkAlgorithm 
    : theme.defaultAlgorithm; 

  return (
    <ConfigProvider
      theme={{
        algorithm: antdAlgorithm,
      }}
    >
      {children}
    </ConfigProvider>
  );
}