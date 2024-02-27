import { WHISTLE_INIT_URI } from "@src/constants";

/**
 * 获取whistle配置
 * @returns {string}
 */
export function getInitInfo() {
    return fetch(
        `http://127.0.0.1:8005${WHISTLE_INIT_URI}?_-${new Date().getTime()}`,
    ).then((res) => res.json());
}

/**
 * 启用规则
 */
// export function setRuleEnable() {}

/**
 * 禁用规则
 */
// export function setRuleDisable() {}

/**
 * 获取IPv4地址
 */
// export function getIPv4Address() {}
