/**
 * @file 主要用于埋点
 * 仅限订单列表使用
 */
import { TrackerLevel, throwTrackerError } from '@xhs/nightcrawler';
import trackerTemplate from '@xhs/protobuf-armor-lancer-order-tracker/tracker_template';
import { useRef } from 'react';

import { toHump } from './utils';

// 唯一Key新增下划线处理
const topKeyLibrary = {
  mallOrderTarget_: true,
  index_: true,
  mallGoodsTarget_: true,
  channelTabTarget_: true,
  mallOrderPackageTarget_: true,
  mallCouponTarget_: true,
  event_: true,
};

const hasTopKey = (originalKey) => {
  const first_Index = originalKey.indexOf('_');
  if (first_Index === -1) return false;
  const index = first_Index + 1;
  const topKey = originalKey.slice(0, index);
  const isTop = topKeyLibrary[topKey];
  if (!isTop) return false;
  return {
    topKey: topKey,
    restKey: originalKey.slice(index),
  };
};

/**
 * xaa_bb 转 xaaBb
 * aaBb 直接返回
 */
const keyToHump = (object) => {
  if (!object || typeof object !== 'object') return object;

  try {
    Object.keys(object).forEach((originalKey) => {
      const value = object[originalKey];
      const _hasTopKey = hasTopKey(originalKey);

      if (!_hasTopKey) {
        const humpKey = toHump(originalKey);
        if (humpKey !== value) {
          delete object[originalKey];
          object[humpKey] = value;
        }
      } else {
        // 多层结构重名处理
        const { topKey, restKey } = _hasTopKey;
        const humpKey = `${topKey}${toHump(restKey)}`;
        if (humpKey !== value) {
          delete object[originalKey];
          object[humpKey] = value;
        }
      }
    });
  } catch (error) {
    return error;
  }
};

/**
 * @param { any } level [可选]保障等级(默认是2)
 */
const getLevel = (level: number | string = 2) => {
  return TrackerLevel[`P${level}`];
};

/**
 * @param { string } id [必填]点位ID
 * @param { number= } level [可选]保障等级(默认是2)
 * @param { any= } error [可选]埋点组件返回的信息
 */
const trackerErrorHandle = (id, level, error) => {
  throwTrackerError(
    `点位 '${id}' 处理失败`,
    error,
    String(id),
    getLevel(level)
  );
};

/**
 * 埋点主函数
 *
 * @param { string } id [必填]点位ID
 * @param { object= } params [可选]入参
 * @param { number } level [可选]保障等级(默认是2)
 * @return { Promise }
 */
const record = (id: number, params?: any, level?: number): Promise<{then:any, catch:any, pre:any, next:any, before:any}> => {
  // 大小写转换前劫持
  let preCallback = (props) => props;

  // 大小写转换后劫持
  let nextCallback = (props) => props;

  // 临发送前劫持
  let beforeCallback = (props) => props;

  // 执行任务
  const task = (resolve, reject) => {
    if (!id) return reject('No pointer id!');
    // 查找埋点模版
    const recordTemplate = trackerTemplate[id];
    if (!recordTemplate || !(recordTemplate instanceof Function)) {
      return reject(`Pointer '${id}' is not define!`);
    }

    // 下划线转驼峰
    keyToHump(preCallback(params));

    // 获取最终数据
    const data = recordTemplate(nextCallback(params));

    // 直接发送
    GLOBAL.eaglet
      .flush(beforeCallback(data))
      .then(resolve)
      .catch((error) => {
        trackerErrorHandle(id, level, error);
        reject(error);
      });
  };

  const promise: {then:any, catch:any, pre:any, next:any, before:any} = new Promise<any>((resolve, reject) => queueMicrotask(() => task(resolve, reject)));

  // 大小写转换前
  promise.pre = (callback) => {
    preCallback = callback;
    return promise;
  };

  // 大小写转换后
  promise.next = (callback) => {
    nextCallback = callback;
    return promise;
  };

  // 发送前劫持
  promise.before = (callback) => {
    beforeCallback = callback;
    return promise;
  };

  return promise;
};

/**
 * 曝光埋点,自动去重
 * @param { number } pointId 点位ID
 * @example const someExp = initExp(); someExp(pointId, params, level);
 * @example const someExp = initExp(pointId); someExp(params, level); // 推荐
 * @return { Function } 对record做劫持的函数
 */
export const initExp = (pointId?: number) => {
  const isRepeatMemo = useRef(false);
  return (...arg) => {
    if (isRepeatMemo.current) return Promise.reject('repeat');

    const [id, params, level] = arg;

    if (typeof id === 'number') {
      isRepeatMemo.current = true;
      return record(pointId || id, params, level);
    }

    if (typeof pointId === 'number' && typeof id !== 'number') {
      // 此时 id => params
      // 此时 params => level
      isRepeatMemo.current = true;
      return record(pointId, id, params);
    }

    return Promise.reject('No pointId!');
  };
};

/**
 * 点击埋点，只是为了代码风格更加语义化
 */
export const flushClick = record;

export default record;
