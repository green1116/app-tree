"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios'; // 引入axios
import en from '../../../locales/en.json';
import zh from '../../../locales/zh.json';
import Navbar from '../../../components/Navbar'; // 引入导航栏

export default function ReportPage() {
  const { lang } = useParams();
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true); // 加载状态
  const [reportData, setReportData] = useState({
    trainingCount: 0,
    trainingDuration: 0,
    completedCourses: 0
  });
  const t = lang === 'zh' ? zh : en;

  // 接口请求：获取训练报告数据
  const fetchReportData = async () => {
    try {
      // 替换为你的真实接口地址
      const res = await axios.get('https://mock-api.example.com/training-report', {
        params: { lang, month: new Date().getMonth() + 1 }
      });
      setReportData(res.data);
    } catch (err) {
      console.error('获取报告数据失败：', err);
      // 失败时使用模拟数据兜底
      setReportData({
        trainingCount: 24,
        trainingDuration: 12.5,
        completedCourses: 8
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    fetchReportData(); // 客户端渲染完成后请求数据
  }, [lang]);

  if (!isClient) return <div></div>;

  return (
    <div>
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl mb-6 text-gray-900">
          {t.report_title || (lang === 'zh' ? '训练报告' : 'Training Report')}
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {t.report_desc || (lang === 'zh' ? '查看你的训练数据统计与分析' : 'View your training data statistics and analysis')}
        </p>

        {/* 加载状态：骨架屏 */}
        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mb-8">
            {[1,2,3].map((item) => (
              <div key={item} className="p-6 border border-gray-200 rounded-lg bg-gray-50 h-[150px] flex flex-col justify-center">
                <div className="w-1/2 h-5 bg-gray-200 rounded mb-4"></div>
                <div className="w-[30%] h-8 bg-gray-200 rounded mb-2"></div>
                <div className="w-1/5 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          // 训练数据卡片
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8 mb-8">
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="m-0 mb-4 text-blue-600">
                {t.report_training_count || (lang === 'zh' ? '训练次数' : 'Training Count')}
              </h3>
              <p className="text-3xl m-0 text-gray-900">{reportData.trainingCount}</p>
              <p className="text-gray-600 mt-2 mb-0">
                {lang === 'zh' ? '本月累计' : 'This month'}
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="m-0 mb-4 text-green-600">
                {t.report_training_duration || (lang === 'zh' ? '总训练时长' : 'Total Training Duration')}
              </h3>
              <p className="text-3xl m-0 text-gray-900">{reportData.trainingDuration}h</p>
              <p className="text-gray-600 mt-2 mb-0">
                {lang === 'zh' ? '本月累计' : 'This month'}
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="m-0 mb-4 text-orange-500">
                {t.report_completed_courses || (lang === 'zh' ? '完成课程数' : 'Completed Courses')}
              </h3>
              <p className="text-3xl m-0 text-gray-900">{reportData.completedCourses}</p>
              <p className="text-gray-600 mt-2 mb-0">
                {lang === 'zh' ? '本月累计' : 'This month'}
              </p>
            </div>
          </div>
        )}

        {/* 报告说明区域 */}
        <div className="p-6 border border-gray-200 rounded-lg bg-gray-100">
          <p className="text-gray-600 m-0 leading-relaxed">
            {t.report_note || (lang === 'zh' ? '以上数据为你本月的训练汇总，可通过蓝牙设备同步最新数据。' : 'The above data is your training summary for this month, you can sync the latest data via Bluetooth devices.')}
          </p>
        </div>
      </div>
    </div>
  );
}