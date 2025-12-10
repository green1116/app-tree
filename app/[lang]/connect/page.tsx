"use client"; // 新增这一行
import { useParams } from 'next/navigation';

export default function ConnectPage() {
  const { lang } = useParams();
  const text = {
    en: {
      title: 'Bluetooth Connection',
      desc: 'Connect and manage your fitness devices',
      content: (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#666', margin: '0 0 1rem 0' }}>Device Status</p>
            <p style={{ fontSize: '1.2rem', color: '#ff4d4f', margin: '0' }}>Disconnected</p>
          </div>
          <button style={{ 
            padding: '0.8rem 1.5rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'backgroundColor 0.3s',
            width: '100%'
          }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051cc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            Scan for Bluetooth Devices
          </button>
        </div>
      )
    },
    zh: {
      title: '蓝牙连接',
      desc: '连接并管理你的健身设备',
      content: (
        <div style={{ maxWidth: '600px' }}>
          <div style={{ padding: '2rem', border: '1px solid #eee', borderRadius: '8px', textAlign: 'center', marginBottom: '1.5rem' }}>
            <p style={{ color: '#666', margin: '0 0 1rem 0' }}>设备状态</p>
            <p style={{ fontSize: '1.2rem', color: '#ff4d4f', margin: '0' }}>未连接</p>
          </div>
          <button style={{ 
            padding: '0.8rem 1.5rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'backgroundColor 0.3s',
            width: '100%'
          }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051cc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            扫描蓝牙设备
          </button>
        </div>
      )
    }
  };
  const currentText = text[lang as keyof typeof text] || text.en;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a1a1a' }}>{currentText.title}</h1>
      <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6' }}>{currentText.desc}</p>
      <div>{currentText.content}</div>
    </div>
  );
}