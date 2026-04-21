import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, Vec3, SpriteFrame, ProgressBar } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

interface TitleData {
    id: string;
    name: string;
    desc: string;
    bonus: string;
    icon: string;
    is_active: number;
    equipped: boolean;
}

@ccclass('UIAchievement')
export class UIAchievement extends Component {
    
    @property(Node)
    achievementPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Node)
    content: Node = null;
    
    @property(Label)
    messageLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Button)
    titleBtn: Button = null;  // 称号按钮
    
    @property(Button)
    backBtn: Button = null;  // 返回按钮
    
    private _titleList: TitleData[] = [];
    private _messageTimer: number = 0;
    private _showingDetails: boolean = false;
    private _currentTitleId: string = '';
    private _currentQuests: any[] = [];
    private _progressBarSized: boolean = false;

    start() {
        console.log('UIAchievement start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', () => this.hide(), this);
        }
        
        // 称号按钮 - 显示称号详情
        if (this.titleBtn) {
            this.titleBtn.node.on('click', () => this.showTitleDetails(), this);
        }
        
        // 返回按钮 - 返回图标列表
        if (this.backBtn) {
            this.backBtn.node.on('click', () => this.showIconList(), this);
        }
        
        // 初始化：显示图标列表，隐藏详情和返回按钮
        this.showIconList();
        
        // 隐藏BackBtn
        if (this.backBtn) {
            this.backBtn.node.active = false;
        }
    }
    
    show() {
        console.log('UIAchievement show, this.node:', this.node.name);
        // 直接使用 this.node，因为 UIAchievement 组件就挂载在 AchievementPanel 上
        if (this.node) {
            this.node.active = true;
            console.log('Setting node active to true, calling loadTitles');
            
            // 初始状态：隐藏 AchievementItem1-12 和 BackBtn
            for (let i = 1; i <= 12; i++) {
                const itemNode = this.node.getChildByName('AchievementItem' + i);
                if (itemNode) itemNode.active = false;
            }
            if (this.backBtn) {
                this.backBtn.node.active = false;
            }
            
            // 重置状态
            this._showingDetails = false;
            this._currentTitleId = '';
            
            this.loadTitles();
        } else {
            console.log('ERROR: this.node is null!');
        }
    }
    
    hide() {
        if (this.node) {
            this.node.active = false;
        }
    }
    
    async loadTitles() {
        console.log('=== loadTitles called ===');
        const gm = GameManager.instance;
        console.log('gm:', gm);
        console.log('gm.networkManager:', gm?.networkManager);
        if (!gm || !gm.networkManager) {
            console.log('ERROR: gm or networkManager is null');
            return;
        }
        
        try {
            console.log('Requesting /quests/titles...');
            const result = await gm.networkManager.request('/quests/titles');
            console.log('loadTitles result:', result);
            if (result.code === 200) {
                console.log('Setting titleList, titles:', result.data?.titles?.length);
                this._titleList = result.data?.titles || [];
                console.log('titleList set, length:', this._titleList.length);
                console.log('Calling renderTitles...');
                this.renderTitles();
            } else {
                console.log('API returned error:', result.code);
                this.showMessage('加载失败', true);
            }
        } catch (err) {
            console.error('加载称号失败:', err);
            this.showMessage('加载失败', true);
        }
    }
    
    renderTitles() {
        console.log('=== renderTitles called ===');
        console.log('titleList length:', this._titleList.length);
        
        // 如果还没显示详情模式，只设置图标内容，不显示详情
        if (!this._showingDetails) {
            // 只设置图标列表的内容
            for (let i = 0; i < 12; i++) {
                const title = this._titleList[i];
                const iconNode = this.node.getChildByName('AchievementIcon' + (i + 1));
                if (iconNode) {
                    // 设置图标内容
                    const iconLabel = iconNode.getChildByName('Label');
                    if (iconLabel) {
                        const label = iconLabel.getComponent(Label);
                        if (label) {
                            label.string = title?.icon || '🏆';
                        }
                    }
                    // 设置名称（在图标下方）
                    const nameLabel = iconNode.getChildByName('NameLabel');
                    if (nameLabel) {
                        nameLabel.setPosition(0, -50, 0);
                        const label = nameLabel.getComponent(Label);
                        if (label) {
                            label.string = title?.name || '';
                            label.fontSize = 16;
                            label.color = new Color(255, 255, 255);
                        }
                    }
                    
                    // 设置图标点击事件
                    iconNode.off('click');
                    iconNode.on('click', () => {
                        if (title) {
                            this.onTitleIconClicked(title.id);
                        }
                    }, this);
                }
            }
            
            // 隐藏所有称号详情
            for (let i = 1; i <= 12; i++) {
                const itemNode = this.node.getChildByName('AchievementItem' + i);
                if (itemNode) itemNode.active = false;
            }
            return;
        }
        
        // 显示详情模式
        // 如果是显示单个任务详情
        if (this._currentTitleId) {
            // 显示返回按钮
            if (this.backBtn) this.backBtn.node.active = true;
        }
        
        // 显示称号详情列表
        if (this._showingDetails && this._currentTitleId) {
            const selectedIndex = this._titleList.findIndex(t => t.id === this._currentTitleId);
            
            // 隐藏所有称号详情
            for (let i = 0; i < 12; i++) {
                const itemNode = this.node.getChildByName('AchievementItem' + (i + 1));
                if (itemNode) itemNode.active = false;
            }
            
            // 显示选中的
            if (selectedIndex >= 0) {
                const title = this._titleList[selectedIndex];
                const itemNode = this.node.getChildByName('AchievementItem' + (selectedIndex + 1));
                if (itemNode && title) {
                    itemNode.active = true;
                    this.setTitleItemContent(itemNode, title, selectedIndex);
                }
            }
            return;
        }
        
        // 否则显示称号详情列表（点"称号"按钮后）
        for (let i = 0; i < 12; i++) {
            const title = this._titleList[i];
            const itemNode = this.node.getChildByName('AchievementItem' + (i + 1));
            
            if (!itemNode) {
                console.log('AchievementItem' + (i + 1) + ' not found');
                continue;
            }
            
            if (title) {
                itemNode.active = true;
                this.setTitleItemContent(itemNode, title, i);
            } else {
                itemNode.active = false;
            }
        }
        
        console.log('renderTitles done');
    }
    
    setTitleItemContent(itemNode: Node, title: TitleData, index: number) {
        // Y 位置
        const baseY = 245 - index * 50;
        
        // IconLabel: X = -280
        const iconLabel = itemNode.getChildByName('IconLabel');
        if (iconLabel) {
            iconLabel.setPosition(-280, baseY, 0);
            const label = iconLabel.getComponent(Label);
            if (label) {
                label.string = title.icon || '🏆';
            }
        }
        
        // NameLabel: X = -220
        const nameLabel = itemNode.getChildByName('NameLabel');
        if (nameLabel) {
            nameLabel.setPosition(-220, baseY, 0);
            const label = nameLabel.getComponent(Label);
            if (label) {
                label.string = (index + 1) + '. ' + title.name;
            }
        }
        
        // DescLabel: X = -90
        const descLabel = itemNode.getChildByName('DescLabel');
        if (descLabel) {
            descLabel.setPosition(-90, baseY, 0);
            const label = descLabel.getComponent(Label);
            if (label) {
                label.string = title.desc || '';
            }
        }
        
        // BonusLabel: X = 80
        const bonusLabel = itemNode.getChildByName('BonusLabel');
        if (bonusLabel) {
            bonusLabel.setPosition(80, baseY, 0);
            const label = bonusLabel.getComponent(Label);
            if (label) {
                // 格式化加成显示
                const bonusMap: Record<string, string> = {
                    'alms': '香火钱',
                    'gold': '香火钱',
                    'merit': '功德',
                    'exp': '经验',
                    'fragment': '碎片',
                    'all': '全属性'
                };
                const bonusParts = (title.bonus || '').split(':');
                const bonusType = bonusMap[bonusParts[0]] || bonusParts[0];
                const bonusValue = bonusParts[1] || '0';
                label.string = bonusType + '+' + bonusValue + '%';
            }
        }
        
        // EquipBtn: X = 230
        const equipBtn = itemNode.getChildByName('EquipBtn');
        if (equipBtn) {
            equipBtn.setPosition(230, baseY, 0);
            const btnLabel = equipBtn.getComponentInChildren(Label);
            if (btnLabel) {
                btnLabel.string = title.equipped ? '已装备' : '装备';
            }
            // 移除旧监听，添加新监听
            equipBtn.off('click');
            equipBtn.on('click', () => {
                console.log('Equip clicked:', title.name);
                this.onEquipClicked(title);
            });
        }
    }
    
    // 切换到称号详情页（点"称号"按钮时调用）
    showTitleDetails() {
        console.log('showTitleDetails');
        this._showingDetails = true;
        this._currentTitleId = '';
        
        // 隐藏图标列表
        for (let i = 1; i <= 12; i++) {
            const iconNode = this.node.getChildByName('AchievementIcon' + i);
            if (iconNode) iconNode.active = false;
        }
        
        // 隐藏TitleBtn
        if (this.titleBtn) {
            this.titleBtn.node.active = false;
        }
        
        // 显示返回按钮
        if (this.backBtn) {
            this.backBtn.node.active = true;
        }
        
        // 显示称号详情列表
        this.renderTitles();
    }
    
    // 返回到初始状态（点返回按钮时调用）
    showIconList() {
        console.log('showIconList');
        this._showingDetails = false;
        this._currentTitleId = '';
        this._progressBarSized = false;
        
        // 隐藏所有AchievementItem
        for (let i = 1; i <= 12; i++) {
            const itemNode = this.node.getChildByName('AchievementItem' + i);
            if (itemNode) {
                itemNode.active = false;
                // 恢复子节点显示
                const iconLabel = itemNode.getChildByName('IconLabel');
                if (iconLabel) iconLabel.active = true;
                const nameLabel = itemNode.getChildByName('NameLabel');
                if (nameLabel) nameLabel.active = true;
                const descLabel = itemNode.getChildByName('DescLabel');
                if (descLabel) descLabel.active = true;
                const bonusLabel = itemNode.getChildByName('BonusLabel');
                if (bonusLabel) bonusLabel.active = true;
                const equipBtn = itemNode.getChildByName('EquipBtn');
                if (equipBtn) equipBtn.active = true;
            }
        }
        
        // 隐藏所有TaskItem
        for (let i = 1; i <= 5; i++) {
            const taskNode = this.node.getChildByName('TaskItem' + i);
            if (taskNode) taskNode.active = false;
        }
        
        // 显示图标列表（初始状态）
        for (let i = 1; i <= 12; i++) {
            const iconNode = this.node.getChildByName('AchievementIcon' + i);
            if (iconNode) iconNode.active = true;
        }
        
        // 显示TitleBtn
        if (this.titleBtn) {
            this.titleBtn.node.active = true;
        }
        
        // 隐藏返回按钮
        if (this.backBtn) {
            this.backBtn.node.active = false;
        }
    }
    
    // 点击称号图标，显示该称号的任务步骤
    async onTitleIconClicked(titleId: string) {
        console.log('onTitleIconClicked:', titleId);
        this._currentTitleId = titleId;
        
        // 隐藏TitleBtn
        if (this.titleBtn) {
            this.titleBtn.node.active = false;
        }
        
        // 隐藏图标列表
        for (let i = 1; i <= 12; i++) {
            const iconNode = this.node.getChildByName('AchievementIcon' + i);
            if (iconNode) iconNode.active = false;
        }
        
        // 显示返回按钮
        if (this.backBtn) {
            this.backBtn.node.active = true;
        }
        
        // 加载该称号的任务步骤
        try {
            const gm = GameManager.instance;
            console.log('请求任务步骤, titleId:', titleId);
            const result = await gm.networkManager.request('/quests/by-title/' + titleId);
            console.log('任务步骤结果:', result);
            
            if (result.code === 200 && result.data) {
                this.showQuestSteps(titleId, result.data.quests);
            } else {
                console.log('API返回错误:', result);
                this.showMessage('加载任务失败', true);
            }
        } catch (err) {
            console.error('加载任务失败:', err);
            this.showMessage('加载任务失败', true);
        }
    }
    
    // 显示任务步骤（用TaskItem1-5显示5个任务）
    showQuestSteps(titleId: string, quests: any[]) {
        console.log('showQuestSteps:', quests);
        this._currentQuests = quests;
        
        // 找到对应的称号
        const title = this._titleList.find(t => t.id === titleId);
        if (!title) return;
        
        // 隐藏所有图标
        for (let i = 1; i <= 12; i++) {
            const iconNode = this.node.getChildByName('AchievementIcon' + i);
            if (iconNode) iconNode.active = false;
        }
        
        // 字段中文映射
        const targetNames: Record<string, string> = {
            'login_days': '累计登录天数',
            'total_spent': '累计消费',
            'invite_count': '累计邀请人数',
            'worship_count': '累计供奉次数',
            'total_recharge': '累计充值',
            'merit': '累计功德',
            'level': '庙宇等级',
            'great_count': '大吉次数',
            'gold': '拥有香火钱',
            'visit_count': '拜访次数',
            'god_count': '解锁财神数',
            'title_count': '解锁称号数'
        };
        
        // 显示5个任务
        quests.forEach((quest: any, index: number) => {
            const taskNodeName = 'TaskItem' + (index + 1);
            const taskNode = this.node.getChildByName(taskNodeName);
            if (!taskNode) {
                console.log('TaskNode not found:', taskNodeName);
                return;
            }
            
            taskNode.active = true;
            // 位置由编辑器设置，代码不写死
            
            // 扩大任务条的点击区域（包含进度条）
            const taskTransform = taskNode.getComponent(UITransform);
            if (taskTransform) {
                taskTransform.setContentSize(500, 80);  // 包含进度条的高度
            }
            
            // 替换字段名为中文，并去掉等号
            let desc = quest.description;
            for (const [eng, chn] of Object.entries(targetNames)) {
                desc = desc.replace(eng, chn);
            }
            desc = desc.replace('=', '').replace(/完成/g, '');
            
            // IconLabel: 显示状态图标（更大更粗，绿色）
            const iconLabel = taskNode.getChildByName('IconLabel');
            console.log('IconLabel node:', iconLabel, 'children:', taskNode.children.map(c => c.name));
            if (iconLabel) {
                iconLabel.active = true;
                // 位置由编辑器设置
                const label = iconLabel.getComponent(Label);
                if (label) {
                    const statusIcon = quest.claimed ? '✓' : (quest.completed ? '●' : '○');
                    label.string = statusIcon;
                    label.fontSize = 40;  // 更大
                    label.color = quest.claimed ? new Color(100, 100, 100) : (quest.completed ? new Color(0, 255, 0) : new Color(150, 150, 150));
                    console.log('IconLabel set:', statusIcon);
                }
            }
            
            // NameLabel: 显示任务名称
            const nameLabel = taskNode.getChildByName('NameLabel');
            if (nameLabel) {
                nameLabel.active = true;
                const label = nameLabel.getComponent(Label);
                if (label) {
                    label.string = quest.step + '. ' + desc;
                    label.fontSize = 22;
                    label.color = new Color(255, 255, 255);
                }
            }
            
            // ProgressLabel: 隐藏（用进度条代替）
            const progressLabel = taskNode.getChildByName('ProgressLabel');
            if (progressLabel) {
                progressLabel.active = false;
            }
            
            // ProgressBar: 进度条由编辑器控制
            
            // BonusLabel: 显示奖励（编辑器设置位置）
            const bonusLabel = taskNode.getChildByName('BonusLabel');
            if (bonusLabel) {
                bonusLabel.active = true;
                // 位置由编辑器设置
                const label = bonusLabel.getComponent(Label);
                if (label) {
                    label.string = '+' + (quest.target * 2) + '钱';
                    label.color = new Color(255, 215, 0);
                    label.fontSize = 20;
                    label.horizontalAlign = Label.HorizontalAlign.LEFT;  // 左对齐
                }
            }
            
            // 点击事件
            taskNode.off('click');
            taskNode.on('click', () => {
                this.onTaskClicked(quest);
            }, this);
        });
        
        // 隐藏剩余的TaskItem
        for (let i = quests.length; i < 5; i++) {
            const taskNode = this.node.getChildByName('TaskItem' + (i + 1));
            if (taskNode) taskNode.active = false;
        }
    }
    
    // 点击任务领取奖励
    async onTaskClicked(quest: any) {
        if (quest.claimed) {
            this.showMessage('已领取');
            return;
        }
        if (!quest.completed) {
            this.showMessage('任务未完成');
            return;
        }
        
        console.log('领取任务:', quest.id);
        
        try {
            const gm = GameManager.instance;
            const result = await gm.networkManager.request('/quests/claim', {
                method: 'POST',
                body: JSON.stringify({ quest_id: quest.id })
            });
            
            console.log('领取结果:', result);
            if (result.code === 200) {
                this.showMessage('领取成功！+' + (quest.target * 2) + '钱');
                // 刷新任务列表
                if (this._currentTitleId) {
                    const result2 = await gm.networkManager.request('/quests/by-title/' + this._currentTitleId);
                    if (result2.code === 200) {
                        this.showQuestSteps(this._currentTitleId, result2.data.quests);
                    }
                }
            } else {
                this.showMessage(result.message || '领取失败', true);
            }
        } catch (err) {
            console.error('领取失败:', err);
            this.showMessage('领取失败', true);
        }
    }
    
    // createTitleItem 已废弃，使用编辑器预创建的节点
    
    async onEquipClicked(title: TitleData) {
        console.log('onEquipClicked:', title.id);
        
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/quests/titles/equip', {
                method: 'POST',
                body: JSON.stringify({ title_id: title.id })
            });
            
            console.log('equip result:', result);
            if (result.code === 200) {
                this._titleList.forEach(t => t.equipped = false);
                title.equipped = true;
                this.showMessage('装备成功！');
                this.renderTitles();
            } else {
                this.showMessage(result.message || '装备失败', true);
            }
        } catch (err) {
            console.error('装备失败:', err);
            this.showMessage('装备失败', true);
        }
    }
    
    showMessage(msg: string, isError: boolean = false) {
        if (this.messageLabel) {
            this.messageLabel.string = msg;
            this.messageLabel.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);
            
            if (this._messageTimer) {
                clearTimeout(this._messageTimer);
            }
            this._messageTimer = setTimeout(() => {
                if (this.messageLabel) {
                    this.messageLabel.string = '';
                }
            }, 3000) as any;
        }
    }
}
