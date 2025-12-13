import { redirect } from 'next/navigation'

export default async function RootPage() {
  // 永久重定向到默认语言首页
  redirect('/zh')
}

