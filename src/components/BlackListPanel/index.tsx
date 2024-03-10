import React, { useEffect, useRef, useState } from "react";
import css from "./styles.module.css";
import { Textarea } from "@src/components/ui/textarea";
import { Button } from "@src/components/ui/button";
import { Label } from "@src/components/ui/label";
import { cn, getStorage, setStorage } from "@src/utils";
import { WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY } from "@src/constants";

const BlackListPanel: React.FC = () => {
    const [passThrough, setPassThrough] = useState<string>("");
    useEffect(() => {
        getStorage(WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY).then((res: any) => {
            setPassThrough(res[WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY]);
        });
    }, []);

    const savePassThrough = () => {
        setStorage(WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY, passThrough);
        getStorage(WHISTLE_LOCAL_PROXY_PASSTHROUGH_KEY).then((res: any) => {
            // console.info(res);
        });
    };
    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">代理黑名单</Label>
                    <Textarea
                        defaultValue={passThrough}
                        onInput={(event) => {
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            setPassThrough(event.target.value);
                        }}
                    />
                    <p className={cn("text-sm text-muted-foreground")}>
                        不经过代理的域名，多个域名用英文逗号分隔，例如：.mozilla.org,
                        .net.nz,
                        192.168.1.0/24。与localhost、127.0.0.1/8和::1的连接永不经过代理。
                    </p>
                    <Button type="submit" onClick={savePassThrough}>
                        保存配置
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default BlackListPanel;
