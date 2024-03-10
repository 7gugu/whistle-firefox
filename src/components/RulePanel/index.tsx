import React, { useEffect, useRef, useState } from "react";
import { Collapse, CollapseProps, Switch } from "antd";
import {
    setDefaultRuleDisable,
    setDefaultRuleEnable,
    setRuleDisable,
    setRuleEnable,
} from "@src/api/fetchWhistleData";

export interface RulePanelProps {
    url: string;
    whistleData: any;
    refreshData: () => void;
}

const RulePanel: React.FC<RulePanelProps> = (props: RulePanelProps) => {
    const { whistleData, url, refreshData } = props;
    if (!whistleData || !whistleData.rules) return null;
    const { rules } = whistleData;
    const { defaultRulesIsDisabled, defaultRules } = rules;
    console.info(rules);
    const switchRender = (rule: any) => {
        console.info(">>", rule.index, defaultRulesIsDisabled, rule);
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
                    if (rule.index === 0) {
                        rule.selected
                            ? setDefaultRuleDisable(params)
                            : setDefaultRuleEnable(params);
                    } else {
                        rule.selected
                            ? setRuleDisable(params)
                            : setRuleEnable(params);
                    }

                    refreshData();
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
            index: 0,
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
                console.info(v);
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
