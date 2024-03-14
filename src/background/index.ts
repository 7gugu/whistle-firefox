import {
    WHISTLE_LOCAL_PROXY_URI_KEY,
    WHISTLE_AUTO_REFRESH_KEY,
} from "@src/constants";
import { getStorage, setBadge, refreshWebPage } from "@src/utils";
import browser from "webextension-polyfill";

let proxyStatus = false;

browser.runtime.onMessage.addListener((request: { activeRules: number }) => {
    setBadge(request.activeRules);
});

browser.contextMenus.create(
    {
        id: "switch-proxy",
        title: "设置代理服务",
    },
    () => {
        if (browser.runtime.lastError) {
            console.log(`Error: ${browser.runtime.lastError}`);
        } else {
            console.log("Item created successfully");
        }
    },
);

function checkProxyStatus() {
    browser.proxy.settings.get({}).then((res) => {
        const {
            value: { proxyType },
        } = res;
        if (proxyType === "manual") {
            proxyStatus = true;
            browser.action.setIcon({
                path: {
                    "16": "active@16.png",
                    "48": "active@48.png",
                    "128": "active@128.png",
                },
            });
        } else {
            proxyStatus = false;
            browser.action.setIcon({
                path: {
                    "16": "unactive@16.png",
                    "48": "unactive@48.png",
                    "128": "unactive@128.png",
                },
            });
        }
    });
}

browser.proxy.settings.onChange.addListener((details) => {
    console.log(`>> ${JSON.stringify(details.value)}`);
    checkProxyStatus();
});

function getProxyServerUrl() {
    return getStorage(WHISTLE_LOCAL_PROXY_URI_KEY)
        .then((res: any) => {
            return res[WHISTLE_LOCAL_PROXY_URI_KEY];
        })
        .catch(() => {
            return null;
        });
}

function switchProxy() {
    if (proxyStatus) {
        return browser.proxy.settings.set({
            value: {
                proxyType: "system",
            },
        });
    } else {
        return getProxyServerUrl().then((res: any) => {
            return browser.proxy.settings.set({
                value: {
                    proxyType: "manual",
                    http: `${res}`,
                },
            });
        });
    }
}

function getAutoRefresh() {
    return getStorage(WHISTLE_AUTO_REFRESH_KEY)
        .then((res: any) => {
            return res[WHISTLE_AUTO_REFRESH_KEY];
        })
        .catch(() => {
            return null;
        });
}

checkProxyStatus();

browser.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "switch-proxy":
            switchProxy().then(() => {
                getAutoRefresh().then((res: any) => {
                    if (res) {
                        refreshWebPage();
                    }
                });
            });
            break;
    }
});
