// /app/page.tsx
// 根路径独立首页（不再重定向，显示专属内容）
export default function RootHomePage() {
  return (
    <div style={{ 
      padding: '3rem 2rem', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      textAlign: 'center' 
    }}>
      {/* 首页标题和简介 */}
      <h1 style={{ 
        fontSize: '2.5rem', 
        color: '#1a1a1a', 
        marginBottom: '1.5rem' 
      }}>
        蓝牙设备连接平台
      </h1>
      <p style={{ 
        fontSize: '1.2rem', 
        color: '#666', 
        maxWidth: '800px', 
        margin: '0 auto 2rem', 
        lineHeight: '1.6' 
      }}>
        快速连接、管理蓝牙设备，支持多语言切换，提供简洁高效的设备交互体验
      </p>

      {/* 跳转按钮：引导用户进入蓝牙连接页面 */}
      <a 
        href="/en/connect"  // 跳转到英文版本的连接页面
        style={{ 
          display: 'inline-block', 
          padding: '1rem 2.5rem', 
          backgroundColor: '#0070f3', 
          color: 'white', 
          fontSize: '1.1rem', 
          fontWeight: '600', 
          borderRadius: '8px', 
          textDecoration: 'none', 
          transition: 'backgroundColor 0.3s' 
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = '#0051cc'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
      >
        进入蓝牙连接页面
      </a>

      {/* 语言切换提示（可选） */}
      <p style={{ 
        marginTop: '2rem', 
        fontSize: '1rem', 
        color: '#999' 
      }}>
        支持多语言：访问 /zh/connect（中文）、/en/connect（英文）切换
      </p>
    </div>
  );
}