import request from "./request";

// api前缀
export const apiPrefix = 'https://www.tonyou.vip';

// 数据上报指标类型
export const reportType = {
  page: 'page',
  answer: 'answer',
  popup: 'popup',
  button: 'button',
  incentive: 'incentive'
};

/**
 * 数据上报
 * @param {*} data
 */
export function report(data) {
  const clientTs = parseInt(Date.now() / 1000);
  return request(`${apiPrefix}/api/report/point`, { ...data, clientTs }, 'POST');
}

/**
 * 登录
 * @param {*} data
 */
export function loginForToken(data) {
  return request(`${apiPrefix}/api/wechat/login`, { ...data }, 'POST');
}

/**
 * 获取账户信息
 */
export function queryAccountInfo() {
  return request(`${apiPrefix}/api/account/overview`);
}

/**
 * 获取下一个问题
 */
export function queryNextQuestion() {
  return request(`${apiPrefix}/api/question/next`);
}

/**
 * 提交答案
 * @param {*} data
 */
export function submitAnswer(data) {
  return request(`${apiPrefix}/api/question/submit`, { ...data }, 'POST');
}

/**
 * 获取过关红包金额
 * @param {*} data
 */
export function queryPassRedAmount(data) {
  return request(`${apiPrefix}/api/question/level-rp`, { ...data });
}

/**
 * 领取过关红包
 * @param {*} data
 */
export function receivePassRed(data) {
  return request(`${apiPrefix}/api/question/receive-level-rp`, { ...data }, 'POST');
}

/**
 * 获取每日打卡状态信息
 */
export function queryClockInfo() {
  return request(`${apiPrefix}/api/account/clock-in-info`);
}

/**
 * 兑换金币成余额
 * @param {*}
 */
export function goldToAmount() {
  return request(`${apiPrefix}/api/account/exchange-gold-coin`, {}, 'POST');
}

/**
 * 获取每日任务过关奖励
 * @param {*} data
 */
export function receiveDailyReward(data) {
  return request(`${apiPrefix}/api/account/receive-level-clear-reward`, { ...data }, 'POST');
}

/**
 * 上报使用时长
 * @param {*} data
 */
export function reportDuration (data) {
  return request(`${apiPrefix}/api/account/report-duration`, { ...data }, 'POST');
}

/**
 * 获取天降红包信息
 */
export function queryScheduleRedInfo() {
  return request(`${apiPrefix}/api/reward/get-schedule-rp`);
}

/**
 * 领取天降红包
 * @param {*} data
 */
export function receiveScheduleRed(data) {
  return request(`${apiPrefix}/api/reward/receive-schedule-rp`, { ...data }, 'POST');
}

/**
 * 获取红包墙列表
 */
export function queryRedWallList() {
  return request(`${apiPrefix}/api/reward/get-rp-wall`);
}

/**
 * 领取红包墙
 * @param {*} data
 */
export function receiveRedWall(data) {
  return request(`${apiPrefix}/api/reward/receive-rp-wall`, { ...data }, 'POST');
}

/**
 * 更新收款二维码
 * @param {*} data
 */
export function saveQrCodeImg(data) {
  return request(`${apiPrefix}/api/account/update-collect-money-picture`, { ...data }, 'POST');
}

/**
 * 打卡提现申请
 * @param {*} data
 */
export function clockWithdraw(data) {
  return request(`${apiPrefix}/api/reward/clock-in-withdraw`, { ...data }, 'POST');
}

/**
 * 查询红包墙红包金币数
 */
export function queryRedWallAmount() {
  return request(`${apiPrefix}/api/reward/get-rp-wall-gold-coin`);
}

/**
 * 查询是否显示
 */
export function queryIsShow() {
  return request(`${apiPrefix}/api/wechat/check-version`, { version: '1.0.5' });
}
