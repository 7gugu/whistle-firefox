import React, { useEffect, useState } from "react";
import { Button, Col, Row, Switch, Typography, Space } from "antd";
const { Text, Link } = Typography;
import { setAllowMultipleChoice } from "@src/api/fetchWhistleData";
import { cn, getProxyServerUrl, setStorage } from "../../utils";
import { WHISTLE_AUTO_REFRESH_KEY } from "@src/constants";
import { CopyOutlined } from "@ant-design/icons";
import browser from "webextension-polyfill";

export interface StatusPanelProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    whistleData: any;
    refreshData: () => void;
    setHideStarter: (hideStarter: boolean) => void;
}

const StatusPanel: React.FC<StatusPanelProps> = (props: StatusPanelProps) => {
    const { whistleData, refreshData, setHideStarter } = props;

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [proxyServerUrl, setProxyServerUrl] = useState("");

    const saveAutoRefresh = (autoRefresh: boolean) => {
        setStorage(WHISTLE_AUTO_REFRESH_KEY, autoRefresh);
    };

    const jumpToWhistle = () => {
        getProxyServerUrl().then((res: string) => {
            browser.tabs.create({
                url: res.indexOf("http://") >= 0 ? res : `http://${res}`,
            });
        });
    };

    useEffect(() => {
        // 获取代理服务器地址
        getProxyServerUrl().then((res: string) => {
            setProxyServerUrl(res);
        });
    }, [whistleData]);

    return (
        <Row>
            <Col span={6}>
                <Text strong>多规则</Text>
            </Col>
            <Col span={18}>
                <Switch
                    size="small"
                    checked={whistleData?.rules?.allowMultipleChoice}
                    onClick={() => {
                        setAllowMultipleChoice({
                            url: proxyServerUrl,
                            clientId: whistleData?.clientId,
                            allowMultipleChoice:
                                !whistleData?.rules?.allowMultipleChoice,
                        }).then(() => {
                            refreshData();
                        });
                    }}
                />
                <br />
                <Text type="secondary">支持多规则</Text>
            </Col>
            <Col span={6}>
                <Text strong>自动刷新</Text>
            </Col>
            <Col span={18}>
                <Switch
                    size="small"
                    checked={autoRefresh}
                    onClick={() => {
                        setAutoRefresh(!autoRefresh);
                        saveAutoRefresh(!autoRefresh);
                    }}
                />
                <br />
                <Text type="secondary">启用/停用规则后,自动刷新页面</Text>
            </Col>
            <Col span={6}>
                <Text strong>代理端口</Text>
            </Col>
            <Col span={18}>
                <Text>{whistleData?.server?.port}</Text>
            </Col>
            <Col span={6}>
                <Text strong>代理Ipv4</Text>
            </Col>
            <Col span={18}>
                <Text>
                    {whistleData?.server?.ipv4?.map((v: string) => {
                        return (
                            <>
                                {v}
                                <Button
                                    type="link"
                                    size={"small"}
                                    onClick={() => {
                                        navigator?.clipboard?.writeText(v);
                                    }}
                                >
                                    <CopyOutlined rev={undefined} />
                                </Button>
                            </>
                        );
                    })}
                </Text>
            </Col>
            <Col span={6}></Col>
            <Col span={18}>
                <Button
                    type="link"
                    size={"small"}
                    onClick={() => {
                        setHideStarter(false);
                    }}
                >
                    修改Whistle地址
                </Button>
            </Col>
            <Col span={6}></Col>
            <Col span={18}>
                <Button
                    type="link"
                    size={"small"}
                    onClick={() => {
                        jumpToWhistle();
                    }}
                >
                    更多设置
                </Button>
            </Col>
        </Row>
    );
};

export default StatusPanel;
