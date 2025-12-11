// app/page.js
'use client'
import { useRouter } from 'next/navigation'
export default function Home() {
  const router = useRouter()
  router.push('/zh/workout') // 跳转到默认语言页面
  return <div>Redirecting...</div>
}