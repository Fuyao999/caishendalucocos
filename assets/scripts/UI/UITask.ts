import { _decorator, Component, Label, Button, Node, Color, Sprite } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

interface QuestData {
    id: string;
    title_id: string | null;
    type: string;
    name: string;
    description: string;
    target_type: string;
    target_count: number;
    progress: number;
    claimed: boolean;
    done: boolean;
    reward: {
        gold: number;
        merit: number;
        fragment: number;
        incense: number;
        candle: number;
    };
}

interface TitleData {
    id: string;
    name: string;
    desc: string;
    bonus: string;
    icon: string;
    unlocked: boolean;
    equipped: boolean;
}

@ccclass('UITask')
export class UITask extends Component {
    
    @property(Node)
    taskPanel: Node = null;
    
    @property(Node)
    achievementPanel: Node = null;
    
    @property(Node)
    taskContent: Node = null;
    
    @property(Node)
    achievementContent: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Label)
    currentTitleLabel: Label = null;
    
    @property(Button)
    tabTaskBtn: Button = null;
    
    @property(Button)
    tabAchievementBtn: Button = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Label)
    messageLabel: Label = null;
    
    private _quests: QuestData[] = [];
    private _titles: TitleData[] = [];
    private _currentTab: 'task' | 'achievement' = 'task';
    private _messageTimer: number = 0;

    start() {
        if (this.closeBtn) {
            this.closeBtn.node.on('click', () => this.hide(), this);
        }
        if (this.tabTaskBtn) {
            this.tabTaskBtn.node.on('click', () => this.switchTab('task'), this);
        }
        if (this.tabAchievementBtn) {
            this.tabAchievementBtn.node.on('click', () => this.switchTab('achievement'), this);
        }
        this.hide();
    }
    
    show() {
        if (this.taskPanel) {
            this.taskPanel.active = true;
            this.switchTab('task');
            this.loadData();
        }
    }
    
    hide() {
        if (this.taskPanel) {
            this.taskPanel.active = false;
        }
    }
    
    switchTab(tab: 'task' | 'achievement') {
        this._currentTab = tab;
        
        if (this.taskContent) {
            this.taskContent.active = tab === 'task';
        }
        if (this.achievementContent) {
            this.achievementContent.active = tab === 'achievement';
        }
        
        // 更新标签样式
        if (this.tabTaskBtn) {
            const sprite = this.tabTaskBtn.getComponent(Sprite);
            if (sprite) {
                sprite.color = tab === 'task' ? new Color(255, 200, 0) : new Color(150, 150, 150);
            }
        }
        if (this.tabAchievementBtn) {
            const sprite = this.tabAchievementBtn.getComponent(Sprite);
            if (sprite) {
                sprite.color = tab === 'achievement' ? new Color(255, 200, 0) : new Color(150, 150, 150);
            }
        }
    }
    
    async loadData() {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            // 加载任务
            const questResult = await gm.networkManager.request('/quests/list');
            if (questResult.code === 200) {
                this._quests = questResult.data?.quests || [];
                this.renderTasks();
            }
            
            // 加载称号
            const titleResult = await gm.networkManager.request('/quests/titles');
            if (titleResult.code === 200) {
                this._titles = titleResult.data?.titles || [];
                if (this.currentTitleLabel) {
                    const equipped = this._titles.find(t => t.equipped);
                    this.currentTitleLabel.string = equipped ? equipped.name : '无';
                }
                this.renderAchievements();
            }
        } catch (err) {
            console.error('加载任务数据失败:', err);
            this.showMessage('加载失败', true);
        }
    }
    
    // 渲染每日任务
    renderTasks() {
        if (!this.taskContent) return;
        
        // 清空旧内容
        this.taskContent.removeAllChildren();
        
        // 只显示每日任务
        const dailyQuests = this._quests.filter(q => q.type === 'daily');
        
        if (dailyQuests.length === 0) {
            const emptyLabel = new Node();
            emptyLabel.addComponent(Label).string = '暂无每日任务';
            emptyLabel.setParent(this.taskContent);
            return;
        }
        
        dailyQuests.forEach((quest, index) => {
            this.createTaskItem(quest, index);
        });
    }
    
    // 创建任务项
    createTaskItem(quest: QuestData, index: number) {
        const item = new Node();
        item.setParent(this.taskContent);
        item.setPosition(0, -index * 80, 0);
        
        // 背景
        const bg = item.addComponent(Sprite);
        bg.color = quest.done && !quest.claimed ? new Color(80, 60, 40) : new Color(40, 40, 50);
        bg.type = Sprite.Type.SLICE;
        bg.sizeMode = Sprite.SizeMode.CUSTOM;
        
        const uiTransform = item.addComponent('UITransform');
        if (uiTransform) {
            (uiTransform as any).setContentSize(360, 70);
        }
        
        // 任务名称
        const nameLabel = new Node();
        nameLabel.setParent(item);
        nameLabel.setPosition(-100, 0, 0);
        const nl = nameLabel.addComponent(Label);
        nl.string = quest.name;
        nl.color = new Color(255, 255, 255);
        nl.fontSize = 16;
        
        // 进度
        const progressLabel = new Node();
        progressLabel.setParent(item);
        progressLabel.setPosition(60, 15, 0);
        const pl = progressLabel.addComponent(Label);
        pl.string = `${quest.progress}/${quest.target_count}`;
        pl.color = quest.done ? new Color(100, 255, 100) : new Color(200, 200, 200);
        pl.fontSize = 14;
        
        // 奖励
        const rewardLabel = new Node();
        rewardLabel.setParent(item);
        rewardLabel.setPosition(-100, -18, 0);
        const rl = rewardLabel.addComponent(Label);
        let rewardStr = '';
        if (quest.reward.gold > 0) rewardStr += `${quest.reward.gold}金 `;
        if (quest.reward.fragment > 0) rewardStr += `${quest.reward.fragment}碎 `;
        if (quest.reward.merit > 0) rewardStr += `${quest.reward.merit}功 `;
        if (quest.reward.incense > 0) rewardStr += `${quest.reward.incense}香 `;
        if (quest.reward.candle > 0) rewardStr += `${quest.reward.candle}烛 `;
        rl.string = rewardStr || '无';
        rl.color = new Color(255, 215, 0);
        rl.fontSize = 12;
        
        // 领取按钮
        const claimBtn = new Node();
        claimBtn.setParent(item);
        claimBtn.setPosition(120, 0, 0);
        const btnSprite = claimBtn.addComponent(Sprite);
        btnSprite.color = quest.done && !quest.claimed ? new Color(46, 204, 113) : new Color(100, 100, 100);
        btnSprite.type = Sprite.Type.SLICE;
        
        const btnTransform = claimBtn.addComponent('UITransform');
        if (btnTransform) {
            (btnTransform as any).setContentSize(60, 35);
        }
        
        const btnLabel = new Node();
        btnLabel.setParent(claimBtn);
        const bl = btnLabel.addComponent(Label);
        bl.string = quest.claimed ? '已领' : (quest.done ? '领取' : '进行中');
        bl.color = new Color(255, 255, 255);
        bl.fontSize = 14;
        
        // 点击事件
        if (quest.done && !quest.claimed) {
            claimBtn.on(Node.EventType.TOUCH_END, () => this.claimReward(quest), this);
        }
    }
    
    // 渲染成就/称号
    renderAchievements() {
        if (!this.achievementContent) return;
        
        this.achievementContent.removeAllChildren();
        
        if (this._titles.length === 0) {
            const emptyLabel = new Node();
            emptyLabel.addComponent(Label).string = '暂无称号';
            emptyLabel.setParent(this.achievementContent);
            return;
        }
        
        // 按排序显示称号
        const sortedTitles = [...this._titles].sort((a, b) => a.id.localeCompare(b.id));
        
        sortedTitles.forEach((title, index) => {
            this.createTitleItem(title, index);
        });
    }
    
    // 创建称号项
    createTitleItem(title: TitleData, index: number) {
        const item = new Node();
        item.setParent(this.achievementContent);
        item.setPosition(0, -index * 90, 0);
        
        // 背景
        const bg = item.addComponent(Sprite);
        bg.color = title.unlocked ? new Color(60, 50, 40) : new Color(30, 30, 35);
        bg.type = Sprite.Type.SLICE;
        
        const uiTransform = item.addComponent('UITransform');
        if (uiTransform) {
            (uiTransform as any).setContentSize(360, 80);
        }
        
        // 图标
        const iconLabel = new Node();
        iconLabel.setParent(item);
        iconLabel.setPosition(-150, 10, 0);
        const il = iconLabel.addComponent(Label);
        il.string = title.icon || '🏆';
        il.fontSize = 28;
        
        // 名称
        const nameLabel = new Node();
        nameLabel.setParent(item);
        nameLabel.setPosition(-80, 15, 0);
        const nl = nameLabel.addComponent(Label);
        nl.string = title.unlocked ? title.name : '???';
        nl.color = title.unlocked ? new Color(255, 200, 0) : new Color(100, 100, 100);
        nl.fontSize = 16;
        
        // 描述
        const descLabel = new Node();
        descLabel.setParent(item);
        descLabel.setPosition(-80, -10, 0);
        const dl = descLabel.addComponent(Label);
        dl.string = title.unlocked ? title.desc : '未解锁';
        dl.color = title.unlocked ? new Color(180, 180, 180) : new Color(80, 80, 80);
        dl.fontSize = 12;
        
        // 加成
        const bonusLabel = new Node();
        bonusLabel.setParent(item);
        bonusLabel.setPosition(100, 0, 0);
        const bl = bonusLabel.addComponent(Label);
        bl.string = title.bonus || '';
        bl.color = new Color(46, 204, 113);
        bl.fontSize = 12;
        bl.horizontalAlign = Label.HorizontalAlign.RIGHT;
        
        // 装备按钮
        if (title.unlocked) {
            const equipBtn = new Node();
            equipBtn.setParent(item);
            equipBtn.setPosition(150, 0, 0);
            const btnSprite = equipBtn.addComponent(Sprite);
            btnSprite.color = title.equipped ? new Color(230, 180, 0) : new Color(46, 204, 113);
            btnSprite.type = Sprite.Type.SLICE;
            
            const btnTransform = equipBtn.addComponent('UITransform');
            if (btnTransform) {
                (btnTransform as any).setContentSize(50, 30);
            }
            
            const btnLabel = new Node();
            btnLabel.setParent(equipBtn);
            const bll = btnLabel.addComponent(Label);
            bll.string = title.equipped ? '装备中' : '装备';
            bll.color = new Color(255, 255, 255);
            bll.fontSize = 12;
            
            equipBtn.on(Node.EventType.TOUCH_END, () => this.equipTitle(title), this);
        }
    }
    
    async claimReward(quest: QuestData) {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/quests/claim', {
                method: 'POST',
                body: JSON.stringify({ quest_id: quest.id })
            });
            
            if (result.code === 200) {
                this.showMessage('领取成功！');
                
                // 更新本地数据
                quest.claimed = true;
                
                // 更新玩家数据
                if (result.data?.player) {
                    Object.assign(gm.networkManager.playerData, result.data.player);
                    gm.uiGame?.updateMoney?.();
                }
                
                // 刷新显示
                this.renderTasks();
            } else {
                this.showMessage(result.message || '领取失败', true);
            }
        } catch (err) {
            console.error('领取奖励失败:', err);
            this.showMessage('领取失败', true);
        }
    }
    
    async equipTitle(title: TitleData) {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/quests/titles/equip', {
                method: 'POST',
                body: JSON.stringify({ title_id: title.id })
            });
            
            if (result.code === 200) {
                // 更新本地数据
                this._titles.forEach(t => t.equipped = false);
                title.equipped = true;
                
                if (this.currentTitleLabel) {
                    this.currentTitleLabel.string = title.name;
                }
                
                this.renderAchievements();
                this.showMessage('装备成功！');
            } else {
                this.showMessage(result.message || '装备失败', true);
            }
        } catch (err) {
            console.error('装备称号失败:', err);
            this.showMessage('装备失败', true);
        }
    }
    
    showMessage(msg: string, isError: boolean = false) {
        if (this.messageLabel) {
            this.messageLabel.string = msg;
            this.messageLabel.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);
            
            // 3秒后清空
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
