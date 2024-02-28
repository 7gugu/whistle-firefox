import React, { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";
import { Scroller } from "@src/components/scroller";
import css from "./styles.module.css";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@src/components/ui/tabs";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@src/components/ui/accordion";
import { Input } from "@src/components/ui/input";
import {
    WHISTLE_DEFAULT_PROXY_URI,
    WHISTLE_LOCAL_PROXY_URI_KEY,
} from "@src/constants";
import { getInitInfo } from "@src/api/fetchWhistleData";
import {
    getStorage,
    checkAllowPrivateAccess,
    cn,
    setStorage,
    refreshPage,
} from "@src/utils";
import { Button } from "@src/components/ui/button";
import { Label } from "@src/components/ui/label";

const IndexPage: React.FC = () => {
    const [allowPrivateAccess, setAllowPrivateAccess] =
        useState<boolean>(false);
    const [proxyServerUrl, setProxyServerUrl] = useState<string>("");
    const [hasProxyServerUrl, setHasProxyServerUrl] = useState<boolean>(false);
    const proxyServerUrlRef = useRef<string>("");
    const [hideStarter, setHideStarter] = useState<boolean>(true);
    const checkHasProxyServerUrl = () => {
        return getStorage(WHISTLE_LOCAL_PROXY_URI_KEY).then((res: any) => {
            return res[WHISTLE_LOCAL_PROXY_URI_KEY];
        });
    };

    const saveProxyServerUrl = () => {
        const url = proxyServerUrlRef.current;
        if (!url) {
            refreshPage();
        }
        setStorage(WHISTLE_LOCAL_PROXY_URI_KEY, url)?.then(() => {
            getInitInfo()
                .then((res) => {
                    setHasProxyServerUrl(true);
                    setProxyServerUrl(url);
                    console.info(res);
                    // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                    // 记录IPv4地址
                    // 记录开关状态
                })
                .catch(() => {
                    // 服务器不可用就自动引导到设置页面
                    console.error("whistle server is not available.");
                    setHasProxyServerUrl(false);
                    setProxyServerUrl("");
                    refreshPage();
                });
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
                        {hasProxyServerUrl && hideStarter ? (
                            <>
                                <Tabs defaultValue="rule" className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger
                                            value="rule"
                                            className="data-[state=active]:bg-white"
                                        >
                                            Rule
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="status"
                                            className="data-[state=active]:bg-white"
                                        >
                                            Status
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="rule">
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
                                                    Yes. It adheres to the
                                                    WAI-ARIA design pattern.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-2">
                                                <AccordionTrigger>
                                                    Is it styled?
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    Yes. It comes with default
                                                    styles that matches the
                                                    other components&apos;
                                                    aesthetic.
                                                </AccordionContent>
                                            </AccordionItem>
                                            <AccordionItem value="item-3">
                                                <AccordionTrigger>
                                                    Is it animated?
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    Yes. It&apos;s animated by
                                                    default, but you can disable
                                                    it if you prefer.
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TabsContent>
                                    <TabsContent value="status">
                                        <Button
                                            type="submit"
                                            onClick={() => {
                                                setHideStarter(false);
                                            }}
                                        >
                                            设置代理地址
                                        </Button>
                                    </TabsContent>
                                </Tabs>

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
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="email">
                                    设置Whistle代理地址
                                </Label>
                                <Input
                                    type="text"
                                    value={proxyServerUrl}
                                    placeholder="http://127.0.0.1:8899"
                                    onChange={(str) => {
                                        proxyServerUrlRef.current =
                                            str.target.value;
                                    }}
                                />
                                <p
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                    )}
                                >
                                    加载失败，请确认whistle已经启动（若设置了密码，请确保在浏览器中已经打开并登录）且下面的地址是正确的（若不正确，输入正确的地址）
                                </p>
                                <Button
                                    type="submit"
                                    onClick={saveProxyServerUrl}
                                >
                                    保存配置
                                </Button>
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
