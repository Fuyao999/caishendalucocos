import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ProgressBar, instantiate } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

// 任务数据
interface TaskData {
    id: string;
    name: string;
    description: string;
    target_type: string;
    target_count: number;
    progress: number;
    claimed: boolean;
    reward_gold: number;
    reward_merit: number;
    reward_fragment: number;
    activity_point: number;
    done: boolean;
}

// 奖励数据
interface RewardData {
    id: number;
    activity_point: number;
    reward_gold: number;
    reward_merit: number;
    reward_fragment: number;
    reward_incense: number;
    reward_candle: number;
    reward_gold_paper: number;
    reward_fruit: number;
    reward_yuanbao: number;
    claimed: boolean;
    reached: boolean;
}

// 活跃中心数据
interface ActivityData {
    tasks: TaskData[];
    daily_activity: number;
    weekly_activity: number;
    daily_rewards: RewardData[];
    weekly_rewards: RewardData[];
}

@ccclass('UIQuest')
export class UIQuest extends Component {

    // QuestPanel is the node this component is attached to
    private get questPanel(): Node { return this.node; }

    @property(Label)
    messageLabel: Label = null;

    // 节点引用
    private dailyTaskContent: Node = null;
    private dailyTaskTemplate: Node = null;
    private dailyActivityLabel: Label = null;
    private weeklyActivityLabel: Label = null;

    // 里程碑节点
    private dailyMilestonePanel: Node = null;
    private dailyProgressBg: Node = null;
    private dailyProgressFill: Node = null;
    private dailyMilestones: Node[] = [];
    private dailyMilestoneLabels: Label[] = [];
    private dailyMilestoneRewards: Label[] = [];

    private weeklyMilestonePanel: Node = null;
    private weeklyProgressBg: Node = null;
    private weeklyProgressFill: Node = null;
    private weeklyMilestones: Node[] = [];
    private weeklyMilestoneLabels: Label[] = [];
    private weeklyMilestoneRewards: Label[] = [];

    // 数据
    private _activityData: ActivityData = null;

    start() {
        console.log('UIQuest start');
    }

    show() {
        if (this.questPanel) {
            this.questPanel.active = true;

            // 绑定关闭按钮
            const closeBtn = this.questPanel.getChildByName('CloseBtn');
            if (closeBtn) {
                const btn = closeBtn.getComponent(Button);
                if (btn) {
                    btn.node.off('click');
                    btn.node.on('click', this.onCloseClicked, this);
                }
            }

            this.loadActivityData();
        }
    }

    hide() {
        if (this.questPanel) {
            this.questPanel.active = false;
        }
    }

    onCloseClicked() {
        this.hide();
    }

    // 加载活跃中心数据
    async loadActivityData() {
        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        try {
            const result = await gm.networkManager.request('/activity/info');
            if (result.code === 200) {
                this._activityData = result.data;
                this.renderAll();
            } else {
                this.showMessage('加载失败', true);
            }
        } catch (err) {
            console.error('加载活跃数据失败:', err);
            this.showMessage('加载失败', true);
        }
    }

    // 渲染全部
    renderAll() {
        if (!this._activityData) return;

        this.initNodes();
        this.renderDailyTasks();
        this.renderDailyActivity();
        this.renderWeeklyActivity();
    }

    // 初始化节点引用
    initNodes() {
        if (!this.questPanel) return;

        // 任务相关
        this.dailyTaskContent = this.questPanel.getChildByName('DailyTaskContent');
        this.dailyTaskTemplate = this.questPanel.getChildByName('DailyTaskItem');

        // 活跃度文字
        this.dailyActivityLabel = this.questPanel.getChildByName('DailyActivityLabel')?.getComponent(Label);
        this.weeklyActivityLabel = this.questPanel.getChildByName('WeeklyActivityLabel')?.getComponent(Label);

        // 日里程碑
        this.dailyMilestonePanel = this.questPanel.getChildByName('DailyMilestonePanel');
        if (this.dailyMilestonePanel) {
            this.dailyProgressBg = this.dailyMilestonePanel.getChildByName('DailyProgressBg');
            this.dailyProgressFill = this.dailyMilestonePanel.getChildByName('DailyProgressFill');
            for (let i = 1; i <= 3; i++) {
                const milestone = this.dailyMilestonePanel.getChildByName(`DailyMilestone${i}`);
                if (milestone) {
                    this.dailyMilestones.push(milestone);
                    const label = milestone.getChildByName(`DailyMilestone${i}Label`)?.getComponent(Label);
                    const reward = milestone.getChildByName(`DailyMilestone${i}Reward`)?.getComponent(Label);
                    this.dailyMilestoneLabels.push(label);
                    this.dailyMilestoneRewards.push(reward);
                    // 添加点击事件
                    milestone.on(Node.EventType.TOUCH_END, () => this.onDailyMilestoneClick(i - 1));
                }
            }
        }

        // 周里程碑
        this.weeklyMilestonePanel = this.questPanel.getChildByName('WeeklyMilestonePanel');
        if (this.weeklyMilestonePanel) {
            this.weeklyProgressBg = this.weeklyMilestonePanel.getChildByName('WeeklyProgressBg');
            this.weeklyProgressFill = this.weeklyMilestonePanel.getChildByName('WeeklyProgressFill');
            for (let i = 1; i <= 3; i++) {
                const milestone = this.weeklyMilestonePanel.getChildByName(`WeeklyMilestone${i}`);
                if (milestone) {
                    this.weeklyMilestones.push(milestone);
                    const label = milestone.getChildByName(`WeeklyMilestone${i}Label`)?.getComponent(Label);
                    const reward = milestone.getChildByName(`WeeklyMilestone${i}Reward`)?.getComponent(Label);
                    this.weeklyMilestoneLabels.push(label);
                    this.weeklyMilestoneRewards.push(reward);
                    // 添加点击事件
                    milestone.on(Node.EventType.TOUCH_END, () => this.onWeeklyMilestoneClick(i - 1));
                }
            }
        }
    }

    // 渲染每日任务
    renderDailyTasks() {
        if (!this.dailyTaskContent || !this._activityData) {

            return;
        }
        
        // 清除旧内容
        this.dailyTaskContent.removeAllChildren();

        const tasks = this._activityData.tasks || [];
        const itemHeight = 35; // 每个任务项的高度
        const startY = -180; // 起始Y位置

        tasks.forEach((task, index) => {
            const itemNode = this.createTaskItem(task, index);
            if (itemNode) {
                // 先重置位置，再设置父节点，最后设置正确位置
                itemNode.setPosition(0, 0, 0);
                itemNode.setParent(this.dailyTaskContent);
                itemNode.setPosition(0, startY - index * itemHeight, 0);
            }
        });

        // 更新 Content 高度，让 ScrollView 能滚动
        const totalHeight = tasks.length * itemHeight;
        const contentTransform = this.dailyTaskContent.getComponent(UITransform);
        if (contentTransform) {
            const currentWidth = contentTransform.contentSize.width;
            contentTransform.setContentSize(currentWidth, totalHeight);
        }
    }

    // 创建任务项
    createTaskItem(task: TaskData, index: number): Node {
        if (!this.dailyTaskTemplate) {
            return new Node();
        }
        const node = instantiate(this.dailyTaskTemplate);
        node.active = true;

        // 查找子节点
        const iconLabel = node.getChildByName('TaskIcon')?.getComponent(Label);
        const nameLabel = node.getChildByName('TaskName')?.getComponent(Label);
        const progressLabel = node.getChildByName('TaskProgress')?.getComponent(Label);
        const rewardLabel = node.getChildByName('TaskReward')?.getComponent(Label);
        const btnNode = node.getChildByName('TaskBtn');

        // 设置图标
        if (iconLabel) iconLabel.string = this.getTaskIcon(task.target_type);

        // 名称
        if (nameLabel) {
            nameLabel.string = task.name;
        }

        // 进度
        if (progressLabel) {
            progressLabel.string = `${task.progress}/${task.target_count}`;
        }

        // 奖励
        if (rewardLabel) {
            rewardLabel.string = this.formatReward(task);
        }

        // 按钮 - 尝试两种方式获取 Label
        const btn = btnNode?.getComponent(Button);
        // 方式1: 直接在 TaskBtn 上的 Label 组件
        let btnLabel = btnNode?.getComponent(Label);
        // 方式2: TaskBtn 的子节点 Label
        if (!btnLabel) {
            const labelChild = btnNode?.getChildByName('Label');
            btnLabel = labelChild?.getComponent(Label);
        }
        


        // 根据状态设置按钮
        if (task.claimed) {
            if (btnLabel) btnLabel.string = '已领';
            if (btn) btn.interactable = false;
        } else if (task.done) {
            if (btnLabel) btnLabel.string = '领取';
            if (btn) {
                btn.interactable = true;
                btn.node.off('click');
                btn.node.on('click', () => this.onTaskClaimClicked(task), this);
            }
        } else {
            if (btnLabel) btnLabel.string = '去完成';
            if (btn) {
                btn.interactable = true;
                btn.node.off('click');
                btn.node.on('click', () => this.onTaskGotoClicked(task), this);
            }
        }

        return node;
    }

    // 获取任务图标
    getTaskIcon(targetType: string): string {
        const iconMap: Record<string, string> = {
            'login_days': '🌟',
            'sign_days': '📝',
            'alms_today': '🙏',
            'great_alms_today': '🌟',
            'worship_today': '🕯️',
            'visit_today': '👥',
            'invite_today': '🤝',
            'share_today': '📤',
            'consume_today': '💰'
        };
        return iconMap[targetType] || '📋';
    }

    // 格式化奖励
    formatReward(task: TaskData): string {
        let str = '';
        if (task.reward_gold > 0) str += `+${task.reward_gold}钱`;
        if (task.reward_fragment > 0) str += `+${task.reward_fragment}碎`;
        if (task.reward_merit > 0) str += `+${task.reward_merit}功`;
        return str || '+0';
    }

    // 渲染每日活跃
        renderDailyActivity() {
        if (!this.dailyActivityLabel || !this._activityData) return;

        const activity = this._activityData.daily_activity || 0;
        this.dailyActivityLabel.string = `今日活跃: ${activity}`;

        // 渲染日里程碑
        this.renderDailyMilestones();
    }

    // 渲染日里程碑
    renderDailyMilestones() {
        if (!this._activityData || !this.dailyMilestones.length) return;

        const activity = this._activityData.daily_activity || 0;
        const rewards = this._activityData.daily_rewards || [];
        const maxActivity = 110;

        // 更新进度条
        if (this.dailyProgressFill) {
            const progress = Math.min(activity / maxActivity, 1);
            const transform = this.dailyProgressFill.getComponent(UITransform);
            if (transform) {
                const bgTransform = this.dailyProgressBg?.getComponent(UITransform);
                if (bgTransform) {
                    const bgWidth = bgTransform.contentSize.width;
                    transform.setContentSize(bgWidth * progress, transform.contentSize.height);
                }
            }
        }

        // 更新里程碑状态
        rewards.slice(0, 3).forEach((reward, index) => {
            if (index >= this.dailyMilestones.length) return;

            const milestone = this.dailyMilestones[index];
            const label = this.dailyMilestoneLabels[index];
            const rewardLabel = this.dailyMilestoneRewards[index];

            // 更新数值
            if (label) {
                label.string = `${reward.activity_point}`;
            }

            // 更新奖励文字
            if (rewardLabel) {
                let rewardStr = '';
                if (reward.reward_gold > 0) rewardStr += `${reward.reward_gold}钱`;
                if (reward.reward_fragment > 0) rewardStr += `+${reward.reward_fragment}碎`;
                if (reward.reward_fruit > 0) rewardStr += `+${reward.reward_fruit}供`;
                rewardLabel.string = rewardStr;
            }

            // 更新里程碑图标状态
            if (milestone) {
                const sprite = milestone.getComponent(Sprite);
                if (sprite) {
                    if (reward.claimed) {
                        sprite.color = new Color(128, 128, 128); // 已领取-灰色
                    } else if (reward.reached) {
                        sprite.color = new Color(255, 215, 0); // 可领取-金色
                    } else {
                        sprite.color = new Color(100, 100, 100); // 未达到-暗色
                    }
                }
            }
        });
    }

    // 渲染每周活跃
    renderWeeklyActivity() {
        if (!this.weeklyActivityLabel || !this._activityData) return;

        const activity = this._activityData.weekly_activity || 0;
        this.weeklyActivityLabel.string = `当前周活跃: ${activity}`;

        // 渲染周里程碑
        this.renderWeeklyMilestones();
    }

    // 渲染周里程碑
    renderWeeklyMilestones() {
        if (!this._activityData || !this.weeklyMilestones.length) return;

        const activity = this._activityData.weekly_activity || 0;
        const rewards = this._activityData.weekly_rewards || [];
        const maxActivity = 875;

        // 更新进度条
        if (this.weeklyProgressFill) {
            const progress = Math.min(activity / maxActivity, 1);
            const transform = this.weeklyProgressFill.getComponent(UITransform);
            if (transform) {
                const bgTransform = this.weeklyProgressBg?.getComponent(UITransform);
                if (bgTransform) {
                    const bgWidth = bgTransform.contentSize.width;
                    transform.setContentSize(bgWidth * progress, transform.contentSize.height);
                }
            }
        }

        // 更新里程碑状态
        rewards.slice(0, 3).forEach((reward, index) => {
            if (index >= this.weeklyMilestones.length) return;

            const milestone = this.weeklyMilestones[index];
            const label = this.weeklyMilestoneLabels[index];
            const rewardLabel = this.weeklyMilestoneRewards[index];

            // 更新数值
            if (label) {
                label.string = `${reward.activity_point}`;
            }

            // 更新奖励文字
            if (rewardLabel) {
                let rewardStr = '';
                if (reward.reward_gold > 0) rewardStr += `${reward.reward_gold}钱`;
                if (reward.reward_fragment > 0) rewardStr += `+${reward.reward_fragment}碎`;
                if (reward.reward_fruit > 0) rewardStr += `+${reward.reward_fruit}供`;
                rewardLabel.string = rewardStr;
            }

            // 更新里程碑图标状态
            if (milestone) {
                const sprite = milestone.getComponent(Sprite);
                if (sprite) {
                    if (reward.claimed) {
                        sprite.color = new Color(128, 128, 128); // 已领取-灰色
                    } else if (reward.reached) {
                        sprite.color = new Color(255, 215, 0); // 可领取-金色
                    } else {
                        sprite.color = new Color(100, 100, 100); // 未达到-暗色
                    }
                }
            }
        });
    }

    // 任务领取点击
    async onTaskClaimClicked(task: TaskData) {
        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        try {
            const result = await gm.networkManager.request('/quests/claim', {
                method: 'POST',
                body: JSON.stringify({ quest_id: task.id })
            });

            if (result.code === 200) {
                this.showMessage('领取成功');
                this.loadActivityData();
                // 刷新玩家数据（金币、功德等）
                if (gm.networkManager.playerData) {
                    gm.networkManager.syncData(gm.networkManager.playerData).catch(() => {});
                }
            } else {
                this.showMessage(result.message || '领取失败', true);
            }
        } catch (err) {
            console.error('领取任务奖励失败:', err);
            this.showMessage('领取失败', true);
        }
    }

    // 任务跳转点击
    onTaskGotoClicked(task: TaskData) {
        const gm = GameManager.instance;
        if (!gm) return;

        // 根据任务类型显示提示
        switch (task.target_type) {
            case 'login_days':
                this.showMessage('请重新登录');
                break;
            case 'sign_days':
                this.showMessage('请去签到');
                break;
            case 'alms_today':
            case 'great_alms_today':
                this.showMessage('请去化缘');
                break;
            case 'worship_today':
                this.showMessage('请去供奉');
                break;
            case 'visit_today':
                this.showMessage('请去拜访好友');
                break;
            case 'invite_today':
                this.showMessage('请去邀请好友');
                break;
            case 'share_today':
                this.showMessage('请去分享');
                break;
            case 'consume_today':
                this.showMessage('请去消费');
                break;
            default:
                this.showMessage('功能开发中');
        }

        // 关闭任务面板
        this.hide();
    }

    // 领取奖励点击
    async onRewardClicked(reward: RewardData, type: 'daily' | 'weekly') {
        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        try {
            const api = type === 'daily' ? '/activity/claim-daily' : '/activity/claim-weekly';
            const result = await gm.networkManager.request(api, {
                method: 'POST',
                body: JSON.stringify({ reward_id: reward.id })
            });

            if (result.code === 200) {
                this.showMessage('领取成功');
                this.loadActivityData();
            } else {
                this.showMessage(result.message || '领取失败', true);
            }
        } catch (err) {
            console.error('领取奖励失败:', err);
            this.showMessage('领取失败', true);
        }
    }

    // 日里程碑点击
    async onDailyMilestoneClick(index: number) {
        if (!this._activityData) return;
        const rewards = this._activityData.daily_rewards || [];
        if (index >= rewards.length) return;

        const reward = rewards[index];
        if (reward.claimed) {
            this.showMessage('已领取');
        } else if (reward.reached) {
            await this.onRewardClicked(reward, 'daily');
        } else {
            // 显示奖励内容
            let rewardStr = '';
            if (reward.reward_gold > 0) rewardStr += `${reward.reward_gold}钱`;
            if (reward.reward_fragment > 0) rewardStr += `+${reward.reward_fragment}碎`;
            if (reward.reward_fruit > 0) rewardStr += `+${reward.reward_fruit}供`;
            this.showMessage(`需要${reward.activity_point}活跃，当前${this._activityData.daily_activity}，奖励: ${rewardStr}`);
        }
    }

    // 周里程碑点击
    async onWeeklyMilestoneClick(index: number) {
        if (!this._activityData) return;
        const rewards = this._activityData.weekly_rewards || [];
        if (index >= rewards.length) return;

        const reward = rewards[index];
        if (reward.claimed) {
            this.showMessage('已领取');
        } else if (reward.reached) {
            await this.onRewardClicked(reward, 'weekly');
        } else {
            // 显示奖励内容
            let rewardStr = '';
            if (reward.reward_gold > 0) rewardStr += `${reward.reward_gold}钱`;
            if (reward.reward_fragment > 0) rewardStr += `+${reward.reward_fragment}碎`;
            if (reward.reward_fruit > 0) rewardStr += `+${reward.reward_fruit}供`;
            this.showMessage(`需要${reward.activity_point}活跃，当前${this._activityData.weekly_activity}，奖励: ${rewardStr}`);
        }
    }

    // 分享点击
    async onShareClicked() {
        this.showMessage('分享功能开发中');
    }

    // 显示消息
    showMessage(msg: string, isError: boolean = false) {
        // 优先使用编辑器绑定的 messageLabel
        if (this.messageLabel) {
            this.messageLabel.string = msg;
            this.messageLabel.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);

            setTimeout(() => {
                if (this.messageLabel) {
                    this.messageLabel.string = '';
                }
            }, 3000);
            return;
        }

        // 否则尝试在节点树中查找
        const msgNode = this.questPanel?.getChildByName('MessageLabel');
        if (msgNode) {
            const label = msgNode.getComponent(Label);
            if (label) {
                label.string = msg;
                label.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);

                setTimeout(() => {
                    if (label) {
                        label.string = '';
                    }
                }, 3000);
            }
        }

        // 都没有就打印日志
        console.log(msg);
    }
}
