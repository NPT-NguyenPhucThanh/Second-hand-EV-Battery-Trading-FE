import { ConfigProvider, theme } from 'antd';
import { useTheme } from './contexts/ThemeContext'; 

export default function ThemeWrapper({ children }) {
  const { theme: appTheme } = useTheme(); 

  const isDark = appTheme === 'dark'; 
  const antdAlgorithm = isDark 
    ? theme.darkAlgorithm 
    : theme.defaultAlgorithm; 

  const sharedBg = isDark ? '#001529' : '#f0f5ff'; 
  const componentBg = isDark ? '#001529' : '#ffffff'; 
  
  return (
    <ConfigProvider
      theme={{
        algorithm: antdAlgorithm,
        
        token: {
          colorBgLayout: sharedBg, 
          colorBgContainer: componentBg,
        },
        
        components: {
          Layout: {
            siderBg: sharedBg, 
            headerBg: sharedBg, 
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}