import React, { useEffect, useRef, useState } from "react";
import css from "./styles.module.css";
import { Textarea } from "@src/components/ui/textarea";
import { Button } from "@src/components/ui/button";
import { Label } from "@src/components/ui/label";
import { cn } from "@src/utils";

const BlackListPanel: React.FC = () => {
    // Renders the component tree
    return (
        <div className={css.popupContainer}>
            <div className="mx-4 my-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">代理黑名单</Label>
                    <Textarea />
                    <p className={cn("text-sm text-muted-foreground")}>
                        不经过代理的域名，多个域名用换行分隔，例如：.mozilla.org,
                        .net.nz,
                        192.168.1.0/24。与localhost、127.0.0.1/8和::1的连接永不经过代理。
                    </p>
                    <Button type="submit">保存配置</Button>
                </div>
            </div>
        </div>
    );
};

export default BlackListPanel;
