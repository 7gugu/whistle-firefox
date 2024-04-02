import React, { useEffect, useState } from "react";
import { getStorage, setStorage } from "@src/utils";
import { WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY } from "@src/constants";
import TextArea from "antd/es/input/TextArea";
import { Button, Col, message, Row, Typography } from "antd";
const { Text } = Typography;

const BlackListPanel: React.FC = () => {
    const [passThrough, setPassThrough] = useState<string>("");
    const [messageApi, contextHolder] = message.useMessage();

    useEffect(() => {
        getStorage(WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY).then((res: any) => {
            setPassThrough(res[WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY]);
        });
    }, []);

    const savePassThrough = () => {
        setStorage(WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY, passThrough);
        messageApi.success("保存成功");
    };

    return (
        <>
            {contextHolder}
            <Row>
                <Col span={24}>
                    <Text strong>代理黑名单</Text>
                    <TextArea
                        rows={4}
                        value={passThrough}
                        onChange={(event) => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            setPassThrough(event.target.value);
                        }}
                    />
                    <Text type="secondary">
                        不经过代理的域名，多个域名用英文逗号分隔，例如：.mozilla.org,.net.nz,192.168.1.0/24。与localhost、127.0.0.1/8和::1的连接永不经过代理。
                    </Text>
                    <br />
                    <Button type="primary" onClick={savePassThrough}>
                        保存配置
                    </Button>
                </Col>
            </Row>
        </>
    );
};

export default BlackListPanel;
