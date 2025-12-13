"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import en from '../../../locales/en.json';
import zh from '../../../locales/zh.json';

// 课程类型定义
type Course = {
  id: number;
  title: string;
  level: string;
  duration: string;
  image: string;
  desc: string;
};

export default function CoursesPage() {
  const { lang } = useParams();
  const [isClient, setIsClient] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null); // 选中的课程
  const [enrolledCourses, setEnrolledCourses] = useState<number[]>([]); // 已报名的课程
  const [btnLoading, setBtnLoading] = useState<number | null>(null); // 按钮加载状态，存储正在加载的课程ID
  const t = lang === 'zh' ? zh : en;

  // 课程数据（可替换为接口请求）
  const courses = lang === 'zh' ? [
    { 
      id: 1,
      title: '入门瑜伽', 
      level: '入门', 
      duration: '30分钟', 
      image: '/yoga.jpg',
      desc: '适合初学者的瑜伽课程，主要学习基础的瑜伽体式和呼吸方法，缓解身体疲劳，提升柔韧性。'
    },
    { 
      id: 2,
      title: '高强度间歇训练', 
      level: '中级', 
      duration: '45分钟', 
      image: '/hiit.jpg',
      desc: '短时间内高强度的间歇训练，高效燃脂，提升心肺功能，适合有一定健身基础的人群。'
    },
    { 
      id: 3,
      title: '进阶力量训练', 
      level: '进阶', 
      duration: '50分钟', 
      image: '/strength.jpg',
      desc: '针对肌肉力量的进阶训练，使用器械和自重训练结合，提升肌肉量和爆发力。'
    },
    { 
      id: 4,
      title: '有氧锻炼', 
      level: '入门', 
      duration: '35分钟', 
      image: '/aerobic.jpg',
      desc: '轻松的有氧训练，结合舞蹈和踏步动作，燃脂的同时提升身体协调性。'
    },
  ] : [
    { 
      id: 1,
      title: 'Beginner Yoga', 
      level: 'Beginner', 
      duration: '30 minutes', 
      image: '/yoga.jpg',
      desc: 'Yoga course for beginners, learn basic yoga poses and breathing techniques to relieve fatigue and improve flexibility.'
    },
    { 
      id: 2,
      title: 'HIIT Training', 
      level: 'Intermediate', 
      duration: '45 minutes', 
      image: '/hiit.jpg',
      desc: 'High-intensity interval training in a short time, burn fat efficiently and improve cardiopulmonary function, suitable for people with certain fitness foundation.'
    },
    { 
      id: 3,
      title: 'Advanced Strength', 
      level: 'Advanced', 
      duration: '50 minutes', 
      image: '/strength.jpg',
      desc: 'Advanced strength training for muscles, combining equipment and bodyweight training to increase muscle mass and explosive power.'
    },
    { 
      id: 4,
      title: 'Aerobic Exercise', 
      level: 'Beginner', 
      duration: '35 minutes', 
      image: '/aerobic.jpg',
      desc: 'Relaxing aerobic training, combining dance and stepping movements to burn fat and improve body coordination.'
    },
  ];

  useEffect(() => {
    setIsClient(true);
    // 从本地存储获取已报名的课程（模拟持久化）
    const savedEnrolled = localStorage.getItem('enrolledCourses');
    if (savedEnrolled) {
      setEnrolledCourses(JSON.parse(savedEnrolled));
    }
  }, [lang]);

  if (!isClient) return <div></div>;

  // 处理课程报名
  const handleEnroll = async (course: Course) => {
    if (btnLoading === course.id) return; // 防止重复点击
    
    setBtnLoading(course.id);
    try {
      // 模拟异步操作（实际项目中可能是 API 调用）
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (!enrolledCourses.includes(course.id)) {
        const newEnrolled = [...enrolledCourses, course.id];
        setEnrolledCourses(newEnrolled);
        localStorage.setItem('enrolledCourses', JSON.stringify(newEnrolled)); // 持久化到本地存储
        alert(lang === 'zh' ? `已报名《${course.title}》` : `Enrolled in ${course.title}`);
      } else {
        alert(lang === 'zh' ? `你已报名《${course.title}》` : `You have already enrolled in ${course.title}`);
      }
    } finally {
      setBtnLoading(null);
    }
  };

  // 处理课程播放
  const handlePlay = (course: Course) => {
    if (enrolledCourses.includes(course.id)) {
      setSelectedCourse(course); // 打开详情/播放弹窗
    } else {
      alert(lang === 'zh' ? `请先报名《${course.title}》` : `Please enroll in ${course.title} first`);
    }
  };

  // 关闭课程弹窗
  const closeModal = () => {
    setSelectedCourse(null);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-4xl mb-6">
          {t.courses_title || (lang === 'zh' ? '健身课程' : 'Fitness Courses')}
        </h1>
        <p className="text-gray-600 mb-8">
          {t.courses_desc || (lang === 'zh' ? '为你的健身目标选择合适的课程' : 'Choose the right course for your fitness goals')}
        </p>

        {/* 课程列表 */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-8">
          {courses.map((course) => (
            <div key={course.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-[200px] object-cover"
              />
              <div className="p-6">
                <h2 className="m-0 mb-2">{course.title}</h2>
                <div className="flex gap-2 mb-4">
                  <span className={`px-2 py-1 rounded text-xs ${
                    course.level === 'Beginner' || course.level === '入门' 
                      ? 'bg-blue-100 text-blue-700' 
                      : course.level === 'Intermediate' || course.level === '中级' 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {course.level}
                  </span>
                  <span className="text-gray-600 text-sm">{course.duration}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    className="flex-1 px-4 py-3 bg-blue-600 text-white border-none rounded-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleEnroll(course)}
                    disabled={btnLoading === course.id}
                  >
                    {btnLoading === course.id ? (
                      <>
                        <ClipLoader size={16} color="#fff" />
                        <span>{lang === 'zh' ? '报名中...' : 'Enrolling...'}</span>
                      </>
                    ) : (
                      lang === 'zh' ? '报名课程' : 'Enroll'
                    )}
                  </button>
                  <button 
                    className="flex-1 px-4 py-3 bg-green-600 text-white border-none rounded-md cursor-pointer"
                    onClick={() => handlePlay(course)}
                  >
                    {lang === 'zh' ? '播放课程' : 'Play'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 课程详情/播放弹窗 */}
        {selectedCourse && (
          <div className="fixed top-0 left-0 w-full h-full bg-black/70 flex justify-center items-center z-[1000]">
            <div className="bg-white rounded-lg w-[90%] max-w-3xl max-h-[80vh] overflow-auto p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="m-0">{selectedCourse.title}</h2>
                <button 
                  className="bg-transparent border-none text-2xl cursor-pointer text-gray-600"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
              <img 
                src={selectedCourse.image} 
                alt={selectedCourse.title} 
                className="w-full h-[400px] object-cover rounded-lg mb-4"
              />
              <div className="mb-4">
                <h3 className="m-0 mb-2">
                  {lang === 'zh' ? '课程介绍' : 'Course Description'}
                </h3>
                <p className="text-gray-600 leading-relaxed">{selectedCourse.desc}</p>
                <p className="text-gray-600">
                  <strong>{lang === 'zh' ? '难度：' : 'Level：'}</strong>{selectedCourse.level}
                </p>
                <p className="text-gray-600">
                  <strong>{lang === 'zh' ? '时长：' : 'Duration：'}</strong>{selectedCourse.duration}
                </p>
              </div>
              <div className="text-center">
                <button 
                  className="px-8 py-4 bg-blue-600 text-white border-none rounded-lg cursor-pointer text-base"
                >
                  {lang === 'zh' ? '开始播放课程视频' : 'Start Playing Course Video'}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}