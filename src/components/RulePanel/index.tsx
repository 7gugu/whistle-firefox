import React, { useEffect, useState } from "react";
import { Collapse, Switch } from "antd";
import {
    setDefaultRuleDisable,
    setDefaultRuleEnable,
    setRuleDisable,
    setRuleEnable,
} from "@src/api/fetchWhistleData";
import { getAutoRefresh, refreshWebPage } from "../../utils";
import { getProxyServerUrl } from "@src/utils";

export interface RulePanelProps {
    whistleData: any;
    refreshData: () => void;
}

const RulePanel: React.FC<RulePanelProps> = (props: RulePanelProps) => {
    const { whistleData, refreshData } = props;

    if (!whistleData || !whistleData.rules) return null;

    const { rules } = whistleData;
    const { defaultRulesIsDisabled, defaultRules } = rules;

    const [autoRefresh, setAutoRefresh] = useState(false);
    const [proxyServerUrl, setProxyServerUrl] = useState("");

    useEffect(() => {
        // 获取自动刷新开关状态
        getAutoRefresh().then((res: any) => {
            setAutoRefresh(res);
        });
        // 获取代理服务器地址
        getProxyServerUrl().then((res: any) => {
            setProxyServerUrl(res);
        });
    }, [whistleData]);

    // 规则开关渲染器
    const switchRender = (rule: any) => {
        return (
            <Switch
                size="small"
                checked={rule.selected}
                key={rule.index}
                onClick={() => {
                    const params = {
                        url: proxyServerUrl,
                        clientId: whistleData.clientId,
                        rule,
                    };

                    if (rule.index === -1) {
                        rule.selected
                            ? setDefaultRuleDisable(params)
                            : setDefaultRuleEnable(params);
                    } else {
                        rule.selected
                            ? setRuleDisable(params)
                            : setRuleEnable(params);
                    }

                    refreshData();
                    autoRefresh && refreshWebPage();
                }}
            />
        );
    };
    const rulesTemplate: any[] = [];

    rulesTemplate.push({
        key: "default",
        label: "Default Rule",
        children: [],
        extra: switchRender({
            data: defaultRules,
            index: -1,
            name: "default",
            selected: !defaultRulesIsDisabled,
        }),
        showArrow: false,
        selected: !defaultRulesIsDisabled,
    });
    // 将规则整合成树形结构
    const isGroup = (name: string) => name.includes("\r");
    let groupIndex = 0;
    rules?.list?.map((value: any, index: number) => {
        const { name } = value;
        if (isGroup(name)) {
            groupIndex = rulesTemplate.length;
        }
        if (groupIndex > 0 && !isGroup(name)) {
            rulesTemplate[groupIndex].children.push({
                key: String(index),
                label: name,
                children: [],
                extra: isGroup(name) ? null : switchRender(value),
                showArrow: isGroup(name),
                selected: value.selected,
            });
        } else {
            rulesTemplate.push({
                key: String(index),
                label: name,
                children: [],
                extra: isGroup(name) ? null : switchRender(value),
                showArrow: isGroup(name),
                selected: value.selected,
            });
        }
    });

    // 将整合后的规则
    rulesTemplate.forEach((value) => {
        const items = value.children;
        if (value.children.length > 0) {
            const activeItems = items.filter((v: any) => {
                return v.selected;
            });
            value.label = `${value.label} (${activeItems.length}/${items.length})`;
            value.children = (
                <Collapse
                    size="small"
                    collapsible="icon"
                    expandIconPosition="end"
                    items={items}
                    ghost
                />
            );
        } else {
            value.children = null;
        }
    });

    return (
        <Collapse
            size="small"
            collapsible="icon"
            expandIconPosition="end"
            items={rulesTemplate}
            ghost
        />
    );
};

export default RulePanel;
