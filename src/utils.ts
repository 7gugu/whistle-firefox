import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import browser, { Tabs } from "webextension-polyfill";
import { WHISTLE_DEFAULT_PROXY_URI } from "./constants";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getStorage(key: string): any {
    try {
        return browser.storage.local.get(key);
    } catch (e) {
        console.error("getLocalStorage error", e);
    }
}

export function setStorage(key: string, value: any) {
    try {
        return browser.storage.local.set({ [key]: value });
    } catch (e) {
        console.error("setLocalStorage error", e);
    }
}

/**
 * 设置Icon角标
 * @param count 已激活的规则数量
 */
export function setBadge(count: number) {
    // browser.action.setBadgeBackgroundColor({
    //     color: "#f0ac58",
    // });
    browser.action.setBadgeText({ text: count ? count.toString() : "" });
}

/**
 * 启用浏览器代理
 * @desc 默认使用http://127.0.0.1:8899
 * @param serverUrl
 */
function setBrowserProxyEnable(serverUrl: string) {
    browser.proxy.settings.set({
        value: {
            proxyType: "manual",
            http: serverUrl || WHISTLE_DEFAULT_PROXY_URI,
        },
    });
}

/**
 * 禁用浏览器代理
 * @desc 使用系统代理
 */
function setBrowserProxyDisable() {
    browser.proxy.settings.set({
        value: {
            proxyType: "system",
        },
    });
}

/**
 * 过滤代理服务器URL
 */
export function filterProxyServerUrl(serverUrl: string) {
    return serverUrl.replace(/\/$/, "");
}

/**
 * 是否允许在隐私模式下运行
 * @desc 代理会全局生效，所以需要判断是否允许在隐私模式下运行
 * @returns {Promise<boolean>}
 */
export async function checkAllowPrivateAccess(): Promise<boolean> {
    return browser.extension.isAllowedIncognitoAccess();
}

/**
 * 刷新插件页面
 */
export function refreshPage() {
    browser.runtime.reload();
}

export const refreshWebPage = () => {
    browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs: Tabs.Tab[]) => {
            // Pulls current tab from browser.tabs.query response
            const currentTab: Tabs.Tab | number = tabs[0];

            // Short circuits function execution is current tab isn't found
            if (!currentTab) {
                return;
            }
            const currentTabId: number = currentTab.id as number;

            // Executes the script in the current tab
            browser.scripting
                .executeScript({
                    target: {
                        tabId: currentTabId,
                    },
                    func: () => {
                        window.location.reload();
                    },
                    args: [],
                })
                .then(() => {
                    console.log("Done Scrolling");
                });
        });
};
