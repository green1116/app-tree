"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import { bluetoothParser, FITNESS_DEVICE_UUIDS } from '@/utils/bluetoothParser';
import { getLocale, getTranslation } from '@/utils/locale';
import { detectBrowser, getCompatibilityMessage } from '@/utils/browserDetection';

/**
 * GATT 服务和特征值类型定义
 * 用于存储从蓝牙设备读取的服务和特征值信息
 */
type GattServiceWithChars = {
  service: BluetoothRemoteGATTService;
  characteristics: BluetoothRemoteGATTCharacteristic[];
};

/**
 * 蓝牙连接页面组件
 * 功能：
 * 1. 扫描和连接蓝牙健身设备
 * 2. 实时接收和显示心率、运动时间、卡路里数据
 * 3. 数据持久化到 localStorage
 * 4. 浏览器兼容性检测和提示
 */
export default function ConnectPage() {
  const { lang } = useParams();
  const currentLang = (lang as string) || 'zh';
  
  // 使用工具函数加载多语言
  const locale = getLocale(currentLang);
  const t = getTranslation(currentLang);
  
  // 客户端渲染状态（用于 SSR 兼容）
  const [isClient, setIsClient] = useState(false);
  
  // 蓝牙设备相关状态
  const [devices, setDevices] = useState<BluetoothDevice[]>([]); // 扫描到的设备列表
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null); // 当前连接的设备
  const [isScanning, setIsScanning] = useState(false); // 是否正在扫描设备
  const [isConnecting, setIsConnecting] = useState(false); // 是否正在连接设备
  const [gattServer, setGattServer] = useState<BluetoothRemoteGATTServer | null>(null); // GATT 服务器实例
  const [gattServices, setGattServices] = useState<GattServiceWithChars[]>([]); // GATT 服务和特征值列表
  const [browserInfo, setBrowserInfo] = useState<ReturnType<typeof detectBrowser>>({ name: 'unknown', isSupported: false, isChrome: false, isEdge: false, isSafari: false, isFirefox: false });
  
  // 从 localStorage 恢复数据
  const loadFitnessDataFromStorage = () => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('fitnessData');
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            heartRate: parsed.heartRate || 0,
            time: parsed.time || 0,
            calories: parsed.calories || 0,
            isDataReceived: parsed.isDataReceived || false
          };
        }
      } catch (err) {
        console.error('Failed to load fitness data from localStorage:', err);
      }
    }
    return {
      heartRate: 0,
      time: 0,
      calories: 0,
      isDataReceived: false
    };
  };

  // 健身数据存储
  const [fitnessData, setFitnessData] = useState(loadFitnessDataFromStorage);

  // 保存数据到 localStorage
  const saveFitnessDataToStorage = (data: typeof fitnessData) => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fitnessData', JSON.stringify(data));
      } catch (err) {
        console.error('Failed to save fitness data to localStorage:', err);
      }
    }
  };

  // 当 fitnessData 更新时，自动保存到 localStorage
  useEffect(() => {
    if (fitnessData.isDataReceived) {
      saveFitnessDataToStorage(fitnessData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitnessData.heartRate, fitnessData.time, fitnessData.calories, fitnessData.isDataReceived]);

  /**
   * 扫描蓝牙设备
   * 
   * 流程：
   * 1. 显示扫描状态
   * 2. 请求用户选择蓝牙设备（通过浏览器原生对话框）
   * 3. 添加超时保护（30秒）
   * 4. 将找到的设备添加到设备列表
   * 5. 监听设备断开连接事件
   * 
   * 注意：
   * - 需要用户手动在浏览器对话框中选择设备
   * - 如果用户取消选择，不会显示错误提示
   */
  const startScan = async () => {
    try {
      setIsScanning(true);
      
      // 添加超时处理：30秒后如果仍未选择设备，则超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(currentLang === 'zh' ? '扫描超时，请重试' : 'Scan timeout, please try again')), 30000);
      });

      // 请求用户选择蓝牙设备
      // 使用 filters 和 optionalServices 来限制扫描范围，提高匹配精度
      const devicePromise = navigator.bluetooth.requestDevice({
        acceptAllDevices: false, // 不扫描所有设备，只扫描指定服务的设备（更精准）
        filters: [{ namePrefix: ['Fitness', '健身', 'HeartRate'] }], // 根据设备名称前缀过滤（根据实际设备修改）
        optionalServices: [
          FITNESS_DEVICE_UUIDS.HEART_RATE_SERVICE, // 心率服务
          FITNESS_DEVICE_UUIDS.FITNESS_MACHINE_SERVICE, // 健身设备服务
          '00001800-0000-1000-8000-00805f9b34fb' // 通用访问服务（GAP Service）
        ]
      });

      // 使用 Promise.race 实现超时控制
      const device = await Promise.race([devicePromise, timeoutPromise]);

      // 避免重复添加设备（检查设备 ID 是否已存在）
      if (!devices.some(d => d.id === device.id)) {
        setDevices([...devices, device]);
        toast.success(currentLang === 'zh' ? '设备已找到' : 'Device found');
      }

      // 监听设备断开连接事件
      // 当设备意外断开时，自动触发 handleDisconnect 函数
      device.addEventListener('gattserverdisconnected', handleDisconnect);
    } catch (err) {
      const errorMsg = err as Error;
      // 用户取消选择设备时不显示错误提示（这是正常行为）
      if (errorMsg.name === 'NotFoundError' || errorMsg.message.includes('cancel')) {
        return;
      }
      toast.error(currentLang === 'zh' ? `扫描设备失败：${errorMsg.message}` : `Scan failed: ${errorMsg.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * 连接蓝牙设备并初始化数据监听
   * 
   * 流程：
   * 1. 检查设备是否支持 GATT 服务
   * 2. 连接 GATT 服务器（带超时保护）
   * 3. 读取所有可用的 GATT 服务
   * 4. 遍历服务，查找心率服务和健身设备服务
   * 5. 为每个服务设置特征值监听器
   * 6. 启用特征值通知，开始接收实时数据
   * 
   * 关键步骤说明：
   * - 特征值监听：通过 addEventListener 监听 'characteristicvaluechanged' 事件
   * - 数据解析：使用 bluetoothParser 工具函数解析原始数据
   * - 数据持久化：每次数据更新时自动保存到 localStorage
   */
  const connectDevice = async (device: BluetoothDevice) => {
    try {
      // 检查设备是否支持 GATT 服务
      if (!device.gatt) {
        toast.error(currentLang === 'zh' ? '该设备不支持GATT服务' : 'This device does not support GATT services');
        return;
      }

      setIsConnecting(true);
      toast.loading(currentLang === 'zh' ? '正在连接设备...' : 'Connecting to device...', { id: 'connecting' });

      // 添加连接超时处理：10秒后如果仍未连接成功，则超时
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(currentLang === 'zh' ? '连接超时，请重试' : 'Connection timeout, please try again')), 10000);
      });

      // 连接 GATT 服务器
      // GATT (Generic Attribute Profile) 是蓝牙低功耗设备通信的核心协议
      const connectPromise = device.gatt.connect();
      const server = await Promise.race([connectPromise, timeoutPromise]);
      
      setGattServer(server);
      setConnectedDevice(device);

      // 读取所有可用的 GATT 服务
      // 每个服务包含多个特征值（Characteristics），特征值是实际的数据接口
      const services = await server.getPrimaryServices();
      const servicesWithChars: GattServiceWithChars[] = [];

      // 遍历所有服务，查找并初始化心率服务和健身设备服务
      for (const service of services) {
        try {
          // 获取服务下的所有特征值
          const characteristics = await service.getCharacteristics();
          servicesWithChars.push({ service, characteristics });

          // ========== 心率服务处理 ==========
          // 检查是否为心率服务（标准 UUID: 0x180D）
          if (service.uuid === FITNESS_DEVICE_UUIDS.HEART_RATE_SERVICE) {
            // 查找心率测量特征值（标准 UUID: 0x2A37）
            const hrChar = characteristics.find(char => char.uuid === FITNESS_DEVICE_UUIDS.HEART_RATE_MEASUREMENT);
            
            if (hrChar) {
              // 步骤1：读取初始心率数据（连接后立即读取一次）
              await listenHeartRate(hrChar);
              
              // 步骤2：设置特征值变化监听器
              // 当设备发送新的心率数据时，会触发此事件
              hrChar.addEventListener('characteristicvaluechanged', (e) => {
                try {
                  const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
                  if (!value) return;
                  
                  // 使用工具函数解析心率数据
                  const heartRate = bluetoothParser.parseHeartRate(value);
                  
                  // 更新状态并保存到 localStorage
                  setFitnessData(prev => {
                    const updated = { ...prev, heartRate, isDataReceived: true };
                    saveFitnessDataToStorage(updated);
                    return updated;
                  });
                } catch (parseErr) {
                  console.error('心率数据解析失败：', parseErr);
                  toast.error(currentLang === 'zh' ? '心率数据解析失败' : 'Failed to parse heart rate data', { duration: 3000 });
                }
              });
              
              // 步骤3：启用特征值通知
              // 只有启用通知后，设备才会主动推送数据更新
              await hrChar.startNotifications();
            }
          }

          // ========== 健身设备服务处理 ==========
          // 检查是否为健身设备服务（标准 UUID: 0x1826）
          if (service.uuid === FITNESS_DEVICE_UUIDS.FITNESS_MACHINE_SERVICE) {
            // 查找运动数据特征值（根据设备协议定义）
            const workoutChar = characteristics.find(char => char.uuid === FITNESS_DEVICE_UUIDS.WORKOUT_DATA);
            
            if (workoutChar) {
              // 步骤1：读取初始运动数据
              await listenWorkoutData(workoutChar);
              
              // 步骤2：设置特征值变化监听器
              workoutChar.addEventListener('characteristicvaluechanged', (e) => {
                try {
                  const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
                  if (!value) return;
                  
                  // 使用工具函数解析运动数据（时间和卡路里）
                  const { time, calories } = bluetoothParser.parseWorkoutData(value);
                  
                  // 更新状态并保存到 localStorage
                  setFitnessData(prev => {
                    const updated = { ...prev, time, calories, isDataReceived: true };
                    saveFitnessDataToStorage(updated);
                    return updated;
                  });
                } catch (parseErr) {
                  console.error('运动数据解析失败：', parseErr);
                  toast.error(currentLang === 'zh' ? '运动数据解析失败' : 'Failed to parse workout data', { duration: 3000 });
                }
              });
              
              // 步骤3：启用特征值通知
              await workoutChar.startNotifications();
            }
          }
        } catch (serviceErr) {
          // 如果某个服务初始化失败，记录错误但继续处理其他服务
          // 这样可以确保即使部分服务失败，其他功能仍能正常工作
          console.error('服务初始化失败：', serviceErr);
        }
      }

      // 保存所有服务和特征值信息（用于调试显示）
      setGattServices(servicesWithChars);
      
      toast.dismiss('connecting');
      toast.success(currentLang === 'zh' ? `已连接设备：${device.name || '未知设备'}` : `Connected to: ${device.name || 'Unknown Device'}`);
    } catch (err) {
      toast.dismiss('connecting');
      const errorMsg = err as Error;
      const errorMessage = errorMsg.message || errorMsg.toString();
      toast.error(currentLang === 'zh' ? `设备连接失败：${errorMessage}` : `Connection failed: ${errorMessage}`);
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * 读取初始心率数据
   * 
   * 在连接设备后，立即读取一次心率数据，用于显示当前状态
   * 后续的数据更新将通过特征值通知（notifications）自动接收
   * 
   * @param char 心率测量特征值对象
   */
  const listenHeartRate = async (char: BluetoothRemoteGATTCharacteristic) => {
    try {
      // 读取特征值的当前值
      const value = await char.readValue();
      if (!value || value.byteLength === 0) {
        throw new Error('Empty data received');
      }
      
      // 使用工具函数解析心率数据
      const heartRate = bluetoothParser.parseHeartRate(value);
      
      // 更新状态并保存到 localStorage
      const newData = { heartRate, isDataReceived: true };
      setFitnessData(prev => {
        const updated = { ...prev, ...newData };
        saveFitnessDataToStorage(updated);
        return updated;
      });
    } catch (err) {
      console.error('读取初始心率数据失败：', err);
      toast.error(currentLang === 'zh' ? '心率数据读取失败' : 'Failed to read heart rate data', { duration: 3000 });
    }
  };

  /**
   * 读取初始运动数据
   * 
   * 在连接设备后，立即读取一次运动数据（时间和卡路里），用于显示当前状态
   * 后续的数据更新将通过特征值通知（notifications）自动接收
   * 
   * @param char 运动数据特征值对象
   */
  const listenWorkoutData = async (char: BluetoothRemoteGATTCharacteristic) => {
    try {
      // 读取特征值的当前值
      const value = await char.readValue();
      if (!value || value.byteLength === 0) {
        throw new Error('Empty data received');
      }
      
      // 使用工具函数解析运动数据
      const { time, calories } = bluetoothParser.parseWorkoutData(value);
      
      // 更新状态并保存到 localStorage
      const newData = { time, calories, isDataReceived: true };
      setFitnessData(prev => {
        const updated = { ...prev, ...newData };
        saveFitnessDataToStorage(updated);
        return updated;
      });
    } catch (err) {
      console.error('读取初始运动数据失败：', err);
      toast.error(currentLang === 'zh' ? '运动数据读取失败' : 'Failed to read workout data', { duration: 3000 });
    }
  };

  /**
   * 处理设备断开连接
   * 
   * 当设备断开连接时：
   * 1. 断开 GATT 服务器连接
   * 2. 重置所有相关状态
   * 3. 清除 localStorage 中的数据
   * 4. 显示断开连接提示
   */
  const handleDisconnect = () => {
    if (connectedDevice) {
      if (connectedDevice.gatt?.connected) {
        connectedDevice.gatt.disconnect();
      }
      // 重置状态
      setConnectedDevice(null);
      setGattServer(null);
      setGattServices([]);
      const resetData = {
        heartRate: 0,
        time: 0,
        calories: 0,
        isDataReceived: false
      };
      setFitnessData(resetData);
      saveFitnessDataToStorage(resetData);
      toast.success(lang === 'zh' ? '已断开设备连接' : 'Disconnected from device');
    }
  };

  /**
   * 初始化效果
   * 
   * 在组件挂载时：
   * 1. 设置客户端渲染标志
   * 2. 检测浏览器兼容性
   * 3. 如果不支持 Web Bluetooth API，显示错误提示
   */
  useEffect(() => {
    setIsClient(true);
    
    // 检测浏览器类型和 Web Bluetooth API 支持情况
    const browser = detectBrowser();
    setBrowserInfo(browser);
    
    // 如果不支持 Web Bluetooth API，显示友好的错误提示
    if (!browser.isSupported) {
      const compatibilityMsg = getCompatibilityMessage(browser, currentLang);
      if (compatibilityMsg) {
        toast.error(compatibilityMsg.message, { duration: 6000 });
      }
    }
  }, [currentLang]);

  if (!isClient) return <div></div>;

  return (
    <>
      <Toaster 
        position="top-center"
        containerStyle={{
          top: 20,
        }}
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
            maxWidth: '90vw',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      <div className="p-4 sm:p-6 md:p-8 max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl mb-4 text-gray-900">
          {locale.pages.connect.bluetooth_title || (lang === 'zh' ? '蓝牙连接' : 'Bluetooth Connection')}
        </h1>
        <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
          {t.pages.connect.desc || (lang === 'zh' ? '连接并管理你的健身设备，实时查看运动数据' : 'Connect and ...')}
        </p>

        {/* 浏览器兼容性提示 */}
        {!browserInfo.isSupported && (() => {
          const compatibilityMsg = getCompatibilityMessage(browserInfo, currentLang);
          if (!compatibilityMsg) return null;
          
          return (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-yellow-600 text-xl">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-yellow-800 font-semibold mb-1 text-sm sm:text-base">
                    {compatibilityMsg.title}
                  </h3>
                  <p className="text-yellow-700 text-xs sm:text-sm">
                    {compatibilityMsg.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 健身数据展示面板（核心） */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 max-w-3xl">
          {/* 心率卡片 */}
          <div className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-3 sm:mb-4 text-red-600 text-sm sm:text-base">
              {lang === 'zh' ? '实时心率' : 'Real-time Heart Rate'}
            </h3>
            <p className="text-4xl sm:text-5xl m-0 text-gray-900 font-semibold">
              {fitnessData.heartRate || '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0 text-xs sm:text-sm">
              {lang === 'zh' ? '次/分钟' : 'bpm'}
            </p>
          </div>

          {/* 运动时间卡片 */}
          <div className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-3 sm:mb-4 text-blue-600 text-sm sm:text-base">
              {lang === 'zh' ? '运动时间' : 'Workout Time'}
            </h3>
            <p className="text-4xl sm:text-5xl m-0 text-gray-900 font-semibold">
              {fitnessData.time ? bluetoothParser.formatTime(fitnessData.time) : '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0 text-xs sm:text-sm">
              {lang === 'zh' ? '时:分:秒' : 'HH:MM:SS'}
            </p>
          </div>

          {/* 卡路里卡片 */}
          <div className="p-4 sm:p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-3 sm:mb-4 text-orange-500 text-sm sm:text-base">
              {lang === 'zh' ? '消耗卡路里' : 'Calories Burned'}
            </h3>
            <p className="text-4xl sm:text-5xl m-0 text-gray-900 font-semibold">
              {fitnessData.calories ? fitnessData.calories.toFixed(1) : '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0 text-xs sm:text-sm">
              {lang === 'zh' ? '千卡(kcal)' : 'kcal'}
            </p>
          </div>
        </div>

        {/* 设备状态展示 */}
        <div className="p-4 sm:p-6 md:p-8 border border-gray-200 rounded-lg text-center mb-4 sm:mb-6 max-w-2xl">
          <p className="text-gray-600 m-0 mb-3 sm:mb-4 text-sm sm:text-base">
            {t.device_status || (lang === 'zh' ? '设备状态' : 'Device Status')}
          </p>
          <p className={`text-lg sm:text-xl m-0 font-semibold ${connectedDevice ? 'text-green-600' : 'text-red-500'}`}>
            {connectedDevice 
              ? (lang === 'zh' ? '已连接' : 'Connected') 
              : (lang === 'zh' ? '未连接' : 'Disconnected')}
          </p>
          {connectedDevice && (
            <p className="text-gray-600 mt-2 text-sm sm:text-base break-words">
              {lang === 'zh' ? '当前设备：' : 'Current Device：'}{connectedDevice.name || (lang === 'zh' ? '未知设备' : 'Unknown Device')}
            </p>
          )}
        </div>

        {/* 蓝牙操作按钮 */}
        <div className="max-w-2xl mb-6 sm:mb-8">
          <button 
            className={`px-4 sm:px-6 py-3 sm:py-3.5 text-white border-none rounded-md cursor-pointer text-sm sm:text-base transition-colors duration-300 w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation ${
              isScanning ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
            onClick={isScanning ? () => {} : startScan}
            disabled={isScanning || isConnecting || !browserInfo.isSupported}
          >
            {isScanning ? (
              <>
                <ClipLoader size={16} color="#fff" />
                <span>{lang === 'zh' ? '扫描中...' : 'Scanning...'}</span>
              </>
            ) : (
              locale.pages.connect.scan_devices || (lang === 'zh' ? '扫描蓝牙设备' : 'Scan Devices')
            )}
          </button>

          {connectedDevice && (
            <button 
              className="px-4 sm:px-6 py-3 sm:py-3.5 bg-red-500 text-white border-none rounded-md cursor-pointer text-sm sm:text-base transition-colors duration-300 w-full mt-4 min-h-[48px] hover:bg-red-600 active:bg-red-700 touch-manipulation"
              onClick={handleDisconnect}
            >
              {lang === 'zh' ? '断开设备' : 'Disconnect Device'}
            </button>
          )}
        </div>

        {/* 蓝牙设备列表 */}
        {devices.length > 0 && (
          <div className="max-w-2xl border border-gray-200 rounded-lg mb-6 sm:mb-8">
            <h3 className="p-3 sm:p-4 m-0 border-b border-gray-200 text-sm sm:text-base font-semibold">
              {locale.pages.connect.device_status || (lang === 'zh' ? '可用设备' : 'Available Devices')}
            </h3>
            <ul className="list-none p-0 m-0">
              {devices.map((device) => (
                <li 
                  key={device.id}
                  className="p-3 sm:p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 last:border-b-0"
                >
                  <span className="text-sm sm:text-base break-words flex-1">{device.name || (lang === 'zh' ? '未知设备' : 'Unknown Device')}</span>
                  <button 
                    className="px-4 py-2.5 sm:py-2 bg-blue-600 text-white border-none rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[100px] min-h-[44px] text-sm sm:text-base hover:bg-blue-700 active:bg-blue-800 touch-manipulation"
                    onClick={() => connectDevice(device)}
                    disabled={connectedDevice !== null || isConnecting || !browserInfo.isSupported}
                  >
                    {isConnecting ? (
                      <>
                        <ClipLoader size={14} color="#fff" />
                        <span>{lang === 'zh' ? '连接中...' : 'Connecting...'}</span>
                      </>
                    ) : (
                      lang === 'zh' ? '连接' : 'Connect'
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GATT服务和特征值展示（调试用，可保留） */}
        {connectedDevice && gattServices.length > 0 && (
          <div className="max-w-3xl border border-gray-200 rounded-lg mb-6 sm:mb-8 bg-gray-100 p-3 sm:p-4">
            <h3 className="m-0 mb-3 sm:mb-4 text-sm sm:text-base text-gray-600 font-semibold">
              {lang === 'zh' ? '设备服务信息（调试用）' : 'Device Service Info (Debug)'}
            </h3>
            <div className="text-xs sm:text-sm text-gray-800 max-h-[200px] sm:max-h-[300px] overflow-auto">
              {gattServices.map((item, serviceIndex) => (
                <div key={serviceIndex} className="mb-2 break-words">
                  <p className="m-0 font-bold text-xs sm:text-sm">Service: {item.service.uuid}</p>
                  <ul className="m-0 ml-2 sm:ml-4 p-0">
                    {item.characteristics.map((char, charIndex) => (
                      <li key={charIndex} className="my-1 text-xs sm:text-sm">
                        Char: {char.uuid} | Properties: {char.properties.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
    </>
  );
}