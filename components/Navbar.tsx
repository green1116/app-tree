"use client";
import { useParams, useRouter, usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface NavbarProps {
  lang?: string;
}

const Navbar = ({ lang: propLang }: NavbarProps = {}) => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // 优先使用 prop，然后从 params 获取，最后从 pathname 解析
  const langFromProp = propLang;
  const langFromParams = params?.lang as string;
  const langFromPath = pathname?.split('/')[1];
  const currentLang = langFromProp || langFromParams || langFromPath || 'zh';
  
  // 在客户端挂载前，使用 prop 作为默认值
  if (!mounted && !langFromProp) {
    return (
      <nav className="bg-white border-b border-gray-200 px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-center h-16">
          <div className="text-xl font-bold text-blue-600">
            <a href="/zh" className="no-underline text-inherit">
              Fitness App
            </a>
          </div>
          <div className="flex gap-8">
            <a href="/zh/courses" className="no-underline text-gray-800">课程</a>
            <a href="/zh/workout" className="no-underline text-gray-800">训练</a>
            <a href="/zh/report" className="no-underline text-gray-800">报告</a>
            <a href="/zh/connect" className="no-underline text-gray-800">蓝牙连接</a>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer">
            切换为英文
          </button>
        </div>
      </nav>
    );
  }

  // 导航菜单
  const menuItems = [
    { name: currentLang === 'zh' ? '课程' : 'Courses', path: '/courses' },
    { name: currentLang === 'zh' ? '训练' : 'Workout', path: '/workout' },
    { name: currentLang === 'zh' ? '报告' : 'Report', path: '/report' },
    { name: currentLang === 'zh' ? '蓝牙连接' : 'Connect', path: '/connect' },
  ];

  // 切换语言
  const switchLang = () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    // 保留当前页面路径，仅切换语言
    const currentPath = window.location.pathname.replace(`/${currentLang}`, `/${newLang}`);
    router.push(currentPath);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-8">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16">
        <div className="text-xl font-bold text-blue-600">
          <a href={`/${currentLang}`} className="no-underline text-inherit">
            Fitness App
          </a>
        </div>
        <div className="flex gap-8">
          {menuItems.map((item) => (
            <a 
              key={item.path}
              href={`/${currentLang}${item.path}`}
              className="no-underline text-gray-800 transition-colors duration-300 hover:text-blue-600"
            >
              {item.name}
            </a>
          ))}
        </div>
        <button 
          className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer"
          onClick={switchLang}
        >
          {currentLang === 'zh' ? '切换为英文' : 'Switch to Chinese'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

