import React, { useEffect, useState } from "react";
import { Button, Col, Row, Switch } from "antd";
import { setAllowMultipleChoice } from "@src/api/fetchWhistleData";
import { cn, getProxyServerUrl, setStorage } from "../../utils";
import { WHISTLE_AUTO_REFRESH_KEY } from "@src/constants";
import { Label } from "../ui/label";
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
                <Label htmlFor="airplane-mode">多规则</Label>
            </Col>
            <Col span={18}>
                <div className="flex items-center space-x-2">
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
                    <p className={cn("text-sm text-muted-foreground")}>
                        支持多规则
                    </p>
                </div>
            </Col>
            <Col span={6}>
                <Label htmlFor="airplane-mode">自动刷新</Label>
            </Col>
            <Col span={18}>
                <div className="flex items-center space-x-2">
                    <Switch
                        size="small"
                        checked={autoRefresh}
                        onClick={() => {
                            setAutoRefresh(!autoRefresh);
                            saveAutoRefresh(!autoRefresh);
                        }}
                    />
                    <p className={cn("text-sm text-muted-foreground")}>
                        启用/停用规则后,自动刷新页面
                    </p>
                </div>
            </Col>
            <Col span={6}>
                <Label htmlFor="airplane-mode">代理服务器端口</Label>
            </Col>
            <Col span={18}>
                <div className="flex items-center space-x-2">
                    <p className={cn("text-sm text-muted-foreground")}>
                        {whistleData?.server?.port}
                    </p>
                </div>
            </Col>
            <Col span={6}>
                <Label htmlFor="airplane-mode">代理服务器Ipv4</Label>
            </Col>
            <Col span={18}>
                <div className="flex items-center space-x-2">
                    <p className={cn("text-sm text-muted-foreground")}>
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
                    </p>
                </div>
            </Col>
            <Col span={6}>修改Whistle地址</Col>
            <Col span={18}>
                <Button
                    type="link"
                    size={"small"}
                    onClick={() => {
                        setHideStarter(false);
                    }}
                >
                    修改
                </Button>
            </Col>
            <Col span={6}>更多设置</Col>
            <Col span={18}>
                <Button
                    type="link"
                    size={"small"}
                    onClick={() => {
                        jumpToWhistle();
                    }}
                >
                    设置
                </Button>
            </Col>
        </Row>
    );
};

export default StatusPanel;
