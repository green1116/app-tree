"use client";
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import en from '../../../locales/en.json';
import zh from '../../../locales/zh.json';

export default function WorkoutPage() {
  const { lang } = useParams();
  const [isClient, setIsClient] = useState(false);
  const [cameraActive, setCameraActive] = useState(false); // 摄像头是否激活
  const [error, setError] = useState(''); // 摄像头错误信息
  const videoRef = useRef<HTMLVideoElement>(null); // 视频流引用
  const t = lang === 'zh' ? zh : en;

  // 启动摄像头
  const startCamera = async () => {
    try {
      setError('');
      // 调用设备摄像头
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' } // 前置摄像头，可改为'environment'后置
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError(lang === 'zh' ? '摄像头调用失败，请允许摄像头权限或检查设备' : 'Camera access failed, please allow permission or check your device');
      console.error('摄像头错误：', err);
    }
  };

  // 停止摄像头
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop()); // 停止所有轨道
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    // 组件卸载时停止摄像头
    return () => stopCamera();
  }, [lang]);

  if (!isClient) return <div className="min-h-screen"></div>;

  return (
    <div className="w-full min-h-screen">
        {/* 顶部导航栏 */}
        <div className="px-8 py-4 bg-white border-b border-gray-200 flex justify-between items-center">
          <h1 className="m-0 text-2xl text-gray-900">My App</h1>
          <div>
            {!cameraActive ? (
              <button 
                className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer"
                onClick={startCamera}
              >
                {lang === 'zh' ? '启动摄像头' : 'Start Camera'}
              </button>
            ) : (
              <button 
                className="px-4 py-2 bg-red-500 text-white border-none rounded cursor-pointer"
                onClick={stopCamera}
              >
                {lang === 'zh' ? '停止摄像头' : 'Stop Camera'}
              </button>
            )}
          </div>
        </div>

        {/* 主内容区 */}
        <div className="bg-slate-900 min-h-[calc(100vh-64px)] p-8 text-center">
          <h2 className="m-0 mb-2 text-4xl text-white">
            {t.workout_title || (lang === 'zh' ? 'AI 摄像头训练' : 'AI Camera Workout')}
          </h2>
          <p className="m-0 mb-8 text-slate-400">
            {t.workout_desc || (lang === 'zh' ? 'AI 实时动作分析' : 'Real-time form analysis with AI')}
          </p>

          {/* 错误提示 */}
          {error && (
            <div className="max-w-3xl mx-auto mb-8 p-4 border border-red-500 rounded-lg bg-red-50 text-red-500">
              {error}
            </div>
          )}

          {/* 摄像头/AI分析区域 */}
          <div className="max-w-3xl mx-auto p-4 border-2 border-cyan-500 rounded-lg bg-slate-800 relative">
            {/* 边角装饰 */}
            <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-cyan-500"></div>
            <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-cyan-500"></div>
            <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-cyan-500"></div>
            <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-cyan-500"></div>

            {/* 视频流/占位框 */}
            {cameraActive ? (
              <video 
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded max-h-[600px] object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-2 border-slate-400 rounded-lg relative mb-4">
                  <div className="absolute top-3 right-3 w-2 h-2 border-r-2 border-b-2 border-slate-400"></div>
                </div>
                <p className="text-slate-400">
                  {lang === 'zh' ? '点击按钮启动摄像头' : 'Click the button to start the camera'}
                </p>
                {/* AI分析占位符 */}
                <div className="mt-4 p-4 border border-slate-700 rounded w-4/5">
                  <p className="text-slate-400 m-0">
                    {lang === 'zh' ? 'AI动作分析：等待摄像头启动...' : 'AI Form Analysis: Waiting for camera to start...'}
                  </p>
                </div>
              </div>
            )}

            {/* AI分析结果（摄像头激活后显示） */}
            {cameraActive && (
              <div className="mt-4 p-4 border border-slate-700 rounded w-full text-left text-white">
                <h4 className="m-0 mb-2 text-cyan-500">
                  {lang === 'zh' ? 'AI实时分析' : 'AI Real-time Analysis'}
                </h4>
                <p className="m-0 text-slate-400">
                  {lang === 'zh' ? '姿势正确：继续保持！' : 'Form Correct: Keep it up!'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}