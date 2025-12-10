"use client"; // 新增这一行
import { useParams } from 'next/navigation';

export default function CoursesPage() {
  const { lang } = useParams();
  const text = {
    en: {
      title: 'Fitness Courses',
      desc: 'Choose the right course for your fitness goal',
      content: (
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
          <li>Beginner Yoga - 30 mins/day</li>
          <li>HIIT Training - 20 mins/day</li>
          <li>Strength Building - 45 mins/day</li>
          <li>Cardio Workout - 35 mins/day</li>
          <li>Flexibility Training - 25 mins/day</li>
        </ul>
      )
    },
    zh: {
      title: '健身课程',
      desc: '为你的健身目标选择合适的课程',
      content: (
        <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '1rem' }}>
          <li>入门瑜伽 - 每天30分钟</li>
          <li>高强度间歇训练 - 每天20分钟</li>
          <li>力量塑造 - 每天45分钟</li>
          <li>有氧锻炼 - 每天35分钟</li>
          <li>柔韧性训练 - 每天25分钟</li>
        </ul>
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