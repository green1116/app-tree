"use client"; // 新增这一行
import { useParams } from 'next/navigation';

export default function DashboardPage() {
  const { lang } = useParams();
  const text = {
    en: {
      title: 'Fitness Dashboard',
      desc: 'Track your workout progress and statistics',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '800px' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Total Workouts</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>12</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Total Duration</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>5.2 hrs</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Completed Courses</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>3</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Calories Burned</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>1,850</p>
          </div>
        </div>
      )
    },
    zh: {
      title: '健身数据面板',
      desc: '追踪你的锻炼进度和统计数据',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', maxWidth: '800px' }}>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>总锻炼次数</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>12 次</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>总时长</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>5.2 小时</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>已完成课程</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>3 门</p>
          </div>
          <div style={{ padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>消耗卡路里</h3>
            <p style={{ fontSize: '1.8rem', color: '#0070f3', margin: '0' }}>1,850 千卡</p>
          </div>
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