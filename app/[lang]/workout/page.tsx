"use client"; // 新增这一行
import { useParams } from 'next/navigation';

export default function WorkoutPage() {
  const { lang } = useParams();
  const text = {
    en: {
      title: 'Daily Workout',
      desc: 'Today\'s recommended workout plan',
      content: (
        <div style={{ lineHeight: '1.8', maxWidth: '700px' }}>
          <h3 style={{ color: '#333', margin: '0 0 1rem 0' }}>Workout Plan (30 mins)</h3>
          <ol style={{ paddingLeft: '1.5rem', margin: '1rem 0 2rem 0', fontSize: '1rem' }}>
            <li>Warm up - 5 mins (Jumping Jacks)</li>
            <li>Squats - 3 sets × 15 reps</li>
            <li>Push ups - 3 sets × 12 reps</li>
            <li>Lunges - 3 sets × 10 reps/leg</li>
            <li>Cool down - 5 mins (Stretching)</li>
          </ol>
          <button style={{ 
            padding: '0.8rem 1.5rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'backgroundColor 0.3s'
          }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051cc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            Start Workout
          </button>
        </div>
      )
    },
    zh: {
      title: '每日锻炼',
      desc: '今日推荐锻炼计划',
      content: (
        <div style={{ lineHeight: '1.8', maxWidth: '700px' }}>
          <h3 style={{ color: '#333', margin: '0 0 1rem 0' }}>锻炼计划（30分钟）</h3>
          <ol style={{ paddingLeft: '1.5rem', margin: '1rem 0 2rem 0', fontSize: '1rem' }}>
            <li>热身 - 5分钟（开合跳）</li>
            <li>深蹲 - 3组 × 15次</li>
            <li>俯卧撑 - 3组 × 12次</li>
            <li>弓步蹲 - 3组 × 每腿10次</li>
            <li>放松 - 5分钟（拉伸）</li>
          </ol>
          <button style={{ 
            padding: '0.8rem 1.5rem', 
            backgroundColor: '#0070f3', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '1rem',
            transition: 'backgroundColor 0.3s'
          }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0051cc'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#0070f3'}
          >
            开始锻炼
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