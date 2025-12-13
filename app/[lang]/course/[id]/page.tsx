"use client";
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import en from '../../../../locales/en.json';
import zh from '../../../../locales/zh.json';

export default function CourseDetailPage() {
  const { lang, id } = useParams();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const t = lang === 'zh' ? zh : en;

  useEffect(() => {
    setIsClient(true);
  }, [lang]);

  if (!isClient) return <div></div>;

  // 模拟课程数据（实际应该从 API 获取）
  const course = {
    id: id as string,
    title: lang === 'zh' ? '入门瑜伽课程' : 'Beginner Yoga Course',
    description: lang === 'zh' 
      ? '适合初学者的瑜伽课程，主要学习基础的瑜伽体式和呼吸方法，缓解身体疲劳，提升柔韧性。' 
      : 'Yoga course for beginners, learn basic yoga poses and breathing techniques to relieve fatigue and improve flexibility.',
    difficulty: lang === 'zh' ? '入门' : 'Beginner',
    duration: lang === 'zh' ? '30分钟' : '30 minutes',
    equipment: lang === 'zh' ? '瑜伽垫' : 'Yoga Mat',
    image: '/yoga.jpg'
  };

  const handleStartTraining = () => {
    router.push(`/${lang}/workout`);
  };

  return (
    <div className="w-full">
        {/* Course Banner */}
        <div className="relative w-full h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
            <p className="text-xl opacity-90">{t.courses_title || (lang === 'zh' ? '健身课程' : 'Fitness Courses')}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-8">
          {/* Description Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {lang === 'zh' ? '课程介绍' : 'Description'}
            </h2>
            <p className="text-gray-600 leading-relaxed">{course.description}</p>
          </section>

          {/* Difficulty / Duration Section */}
          <section className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {lang === 'zh' ? '难度' : 'Difficulty'}
              </h3>
              <p className="text-gray-600">{course.difficulty}</p>
            </div>
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                {lang === 'zh' ? '时长' : 'Duration'}
              </h3>
              <p className="text-gray-600">{course.duration}</p>
            </div>
          </section>

          {/* Needed Equipment Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              {lang === 'zh' ? '所需装备' : 'Needed Equipment'}
            </h2>
            <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-gray-600">{course.equipment}</p>
            </div>
          </section>

          {/* Start Training Button */}
          <div className="text-center">
            <button
              onClick={handleStartTraining}
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {lang === 'zh' ? '开始训练' : 'Start Training'}
            </button>
          </div>
        </div>
      </div>
  );
}
