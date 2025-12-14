"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ClipLoader } from 'react-spinners';
import toast, { Toaster } from 'react-hot-toast';
import en from '../../../locales/en.json';
import zh from '../../../locales/zh.json';

// 定义蓝牙相关类型
type GattServiceWithChars = {
  service: BluetoothRemoteGATTService;
  characteristics: BluetoothRemoteGATTCharacteristic[];
};

// 健身设备常见蓝牙服务UUID（可根据你的协议文档修改）
const FITNESS_DEVICE_UUIDS = {
  // 心率服务（标准UUID：0x180D）
  HEART_RATE_SERVICE: '0000180d-0000-1000-8000-00805f9b34fb',
  // 心率测量特征值（标准UUID：0x2A37）
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  // 健身设备服务（标准UUID：0x1826）
  FITNESS_MACHINE_SERVICE: '00001826-0000-1000-8000-00805f9b34fb',
  // 卡路里/时间特征值（根据你的协议文档替换，这里为示例）
  WORKOUT_DATA: '00002a6d-0000-1000-8000-00805f9b34fb'
};

// 解析健身数据的工具函数
const parseFitnessData = {
  /**
   * 解析心率数据（符合蓝牙心率服务标准协议）
   * @param value ArrayBuffer 心率特征值数据
   * @returns number 心率值（次/分钟）
   */
  heartRate: (value: ArrayBuffer): number => {
    const view = new DataView(value);
    // 第一个字节是标志位，第2个字节是心率值（标准格式）
    const flags = view.getUint8(0);
    let heartRate = 0;
    // 检查是否为16位心率值（标志位第0位为1则是16位，否则8位）
    if (flags & 0x01) {
      heartRate = view.getUint16(1, true); // 小端序
    } else {
      heartRate = view.getUint8(1);
    }
    return heartRate;
  },

  /**
   * 解析运动时间和卡路里数据（根据你的协议文档调整解析逻辑）
   * @param value ArrayBuffer 运动数据特征值
   * @returns { time: number, calories: number } 时间（秒）、卡路里（千卡）
   */
  workoutData: (value: ArrayBuffer): { time: number; calories: number } => {
    const view = new DataView(value);
    // 示例解析逻辑（根据你的协议文档修改偏移量和数据类型）
    // 假设：前4字节是时间（秒，32位无符号整数），后4字节是卡路里（千卡，32位无符号整数）
    const time = view.getUint32(0, true); // 小端序，运动时间（秒）
    const calories = view.getUint32(4, true) / 1000; // 转换为千卡（根据设备协议调整）
    return { time, calories };
  },

  /**
   * 格式化时间（秒→HH:MM:SS）
   * @param seconds 秒数
   * @returns string 格式化后的时间
   */
  formatTime: (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
};

export default function ConnectPage() {
  const { lang } = useParams();
  const locale = lang === 'en' ? en : zh;
  const t = lang === 'zh' ? zh : en;
  const [isClient, setIsClient] = useState(false);
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [gattServer, setGattServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [gattServices, setGattServices] = useState<GattServiceWithChars[]>([]);
  
  // 健身数据存储
  const [fitnessData, setFitnessData] = useState({
    heartRate: 0, // 心率（次/分钟）
    time: 0, // 运动时间（秒）
    calories: 0, // 卡路里（千卡）
    isDataReceived: false // 是否接收到数据
  });

  // 扫描蓝牙设备
  const startScan = async () => {
    try {
      setIsScanning(true);
      
      // 添加超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(lang === 'zh' ? '扫描超时，请重试' : 'Scan timeout, please try again')), 30000); // 30秒超时
      });

      // 请求用户选择蓝牙设备（指定健身设备相关服务）
      const devicePromise = navigator.bluetooth.requestDevice({
        acceptAllDevices: false, // 只扫描指定服务的设备（更精准）
        filters: [{ namePrefix: ['Fitness', '健身', 'HeartRate'] }], // 过滤设备名称（根据你的设备修改）
        optionalServices: [
          FITNESS_DEVICE_UUIDS.HEART_RATE_SERVICE,
          FITNESS_DEVICE_UUIDS.FITNESS_MACHINE_SERVICE,
          '00001800-0000-1000-8000-00805f9b34fb' // 通用访问服务
        ]
      });

      const device = await Promise.race([devicePromise, timeoutPromise]);

      // 避免重复添加设备
      if (!devices.some(d => d.id === device.id)) {
        setDevices([...devices, device]);
        toast.success(lang === 'zh' ? '设备已找到' : 'Device found');
      }

      // 监听设备断开连接事件
      device.addEventListener('gattserverdisconnected', handleDisconnect);
    } catch (err) {
      const errorMsg = err as Error;
      // 用户取消选择不显示错误
      if (errorMsg.name === 'NotFoundError' || errorMsg.message.includes('cancel')) {
        return;
      }
      toast.error(lang === 'zh' ? `扫描设备失败：${errorMsg.message}` : `Scan failed: ${errorMsg.message}`);
    } finally {
      setIsScanning(false);
    }
  };

  // 连接蓝牙设备并初始化数据监听
  const connectDevice = async (device: BluetoothDevice) => {
    try {
      if (!device.gatt) {
        toast.error(lang === 'zh' ? '该设备不支持GATT服务' : 'This device does not support GATT services');
        return;
      }

      toast.loading(lang === 'zh' ? '正在连接设备...' : 'Connecting to device...', { id: 'connecting' });

      // 添加连接超时处理
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(lang === 'zh' ? '连接超时，请重试' : 'Connection timeout, please try again')), 10000); // 10秒超时
      });

      // 连接GATT服务器
      const connectPromise = device.gatt.connect();
      const server = await Promise.race([connectPromise, timeoutPromise]);
      
      setGattServer(server);
      setConnectedDevice(device);

      // 读取所有可用的GATT服务
      const services = await server.getPrimaryServices();
      const servicesWithChars: GattServiceWithChars[] = [];

      // 遍历服务，读取特征值并监听健身数据
      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          servicesWithChars.push({ service, characteristics });

          // 监听心率数据
          if (service.uuid === FITNESS_DEVICE_UUIDS.HEART_RATE_SERVICE) {
            const hrChar = characteristics.find(char => char.uuid === FITNESS_DEVICE_UUIDS.HEART_RATE_MEASUREMENT);
            if (hrChar) {
              // 读取初始心率数据
              await listenHeartRate(hrChar);
              // 监听心率数据变化
              hrChar.addEventListener('characteristicvaluechanged', (e) => {
                try {
                  const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
                  if (!value) return;
                  const heartRate = parseFitnessData.heartRate(value);
                  setFitnessData(prev => ({ ...prev, heartRate, isDataReceived: true }));
                } catch (parseErr) {
                  console.error('心率数据解析失败：', parseErr);
                  toast.error(lang === 'zh' ? '心率数据解析失败' : 'Failed to parse heart rate data', { duration: 3000 });
                }
              });
              // 启用通知
              await hrChar.startNotifications();
            }
          }

          // 监听运动数据（时间、卡路里）
          if (service.uuid === FITNESS_DEVICE_UUIDS.FITNESS_MACHINE_SERVICE) {
            const workoutChar = characteristics.find(char => char.uuid === FITNESS_DEVICE_UUIDS.WORKOUT_DATA);
            if (workoutChar) {
              // 读取初始运动数据
              await listenWorkoutData(workoutChar);
              // 监听运动数据变化
              workoutChar.addEventListener('characteristicvaluechanged', (e) => {
                try {
                  const value = (e.target as BluetoothRemoteGATTCharacteristic).value;
                  if (!value) return;
                  const { time, calories } = parseFitnessData.workoutData(value);
                  setFitnessData(prev => ({ ...prev, time, calories, isDataReceived: true }));
                } catch (parseErr) {
                  console.error('运动数据解析失败：', parseErr);
                  toast.error(lang === 'zh' ? '运动数据解析失败' : 'Failed to parse workout data', { duration: 3000 });
                }
              });
              // 启用通知
              await workoutChar.startNotifications();
            }
          }
        } catch (serviceErr) {
          console.error('服务初始化失败：', serviceErr);
          // 继续处理其他服务，不中断整个连接流程
        }
      }

      setGattServices(servicesWithChars);
      toast.dismiss('connecting');
      toast.success(lang === 'zh' ? `已连接设备：${device.name || '未知设备'}` : `Connected to: ${device.name || 'Unknown Device'}`);
    } catch (err) {
      toast.dismiss('connecting');
      const errorMsg = err as Error;
      const errorMessage = errorMsg.message || errorMsg.toString();
      toast.error(lang === 'zh' ? `设备连接失败：${errorMessage}` : `Connection failed: ${errorMessage}`);
    }
  };

  // 读取初始心率数据
  const listenHeartRate = async (char: BluetoothRemoteGATTCharacteristic) => {
    try {
      const value = await char.readValue();
      if (!value || value.byteLength === 0) {
        throw new Error('Empty data received');
      }
      const heartRate = parseFitnessData.heartRate(value);
      setFitnessData(prev => ({ ...prev, heartRate, isDataReceived: true }));
    } catch (err) {
      console.error('读取初始心率数据失败：', err);
      toast.error(lang === 'zh' ? '心率数据读取失败' : 'Failed to read heart rate data', { duration: 3000 });
    }
  };

  // 读取初始运动数据
  const listenWorkoutData = async (char: BluetoothRemoteGATTCharacteristic) => {
    try {
      const value = await char.readValue();
      if (!value || value.byteLength === 0) {
        throw new Error('Empty data received');
      }
      const { time, calories } = parseFitnessData.workoutData(value);
      setFitnessData(prev => ({ ...prev, time, calories, isDataReceived: true }));
    } catch (err) {
      console.error('读取初始运动数据失败：', err);
      toast.error(lang === 'zh' ? '运动数据读取失败' : 'Failed to read workout data', { duration: 3000 });
    }
  };

  // 处理设备断开连接
  const handleDisconnect = () => {
    if (connectedDevice) {
      if (connectedDevice.gatt?.connected) {
        connectedDevice.gatt.disconnect();
      }
      // 重置状态
      setConnectedDevice(null);
      setGattServer(null);
      setGattServices([]);
      setFitnessData({
        heartRate: 0,
        time: 0,
        calories: 0,
        isDataReceived: false
      });
      toast.success(lang === 'zh' ? '已断开设备连接' : 'Disconnected from device');
    }
  };

  useEffect(() => {
    setIsClient(true);
    // 检查浏览器是否支持Web Bluetooth
    if (!navigator.bluetooth) {
      toast.error(lang === 'zh' ? '你的浏览器不支持蓝牙功能' : 'Your browser does not support Bluetooth', { duration: 5000 });
    }
  }, [lang]);

  if (!isClient) return <div></div>;

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
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
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl mb-4 text-gray-900">
          {locale.pages.connect.bluetooth_title || (lang === 'zh' ? '蓝牙连接' : 'Bluetooth Connection')}
        </h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          {t.pages.connect.desc || (lang === 'zh' ? '连接并管理你的健身设备，实时查看运动数据' : 'Connect and ...')}
        </p>

        {/* 健身数据展示面板（核心） */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-6 mb-8 max-w-3xl">
          {/* 心率卡片 */}
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-4 text-red-600">
              {lang === 'zh' ? '实时心率' : 'Real-time Heart Rate'}
            </h3>
            <p className="text-5xl m-0 text-gray-900">
              {fitnessData.heartRate || '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0">
              {lang === 'zh' ? '次/分钟' : 'bpm'}
            </p>
          </div>

          {/* 运动时间卡片 */}
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-4 text-blue-600">
              {lang === 'zh' ? '运动时间' : 'Workout Time'}
            </h3>
            <p className="text-5xl m-0 text-gray-900">
              {fitnessData.time ? parseFitnessData.formatTime(fitnessData.time) : '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0">
              {lang === 'zh' ? '时:分:秒' : 'HH:MM:SS'}
            </p>
          </div>

          {/* 卡路里卡片 */}
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
            <h3 className="m-0 mb-4 text-orange-500">
              {lang === 'zh' ? '消耗卡路里' : 'Calories Burned'}
            </h3>
            <p className="text-5xl m-0 text-gray-900">
              {fitnessData.calories ? fitnessData.calories.toFixed(1) : '-'}
            </p>
            <p className="text-gray-600 mt-2 mb-0">
              {lang === 'zh' ? '千卡(kcal)' : 'kcal'}
            </p>
          </div>
        </div>

        {/* 设备状态展示 */}
        <div className="p-8 border border-gray-200 rounded-lg text-center mb-6 max-w-2xl">
          <p className="text-gray-600 m-0 mb-4">
            {t.device_status || (lang === 'zh' ? '设备状态' : 'Device Status')}
          </p>
          <p className={`text-xl m-0 ${connectedDevice ? 'text-green-600' : 'text-red-500'}`}>
            {connectedDevice 
              ? (lang === 'zh' ? '已连接' : 'Connected') 
              : (lang === 'zh' ? '未连接' : 'Disconnected')}
          </p>
          {connectedDevice && (
            <p className="text-gray-600 mt-2">
              {lang === 'zh' ? '当前设备：' : 'Current Device：'}{connectedDevice.name || (lang === 'zh' ? '未知设备' : 'Unknown Device')}
            </p>
          )}
        </div>

        {/* 蓝牙操作按钮 */}
        <div className="max-w-2xl mb-8">
          <button 
            className={`px-6 py-3 text-white border-none rounded-md cursor-pointer text-base transition-colors duration-300 w-full flex items-center justify-center gap-2 ${
              isScanning ? 'bg-red-500' : 'bg-blue-600'
            }`}
            onClick={isScanning ? () => {} : startScan}
            disabled={isScanning}
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
              className="px-6 py-3 bg-red-500 text-white border-none rounded-md cursor-pointer text-base transition-colors duration-300 w-full mt-4"
              onClick={handleDisconnect}
            >
              {lang === 'zh' ? '断开设备' : 'Disconnect Device'}
            </button>
          )}
        </div>

        {/* 蓝牙设备列表 */}
        {devices.length > 0 && (
          <div className="max-w-2xl border border-gray-200 rounded-lg mb-8">
            <h3 className="p-4 m-0 border-b border-gray-200">
              {locale.pages.connect.device_status || (lang === 'zh' ? '可用设备' : 'Available Devices')}
            </h3>
            <ul className="list-none p-0 m-0">
              {devices.map((device) => (
                <li 
                  key={device.id}
                  className="p-4 border-b border-gray-200 flex justify-between items-center last:border-b-0"
                >
                  <span>{device.name || (lang === 'zh' ? '未知设备' : 'Unknown Device')}</span>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white border-none rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => connectDevice(device)}
                    disabled={connectedDevice !== null}
                  >
                    {lang === 'zh' ? '连接' : 'Connect'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* GATT服务和特征值展示（调试用，可保留） */}
        {connectedDevice && gattServices.length > 0 && (
          <div className="max-w-3xl border border-gray-200 rounded-lg mb-8 bg-gray-100 p-4">
            <h3 className="m-0 mb-4 text-base text-gray-600">
              {lang === 'zh' ? '设备服务信息（调试用）' : 'Device Service Info (Debug)'}
            </h3>
            <div className="text-sm text-gray-800 max-h-[200px] overflow-auto">
              {gattServices.map((item, serviceIndex) => (
                <div key={serviceIndex} className="mb-2">
                  <p className="m-0 font-bold">Service: {item.service.uuid}</p>
                  <ul className="m-0 ml-4 p-0">
                    {item.characteristics.map((char, charIndex) => (
                      <li key={charIndex} className="my-1">
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