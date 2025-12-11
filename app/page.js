'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  
  // 确保组件挂载后再跳转（避免服务端渲染时的错误）
  useEffect(() => {
    router.push('/zh/workout')
  }, [router])

  return <div>Redirecting to workout page...</div>
}