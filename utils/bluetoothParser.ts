/**
 * 蓝牙数据解析工具
 * 用于解析从蓝牙设备接收到的健身数据
 */

/**
 * 健身设备常见蓝牙服务UUID
 * 根据蓝牙标准协议定义
 */
export const FITNESS_DEVICE_UUIDS = {
  // 心率服务（标准UUID：0x180D）
  HEART_RATE_SERVICE: '0000180d-0000-1000-8000-00805f9b34fb',
  // 心率测量特征值（标准UUID：0x2A37）
  HEART_RATE_MEASUREMENT: '00002a37-0000-1000-8000-00805f9b34fb',
  // 健身设备服务（标准UUID：0x1826）
  FITNESS_MACHINE_SERVICE: '00001826-0000-1000-8000-00805f9b34fb',
  // 卡路里/时间特征值（根据你的协议文档替换，这里为示例）
  WORKOUT_DATA: '00002a6d-0000-1000-8000-00805f9b34fb'
} as const;

/**
 * 解析心率数据
 * 符合蓝牙心率服务标准协议（Bluetooth Heart Rate Service Specification）
 * 
 * 数据格式说明：
 * - 第1个字节：标志位（Flags）
 *   - Bit 0: 心率值格式（0=8位，1=16位）
 *   - Bit 1-7: 保留位
 * - 第2个字节（或第2-3字节）：心率值
 *   - 8位格式：直接读取第2个字节
 *   - 16位格式：读取第2-3字节（小端序）
 * 
 * @param value ArrayBuffer 从蓝牙特征值读取的原始数据
 * @returns number 心率值（次/分钟，bpm）
 * @throws Error 如果数据格式不正确
 */
export function parseHeartRate(value: ArrayBuffer): number {
  if (!value || value.byteLength < 2) {
    throw new Error('Invalid heart rate data: insufficient bytes');
  }

  const view = new DataView(value);
  
  // 读取标志位（第1个字节）
  const flags = view.getUint8(0);
  
  // 检查是否为16位心率值（标志位第0位为1则是16位，否则8位）
  if (flags & 0x01) {
    // 16位格式：需要至少3个字节
    if (value.byteLength < 3) {
      throw new Error('Invalid heart rate data: insufficient bytes for 16-bit format');
    }
    // 读取第2-3字节，使用小端序（little-endian）
    return view.getUint16(1, true);
  } else {
    // 8位格式：读取第2个字节
    return view.getUint8(1);
  }
}

/**
 * 解析运动时间和卡路里数据
 * 
 * 数据格式说明（示例，需根据实际设备协议调整）：
 * - 字节 0-3：运动时间（秒，32位无符号整数，小端序）
 * - 字节 4-7：卡路里（毫卡，32位无符号整数，小端序）
 * 
 * 注意：此解析逻辑为示例，实际使用时需要根据设备的具体协议文档进行调整
 * 
 * @param value ArrayBuffer 从蓝牙特征值读取的原始数据
 * @returns { time: number, calories: number } 时间（秒）、卡路里（千卡）
 * @throws Error 如果数据格式不正确
 */
export function parseWorkoutData(value: ArrayBuffer): { time: number; calories: number } {
  if (!value || value.byteLength < 8) {
    throw new Error('Invalid workout data: insufficient bytes (need at least 8 bytes)');
  }

  const view = new DataView(value);
  
  // 读取运动时间（前4字节，32位无符号整数，小端序）
  const time = view.getUint32(0, true);
  
  // 读取卡路里（后4字节，32位无符号整数，小端序）
  // 注意：这里假设设备返回的是毫卡，需要除以1000转换为千卡
  // 根据实际设备协议，可能需要调整这个转换逻辑
  const calories = view.getUint32(4, true) / 1000;
  
  return { time, calories };
}

/**
 * 格式化时间（秒 → HH:MM:SS）
 * 
 * @param seconds 总秒数
 * @returns string 格式化后的时间字符串，格式：HH:MM:SS
 * 
 * @example
 * formatTime(3661) // "01:01:01"
 * formatTime(125)  // "00:02:05"
 */
export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * 蓝牙数据解析工具对象
 * 提供统一的接口访问所有解析函数
 */
export const bluetoothParser = {
  parseHeartRate,
  parseWorkoutData,
  formatTime,
  UUIDs: FITNESS_DEVICE_UUIDS
};

