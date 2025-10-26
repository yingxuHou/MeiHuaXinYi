/**
 * 时间工具函数
 * 用于获取当前北京时间和时辰计算
 */

/**
 * 获取当前北京时间
 * @returns {Date} 北京时间对象
 */
function getBeijingTime() {
  const now = new Date();
  // 北京时间是UTC+8
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
  return beijingTime;
}

/**
 * 获取当前北京时间的小时数
 * @returns {number} 小时数 (0-23)
 */
function getBeijingHour() {
  const beijingTime = getBeijingTime();
  return beijingTime.getUTCHours();
}

/**
 * 根据小时数获取时辰编号
 * @param {number} hour - 小时数 (0-23)
 * @returns {number} 时辰编号 (1-12)
 */
function getHourNumber(hour) {
  const HOUR_TO_NUMBER = {
    23: 1, 0: 1, 1: 1,    // 子时 (23时-1时)
    2: 2, 3: 2,           // 丑时 (1时-3时)
    4: 3, 5: 3,           // 寅时 (3时-5时)
    6: 4, 7: 4,           // 卯时 (5时-7时)
    8: 5, 9: 5,           // 辰时 (7时-9时)
    10: 6, 11: 6,         // 巳时 (9时-11时)
    12: 7, 13: 7,         // 午时 (11时-13时)
    14: 8, 15: 8,         // 未时 (13时-15时)
    16: 9, 17: 9,         // 申时 (15时-17时)
    18: 10, 19: 10,       // 酉时 (17时-19时)
    20: 11, 21: 11,       // 戌时 (19时-21时)
    22: 12                // 亥时 (21时-23时)
  };
  
  return HOUR_TO_NUMBER[hour] || 1;
}

/**
 * 获取当前时辰编号
 * @returns {number} 当前时辰编号 (1-12)
 */
function getCurrentHourNumber() {
  const currentHour = getBeijingHour();
  return getHourNumber(currentHour);
}

/**
 * 获取时辰名称
 * @param {number} hourNumber - 时辰编号 (1-12)
 * @returns {string} 时辰名称
 */
function getHourName(hourNumber) {
  const HOUR_NAMES = {
    1: '子时',
    2: '丑时', 
    3: '寅时',
    4: '卯时',
    5: '辰时',
    6: '巳时',
    7: '午时',
    8: '未时',
    9: '申时',
    10: '酉时',
    11: '戌时',
    12: '亥时'
  };
  
  return HOUR_NAMES[hourNumber] || '子时';
}

/**
 * 获取当前时辰名称
 * @returns {string} 当前时辰名称
 */
function getCurrentHourName() {
  const hourNumber = getCurrentHourNumber();
  return getHourName(hourNumber);
}

/**
 * 格式化北京时间显示
 * @param {Date} date - 日期对象
 * @returns {string} 格式化的时间字符串
 */
function formatBeijingTime(date = null) {
  const beijingTime = date || getBeijingTime();
  const year = beijingTime.getUTCFullYear();
  const month = String(beijingTime.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijingTime.getUTCDate()).padStart(2, '0');
  const hours = String(beijingTime.getUTCHours()).padStart(2, '0');
  const minutes = String(beijingTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(beijingTime.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取当前北京时间的完整信息
 * @returns {Object} 时间信息对象
 */
function getCurrentTimeInfo() {
  const beijingTime = getBeijingTime();
  const hour = getBeijingHour();
  const hourNumber = getCurrentHourNumber();
  const hourName = getCurrentHourName();
  
  return {
    beijingTime: beijingTime,
    formattedTime: formatBeijingTime(beijingTime),
    hour: hour,
    hourNumber: hourNumber,
    hourName: hourName,
    timestamp: beijingTime.getTime()
  };
}

module.exports = {
  getBeijingTime,
  getBeijingHour,
  getHourNumber,
  getCurrentHourNumber,
  getHourName,
  getCurrentHourName,
  formatBeijingTime,
  getCurrentTimeInfo
};
