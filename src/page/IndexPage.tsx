import React, { useEffect, useRef, useState } from "react";
import browser from "webextension-polyfill";

import {
    ENUM_WHISTLE_TABS,
    WHISTLE_AUTO_REFRESH_KEY,
    WHISTLE_LOCAL_PROXY_URI_KEY,
} from "@src/constants";
import { getInitInfo } from "@src/api/fetchWhistleData";
import {
    getStorage,
    checkAllowPrivateAccess,
    cn,
    setStorage,
    refreshWebPage,
} from "@src/utils";
import { Label } from "@src/components/ui/label";
import BlackListPanel from "@src/components/BlackListPanel";
import RulePanel from "@src/components/RulePanel";
import {
    Alert,
    Col,
    Row,
    Switch,
    Segmented,
    Button,
    Input,
    Divider,
    Typography,
    message,
} from "antd";
const { Text } = Typography;
import { getProxyServerUrl } from "@src/utils";
import StatusPanel from "@src/components/StatusPanel";

const IndexPage: React.FC = () => {
    const [allowPrivateAccess, setAllowPrivateAccess] =
        useState<boolean>(false);
    const [proxyServerUrl, setProxyServerUrl] = useState<string>("");
    const [hasProxyServerUrl, setHasProxyServerUrl] = useState<boolean>(false);
    const proxyServerUrlRef = useRef<string>(proxyServerUrl);
    const [hideStarter, setHideStarter] = useState<boolean>(true);
    const [whistleData, setWhistleData] = useState<any>({});
    const [proxyStatus, setProxyStatus] = useState<boolean>(false);
    const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
    const [tabIndex, setTabIndex] = useState<string>(ENUM_WHISTLE_TABS.RULES);
    const [messageApi, contextHolder] = message.useMessage();
    const checkHasProxyServerUrl = () => {
        return getProxyServerUrl();
    };

    const saveProxyServerUrl = () => {
        const url = proxyServerUrlRef.current;
        if (!url) {
            messageApi.open({
                type: "error",
                duration: 1,
                content: "请输入正确的whistle代理服务器地址。",
            });
            return;
        }
        getInitInfo({ url })
            .then((res) => {
                setWhistleData(res);
                setHasProxyServerUrl(true);
                setHideStarter(true);
                setProxyServerUrl(url);
                setStorage(WHISTLE_LOCAL_PROXY_URI_KEY, url);
                // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                // 记录IPv4地址
                // 记录开关状态
                messageApi.open({
                    type: "success",
                    duration: 1,
                    content: "保存成功!",
                });
            })
            .catch(() => {
                // 服务器不可用就自动引导到设置页面
                console.error("whistle server is not available.");
                messageApi.open({
                    type: "error",
                    duration: 1,
                    content:
                        "whistle代理服务器不可用，请检查代理服务器地址。",
                });
                setHasProxyServerUrl(false);
                setProxyServerUrl("");
            });
    };

    const getAutoRefresh = () => {
        return getStorage(WHISTLE_AUTO_REFRESH_KEY)
            .then((res: any) => {
                return res[WHISTLE_AUTO_REFRESH_KEY];
            })
            .catch(() => {
                return null;
            });
    };

    const refreshWhistleData = () => {
        getInitInfo({ url: proxyServerUrl }).then((res) => {
            setWhistleData(res);
            const activeRules =
                res.rules.list.filter((rule: any) => rule.selected).length +
                (res.rules.defaultRulesIsDisabled ? 0 : 1);
            browser.runtime.sendMessage({ activeRules });
        });
        checkProxyStatus();
    };

    const checkProxyStatus = () => {
        browser.proxy.settings.get({}).then((res) => {
            const {
                value: { proxyType },
            } = res;
            if (proxyType === "manual") {
                setProxyStatus(true);
                browser.action.setIcon({
                    path: {
                        "16": "active@16.png",
                        "48": "active@48.png",
                        "128": "active@128.png",
                    },
                });
            } else {
                setProxyStatus(false);
                browser.action.setIcon({
                    path: {
                        "16": "unactive@16.png",
                        "48": "unactive@48.png",
                        "128": "unactive@128.png",
                    },
                });
            }
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
        // 检查是否启用代理
        checkProxyStatus();
        // 初始化自动刷新状态
        getAutoRefresh().then((res: any) => {
            setAutoRefresh(res);
        });
    }, []);

    useEffect(() => {
        browser.proxy.settings.onChange.addListener((details) => {
            console.log(`New proxy settings: ${JSON.stringify(details.value)}`);
            checkProxyStatus();
            console.info(autoRefresh);
            getAutoRefresh().then((res: any) => {
                res && refreshWebPage();
            });
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
                getInitInfo({ url: res })
                    .then((res) => {
                        console.info("getInitInfo>>", res);
                        setWhistleData(res);
                        // 可用就记录规则名称/分组名称 以及规则数量和规则状态
                        // 记录IPv4地址
                        // 记录开关状态
                        const activeRules =
                            res.rules.list.filter((rule: any) => rule.selected)
                                .length +
                            (res.rules.defaultRulesIsDisabled ? 0 : 1);
                        browser.runtime.sendMessage({ activeRules });
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

    return (
        <div
            style={{
                width: 320,
            }}
        >
            {contextHolder}
            <Row>
                <Col span={24}>
                    {allowPrivateAccess ? (
                        <>
                            {hasProxyServerUrl && hideStarter ? (
                                <>
                                    <Segmented
                                        options={[
                                            ENUM_WHISTLE_TABS.RULES,
                                            ENUM_WHISTLE_TABS.BLACKLIST,
                                            ENUM_WHISTLE_TABS.STATUS,
                                        ]}
                                        onChange={(value) => {
                                            setTabIndex(value);
                                        }}
                                        block
                                    />
                                    <div
                                        style={{
                                            height: 280,
                                            margin: 10,
                                            overflowY: "auto",
                                        }}
                                    >
                                        {tabIndex ===
                                        ENUM_WHISTLE_TABS.RULES ? (
                                            <RulePanel
                                                whistleData={whistleData}
                                                refreshData={refreshWhistleData}
                                            />
                                        ) : null}
                                        {tabIndex ===
                                        ENUM_WHISTLE_TABS.BLACKLIST ? (
                                            <BlackListPanel />
                                        ) : null}
                                        {tabIndex ===
                                        ENUM_WHISTLE_TABS.STATUS ? (
                                            <StatusPanel
                                                whistleData={whistleData}
                                                refreshData={refreshWhistleData}
                                                setHideStarter={setHideStarter}
                                            />
                                        ) : null}
                                    </div>
                                    <Divider />
                                    <div
                                        style={{
                                            marginLeft: 5,
                                            marginRight: 10,
                                        }}
                                    >
                                        <Row justify="center">
                                            <Col span={22}>
                                                {" "}
                                                <Label htmlFor="airplane-mode">
                                                    设置代理服务
                                                </Label>
                                            </Col>
                                            <Col span={2}>
                                                <Switch
                                                    size="small"
                                                    checked={proxyStatus}
                                                    onClick={() => {
                                                        if (proxyStatus) {
                                                            browser.proxy.settings.set(
                                                                {
                                                                    value: {
                                                                        proxyType:
                                                                            "system",
                                                                    },
                                                                },
                                                            );
                                                        } else {
                                                            getProxyServerUrl().then(
                                                                (res: any) => {
                                                                    browser.proxy.settings.set(
                                                                        {
                                                                            value: {
                                                                                proxyType:
                                                                                    "manual",
                                                                                http: `${res}`,
                                                                                https: `${res}`,
                                                                            },
                                                                        },
                                                                    );
                                                                },
                                                            );
                                                        }
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Text strong>设置Whistle代理地址</Text>
                                    <div style={{ marginBottom: 10 }}>
                                        <Input
                                            type="text"
                                            defaultValue={proxyServerUrl}
                                            placeholder="http://127.0.0.1:8899"
                                            onChange={(str) => {
                                                proxyServerUrlRef.current =
                                                    str.target.value;
                                            }}
                                        />
                                        <Text type="secondary">
                                            加载失败，请确认whistle已经启动（若设置了密码，请确保在浏览器中已经打开并登录）且下面的地址是正确的（若不正确，输入正确的地址）
                                        </Text>
                                    </div>

                                    <Button
                                        type="primary"
                                        onClick={saveProxyServerUrl}
                                    >
                                        保存配置
                                    </Button>
                                </>
                            )}
                        </>
                    ) : (
                        <Alert
                            message="请允许在隐私模式下运行"
                            type="error"
                            showIcon
                        />
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default IndexPage;
