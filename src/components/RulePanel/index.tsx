import React, { useEffect, useRef, useState } from "react";
import { Collapse, CollapseProps, Switch } from "antd";
import {
    setDefaultRuleDisable,
    setDefaultRuleEnable,
    setRuleDisable,
    setRuleEnable,
} from "@src/api/fetchWhistleData";
import { getStorage, refreshWebPage } from "../../utils";
import { WHISTLE_AUTO_REFRESH_KEY } from "@src/constants";

export interface RulePanelProps {
    url: string;
    whistleData: any;
    refreshData: () => void;
}

const RulePanel: React.FC<RulePanelProps> = (props: RulePanelProps) => {
    const { whistleData, url, refreshData } = props;
    if (!whistleData || !whistleData.rules) return null;
    const [autoRefresh, setAutoRefresh] = useState(false);
    const getAutoRefresh = () => {
        return getStorage(WHISTLE_AUTO_REFRESH_KEY)
            .then((res: any) => {
                return res[WHISTLE_AUTO_REFRESH_KEY];
            })
            .catch(() => {
                return null;
            });
    };

    useEffect(() => {
        getAutoRefresh().then((res: any) => {
            setAutoRefresh(res);
        });
    }, [whistleData]);

    const { rules } = whistleData;
    const { defaultRulesIsDisabled, defaultRules } = rules;
    const switchRender = (rule: any) => {
        return (
            <Switch
                size="small"
                checked={rule.selected}
                key={rule.index}
                onClick={() => {
                    const params = {
                        url,
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
