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

import { Input } from "@src/components/ui/input";
import { WHISTLE_LOCAL_PROXY_URI_KEY } from "@src/constants";
import { getInitInfo } from "@src/api/fetchWhistleData";
import {
    getStorage,
    checkAllowPrivateAccess,
    cn,
    setStorage,
    refreshPage,
    setBadge,
} from "@src/utils";
import { Button } from "@src/components/ui/button";
import { Label } from "@src/components/ui/label";
import { Switch } from "@src/components/ui/switch";
import BlackListPanel from "@src/components/BlackListPanel";
import RulePanel from "@src/components/RulePanel";
import { PassThrough } from "stream";

const IndexPage: React.FC = () => {
    const [allowPrivateAccess, setAllowPrivateAccess] =
        useState<boolean>(false);
    const [proxyServerUrl, setProxyServerUrl] = useState<string>("");
    const [hasProxyServerUrl, setHasProxyServerUrl] = useState<boolean>(false);
    const proxyServerUrlRef = useRef<string>("");
    const [hideStarter, setHideStarter] = useState<boolean>(true);
    const [whistleData, setWhistleData] = useState<any>({});

    const jumpToWhistle = () => {
        getProxyServerUrl().then((res: any) => {
            browser.tabs.create({
                url: res.indexOf("http://") >= 0 ? res : `http://${res}`,
            });
        });
    };
    const checkHasProxyServerUrl = () => {
        return getProxyServerUrl();
    };

    const getProxyServerUrl = () => {
        return getStorage(WHISTLE_LOCAL_PROXY_URI_KEY)
            .then((res: any) => {
                return res[WHISTLE_LOCAL_PROXY_URI_KEY];
            })
            .catch(() => {
                return null;
            });
    };

    const saveProxyServerUrl = () => {
        const url = proxyServerUrlRef.current;
        if (!url) {
            // refreshPage();
            return;
        }
        getInitInfo(url)
            .then((res) => {
                setHasProxyServerUrl(true);
                setHideStarter(true);
                setProxyServerUrl(url);
                setStorage(WHISTLE_LOCAL_PROXY_URI_KEY, url);
                // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                // 记录IPv4地址
                // 记录开关状态
            })
            .catch(() => {
                // 服务器不可用就自动引导到设置页面
                console.error("whistle server is not available.");
                setHasProxyServerUrl(false);
                setProxyServerUrl("");
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
            setHideStarter(!!res);
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
        getProxyServerUrl()
            .then((res: any) => {
                // 初始化获取whistle配置
                getInitInfo(res)
                    .then((res) => {
                        console.info(res);
                        setWhistleData(res);
                        // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                        // 记录IPv4地址
                        // 记录开关状态
                        const activeRules =
                            res.rules.list.filter((rule: any) => rule.selected)
                                .length +
                            (res.rules.defaultRulesIsDisabled ? 0 : 1);
                        browser.runtime.sendMessage({ activeRules });

                        console.info(
                            activeRules,
                            res.rules.defaultRulesIsDisabled ? 0 : 1,
                            res.rules.list.filter((rule: any) => rule.selected)
                                .length,
                        );
                    })
                    .catch((err) => {
                        // 服务器不可用就自动引导到设置页面
                        console.error("whistle server is not available.", err);
                        setHasProxyServerUrl(false);
                        setWhistleData({});
                    });
            })
            .catch(() => {
                // 服务器不可用就自动引导到设置页面
                console.error("whistle server is not available.");
                setHasProxyServerUrl(false);
                setHideStarter(false);
            });
    }, [allowPrivateAccess]);

    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-6 my-6">
                {allowPrivateAccess ? (
                    <>
                        {hasProxyServerUrl && hideStarter ? (
                            <>
                                <Tabs defaultValue="rule" className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger
                                            value="rule"
                                            className="data-[state=active]:bg-white"
                                        >
                                            规则管理
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="blackList"
                                            className="data-[state=active]:bg-white"
                                        >
                                            黑名单设置
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="status"
                                            className="data-[state=active]:bg-white"
                                        >
                                            状态设置
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="rule">
                                        <RulePanel />
                                    </TabsContent>
                                    <TabsContent value="blackList">
                                        <BlackListPanel />
                                    </TabsContent>
                                    <TabsContent value="status">
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="airplane-mode">
                                                多规则
                                            </Label>
                                            <Switch id="airplane-mode" />
                                            <Label htmlFor="airplane-mode">
                                                支持多规则
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="airplane-mode">
                                                自动刷新
                                            </Label>
                                            <Switch
                                                id="airplane-mode"
                                                defaultChecked={true}
                                            />
                                            <Label htmlFor="airplane-mode">
                                                启用/停用新规则后自动刷新页面
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="airplane-mode">
                                                代理服务器端口
                                            </Label>

                                            <p
                                                className={cn(
                                                    "text-sm text-muted-foreground",
                                                )}
                                            >
                                                8899
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Label htmlFor="airplane-mode">
                                                代理服务器Ipv4
                                            </Label>
                                            <p
                                                className={cn(
                                                    "text-sm text-muted-foreground",
                                                )}
                                            >
                                                192.168.0.1
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                type="submit"
                                                onClick={() => {
                                                    setHideStarter(false);
                                                }}
                                            >
                                                更换代理地址
                                            </Button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                type="submit"
                                                onClick={() => {
                                                    setHideStarter(false);
                                                }}
                                            >
                                                点击设置快捷键
                                            </Button>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                type="submit"
                                                onClick={() => {
                                                    jumpToWhistle();
                                                }}
                                            >
                                                更多设置
                                            </Button>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <hr />
                                <Scroller
                                    onClickScrollTop={() => {
                                        getProxyServerUrl().then((res: any) => {
                                            browser.proxy.settings.set({
                                                value: {
                                                    proxyType: "manual",
                                                    http: `${res}`,
                                                },
                                            });
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
                                    defaultValue={proxyServerUrl}
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
