import {
    WHISTLE_INIT_URI,
    WHISTLE_MULTI_RULES_URI,
    WHISTLE_SELECT_DEFAULT_URI,
    WHISTLE_SELECT_URI,
    WHISTLE_UNSELECT_DEFAULT_URI,
    WHISTLE_UNSELECT_URI,
} from "@src/constants";

/**
 * 获取whistle配置
 * @params {string} url - whistle配置地址
 * @returns {string}
 */
export function getInitInfo(params: { url: string }) {
    const { url = WHISTLE_INIT_URI } = params;
    return fetch(`${url}${WHISTLE_INIT_URI}?_-${new Date().getTime()}`).then(
        (res) => res.json(),
    );
}

/**
 * 启用规则
 * @params {string} url - whistle配置地址
 * @params {string} clientId - 客户端ID
 * @params {object} rule - 规则
 * @returns {Promise<any>}
 */
export function setRuleEnable(params: {
    url: string;
    clientId: string;
    rule: { name: string; data: string; index: number };
}) {
    const { url = WHISTLE_INIT_URI, clientId, rule } = params;
    return fetch(`${url}${WHISTLE_SELECT_URI}?_-${new Date().getTime()}`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            clientId: clientId,
            name: rule.name,
            value: rule.data,
            selected: "true",
            active: "true",
            key: `w-reactkey-${rule.index + 2}`,
            icon: "checkbox",
            hide: "false",
            changed: "false",
        }),
    }).then((res) => res.json());
}

/**
 * 禁用规则
 * @params {string} url - whistle配置地址
 * @params {string} clientId - 客户端ID
 * @params {object} rule - 规则
 * @returns {Promise<any>}
 */
export function setRuleDisable(params: {
    url: string;
    clientId: string;
    rule: { name: string; data: string; index: number };
}) {
    const { url = WHISTLE_INIT_URI, clientId, rule } = params;
    return fetch(`${url}${WHISTLE_UNSELECT_URI}?_-${new Date().getTime()}`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            clientId: clientId,
            name: rule.name,
            value: rule.data,
            selected: "true",
            active: "true",
            key: `w-reactkey-${rule.index + 2}`,
            icon: "checkbox",
            hide: "false",
            changed: "false",
        }),
    }).then((res) => res.json());
}

/**
 * 启用默认规则
 * @params {string} url - whistle配置地址
 * @params {string} clientId - 客户端ID
 * @params {object} rule - 规则
 * @returns {Promise<any>}
 */
export function setDefaultRuleEnable(params: {
    url: string;
    clientId: string;
    rule: { name: string; data: string; index: number };
}) {
    const { url, clientId, rule } = params;
    return fetch(
        `${url}${WHISTLE_SELECT_DEFAULT_URI}?_-${new Date().getTime()}`,
        {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                clientId,
                name: "Default",
                fixed: "true",
                value: rule.data,
                selected: "true",
                isDefault: "true",
                active: "true",
                key: "w-reactkey-1",
                icon: "checkbox",
            }),
        },
    );
}

/**
 * 禁用默认规则
 * @params {string} url - whistle配置地址
 * @params {string} clientId - 客户端ID
 * @params {object} rule - 规则
 * @returns {Promise<any>}
 */
export function setDefaultRuleDisable(params: {
    url: string;
    clientId: string;
    rule: { name: string; data: string; index: number };
}) {
    const { url, clientId, rule } = params;
    return fetch(
        `${url}${WHISTLE_UNSELECT_DEFAULT_URI}?_-${new Date().getTime()}`,
        {
            method: "post",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                clientId,
                name: "Default",
                fixed: "true",
                value: rule.data,
                selected: "true",
                isDefault: "true",
                active: "true",
                key: "w-reactkey-1",
                icon: "checkbox",
            }),
        },
    );
}

/**
 * 设置是否允许多选规则
 * @params {string} url - whistle配置地址
 * @params {string} clientId - 客户端ID
 * @params {boolean} allowMultipleChoice - 是否允许多选
 * @returns {Promise<any>}
 */
export function setAllowMultipleChoice(params: {
    url: string;
    clientId: string;
    allowMultipleChoice: boolean;
}) {
    const { url, clientId, allowMultipleChoice } = params;
    return fetch(`${url}${WHISTLE_MULTI_RULES_URI}`, {
        method: "post",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            clientId,
            allowMultipleChoice: allowMultipleChoice ? "1" : "0",
        }),
    });
}
