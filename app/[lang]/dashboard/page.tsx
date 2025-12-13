"use client";
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const { lang } = useParams();
  const text = {
    en: {
      title: 'Fitness Dashboard',
      desc: 'Track your workout progress and statistics',
      content: (
        <div className="grid grid-cols-2 gap-6 max-w-3xl">
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">Total Workouts</h3>
            <p className="text-2xl text-blue-600 m-0">12</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">Total Duration</h3>
            <p className="text-2xl text-blue-600 m-0">5.2 hrs</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">Completed Courses</h3>
            <p className="text-2xl text-blue-600 m-0">3</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">Calories Burned</h3>
            <p className="text-2xl text-blue-600 m-0">1,850</p>
          </div>
        </div>
      )
    },
    zh: {
      title: '健身数据面板',
      desc: '追踪你的锻炼进度和统计数据',
      content: (
        <div className="grid grid-cols-2 gap-6 max-w-3xl">
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">总锻炼次数</h3>
            <p className="text-2xl text-blue-600 m-0">12 次</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">总时长</h3>
            <p className="text-2xl text-blue-600 m-0">5.2 小时</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">已完成课程</h3>
            <p className="text-2xl text-blue-600 m-0">3 门</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="m-0 mb-4 text-gray-800">消耗卡路里</h3>
            <p className="text-2xl text-blue-600 m-0">1,850 千卡</p>
          </div>
        </div>
      )
    }
  };
  const currentText = text[lang as keyof typeof text] || text.en;

  return (
    <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl mb-4 text-gray-900">{currentText.title}</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">{currentText.desc}</p>
        <div>{currentText.content}</div>
    </div>
  );
}