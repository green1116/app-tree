"use client";
import React from 'react';

interface NavbarSimpleProps {
  lang?: string;
}

const NavbarSimple = ({ lang = 'zh' }: NavbarSimpleProps) => {
  const menuItems = [
    { name: lang === 'zh' ? '课程' : 'Courses', path: '/courses' },
    { name: lang === 'zh' ? '训练' : 'Workout', path: '/workout' },
    { name: lang === 'zh' ? '报告' : 'Report', path: '/report' },
    { name: lang === 'zh' ? '蓝牙连接' : 'Connect', path: '/connect' },
  ];

  return (
    <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 2rem' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
          <a href={`/${lang}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            Fitness App
          </a>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          {menuItems.map((item) => (
            <a 
              key={item.path}
              href={`/${lang}${item.path}`}
              style={{ textDecoration: 'none', color: '#1f2937' }}
            >
              {item.name}
            </a>
          ))}
        </div>
        <button 
          style={{ padding: '0.5rem 1rem', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
        >
          {lang === 'zh' ? '切换为英文' : 'Switch to Chinese'}
        </button>
      </div>
    </nav>
  );
};

export default NavbarSimple;

