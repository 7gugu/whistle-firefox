import React, { useEffect, useState } from "react";
import browser, { Tabs } from "webextension-polyfill";
import { Scroller } from "@src/components/scroller";
import css from "./styles.module.css";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@src/components/ui/accordion";
import {
    WHISTLE_DEFAULT_PROXY_URI,
    WHISTLE_LOCAL_PROXY_URI_KEY,
} from "@src/constants";
import { getInitInfo } from "@src/api/fetchWhistleData";
import { getStorage, checkAllowPrivateAccess } from "@src/utils";

/**
 * Executes a string of Javascript on the current tab
 * @param code The string of code to execute on the current tab
 */
function executeScript(position: number): void {
    // Query for the active tab in the current window
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
            // browser.scripting
            //     .executeScript({
            //         target: {
            //             tabId: currentTabId,
            //         },
            //         func: scrollWindow,
            //         args: [position],
            //     })
            //     .then(() => {
            //         console.log("Done Scrolling");
            //     });
        });
}

const IndexPage: React.FC = () => {
    const [allowPrivateAccess, setAllowPrivateAccess] =
        useState<boolean>(false);
    const [proxyServerUrl, setProxyServerUrl] = useState<string>("");
    const [hasProxyServerUrl, setHasProxyServerUrl] = useState<boolean>(false);

    const checkHasProxyServerUrl = () => {
        return getStorage(WHISTLE_LOCAL_PROXY_URI_KEY).then((res: any) => {
            return res[WHISTLE_LOCAL_PROXY_URI_KEY];
        });
    };
    useEffect(() => {
        // 检查是否允许在隐私模式下运行
        checkAllowPrivateAccess().then((res) => {
            setAllowPrivateAccess(res);
        });
        // 检查本地是否有whistle服务器URL的缓存
        checkHasProxyServerUrl().then((res: any) => {
            setHasProxyServerUrl(!!res);
            setProxyServerUrl(res);
        });
    }, []);

    useEffect(() => {
        browser.proxy.settings.onChange.addListener((details) => {
            console.log(`New proxy settings: ${JSON.stringify(details.value)}`);
        });
        return () => {
            browser.proxy.settings.onChange.removeListener((details) => {
                console.log(
                    `New proxy settings: ${JSON.stringify(details.value)}`,
                );
            });
        };
    }, []);

    useEffect(() => {
        // 初始化获取whistle配置
        getInitInfo()
            .then((res) => {
                console.info(res);
                // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                // 记录IPv4地址
                // 记录开关状态
            })
            .catch(() => {
                // 服务器不可用就自动引导到设置页面
                console.error("whistle server is not available.");
                setHasProxyServerUrl(false);
            });
        //
    }, [allowPrivateAccess]);

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                {allowPrivateAccess ? (
                    <>
                        {hasProxyServerUrl ? (
                            <>
                                <Accordion
                                    type="single"
                                    collapsible
                                    className="w-full"
                                >
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>
                                            Is it accessible?
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Yes. It adheres to the WAI-ARIA
                                            design pattern.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>
                                            Is it styled?
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Yes. It comes with default styles
                                            that matches the other
                                            components&apos; aesthetic.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger>
                                            Is it animated?
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            Yes. It&apos;s animated by default,
                                            but you can disable it if you
                                            prefer.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                                <hr />
                                <Scroller
                                    onClickScrollTop={() => {
                                        browser.proxy.settings.set({
                                            value: {
                                                proxyType: "manual",
                                                http: "http://127.0.0.1:8899",
                                            },
                                        });
                                    }}
                                    onClickScrollBottom={() => {
                                        browser.proxy.settings.set({
                                            value: {
                                                proxyType: "system",
                                            },
                                        });
                                    }}
                                />
                            </>
                        ) : (
                            <div>
                                <h1>请先设置whistle服务器URL</h1>
                                {/* TODO: 增加一个localstorage的设定记录Proxy URL */}
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        <h1>请允许在隐私模式下运行</h1>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IndexPage;
