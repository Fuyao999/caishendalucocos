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
    
    // QuestPanel 节点
    @property(Node)
    questPanel: Node = null;
    
    @property(Button)
    tabTaskBtn: Button = null;
    
    @property(Button)
    tabAchievementBtn: Button = null;
    
    @property(Node)
    taskContent: Node = null;
    
    @property(Node)
    achievementContent: Node = null;
    
    @property(Label)
    currentTitleLabel: Label = null;
    
    @property(Label)
    messageLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    // AchievementPanel 节点
    @property(Node)
    achievementPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Node)
    content: Node = null;
    
    @property(Label)
    achievementMessageLabel: Label = null;
    
    @property(Button)
    achievementCloseBtn: Button = null;
    
    private _quests: QuestData[] = [];
    private _titles: TitleData[] = [];
    private _currentTab: 'task' | 'achievement' = 'task';
    private _messageTimer: number = 0;

    start() {
        // QuestPanel 事件绑定
        if (this.closeBtn) {
            this.closeBtn.node.on('click', () => this.hide(), this);
        }
        if (this.tabTaskBtn) {
            this.tabTaskBtn.node.on('click', () => this.switchTab('task'), this);
        }
        if (this.tabAchievementBtn) {
            this.tabAchievementBtn.node.on('click', () => this.switchTab('achievement'), this);
        }
        
        // AchievementPanel 事件绑定
        if (this.achievementCloseBtn) {
            this.achievementCloseBtn.node.on('click', () => this.hideAchievement(), this);
        }
        
        this.hide();
        if (this.achievementPanel) {
            this.achievementPanel.active = false;
        }
    }
    
    // 显示任务面板
    show() {
        if (this.questPanel) {
            this.questPanel.active = true;
            this.switchTab('task');
            this.loadData();
        }
    }
    
    hide() {
        if (this.questPanel) {
            this.questPanel.active = false;
        }
    }
    
    // 显示成就面板
    showAchievement() {
        if (this.achievementPanel) {
            this.achievementPanel.active = true;
            this.loadTitles();
        }
    }
    
    hideAchievement() {
        if (this.achievementPanel) {
            this.achievementPanel.active = false;
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
                sprite.color = tab === 'task' ? new Color(255, 200, 0) : new Color(100, 100, 100);
            }
        }
        if (this.tabAchievementBtn) {
            const sprite = this.tabAchievementBtn.getComponent(Sprite);
            if (sprite) {
                sprite.color = tab === 'achievement' ? new Color(255, 200, 0) : new Color(100, 100, 100);
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
                    this.currentTitleLabel.string = '当前称号: ' + (equipped ? equipped.name : '无');
                }
            }
        } catch (err) {
            console.error('加载任务数据失败:', err);
            this.showMessage('加载失败', true);
        }
    }
    
    async loadTitles() {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/quests/titles');
            if (result.code === 200) {
                this._titles = result.data?.titles || [];
                this.renderAchievements();
            }
        } catch (err) {
            console.error('加载称号数据失败:', err);
            this.showAchievementMessage('加载失败', true);
        }
    }
    
    // 渲染每日任务
    renderTasks() {
        if (!this.taskContent) return;
        
        this.taskContent.removeAllChildren();
        
        const dailyQuests = this._quests.filter(q => q.type === 'daily');
        
        if (dailyQuests.length === 0) {
            const emptyLabel = new Node();
            emptyLabel.setParent(this.taskContent);
            const label = emptyLabel.addComponent(Label);
            label.string = '暂无每日任务';
            label.color = new Color(180, 180, 180);
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
        
        const uiTransform = item.addComponent('UITransform');
        if (uiTransform) {
            (uiTransform as any).setContentSize(360, 70);
        }
        
        const bg = item.addComponent(Sprite);
        bg.color = quest.done && !quest.claimed ? new Color(80, 60, 40) : new Color(50, 50, 60);
        bg.type = Sprite.Type.SLICE;
        
        // 任务名称
        const nameNode = new Node();
        nameNode.setParent(item);
        nameNode.setPosition(-120, 10, 0);
        const nl = nameNode.addComponent(Label);
        nl.string = quest.name;
        nl.color = new Color(255, 255, 255);
        nl.fontSize = 16;
        
        // 描述
        const descNode = new Node();
        descNode.setParent(item);
        descNode.setPosition(-120, -15, 0);
        const dl = descNode.addComponent(Label);
        dl.string = quest.description || '';
        dl.color = new Color(180, 180, 180);
        dl.fontSize = 12;
        
        // 进度
        const progressNode = new Node();
        progressNode.setParent(item);
        progressNode.setPosition(80, 10, 0);
        const pl = progressNode.addComponent(Label);
        pl.string = `${quest.progress}/${quest.target_count}`;
        pl.color = quest.done ? new Color(100, 255, 100) : new Color(200, 200, 200);
        pl.fontSize = 14;
        
        // 奖励
        const rewardNode = new Node();
        rewardNode.setParent(item);
        rewardNode.setPosition(80, -15, 0);
        const rl = rewardNode.addComponent(Label);
        let rewardStr = '';
        if (quest.reward.gold > 0) rewardStr += `${quest.reward.gold}金 `;
        if (quest.reward.fragment > 0) rewardStr += `${quest.reward.fragment}碎 `;
        if (quest.reward.merit > 0) rewardStr += `${quest.reward.merit}功 `;
        if (quest.reward.incense > 0) rewardStr += `${quest.reward.incense}香 `;
        if (quest.reward.candle > 0) rewardStr += `${quest.reward.candle}烛 `;
        rl.string = rewardStr || '-';
        rl.color = new Color(255, 215, 0);
        rl.fontSize = 12;
        
        // 领取按钮
        const claimBtn = new Node();
        claimBtn.setParent(item);
        claimBtn.setPosition(150, 0, 0);
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
        
        if (quest.done && !quest.claimed) {
            claimBtn.on(Node.EventType.TOUCH_END, () => this.claimReward(quest), this);
        }
    }
    
    // 渲染成就/称号
    renderAchievements() {
        if (!this.content) return;
        
        this.content.removeAllChildren();
        
        if (this._titles.length === 0) {
            const emptyLabel = new Node();
            emptyLabel.setParent(this.content);
            const label = emptyLabel.addComponent(Label);
            label.string = '暂无称号';
            label.color = new Color(180, 180, 180);
            return;
        }
        
        const sortedTitles = [...this._titles].sort((a, b) => a.id.localeCompare(b.id));
        
        sortedTitles.forEach((title, index) => {
            this.createTitleItem(title, index);
        });
    }
    
    // 创建称号项
    createTitleItem(title: TitleData, index: number) {
        const item = new Node();
        item.setParent(this.content);
        item.setPosition(0, -index * 90, 0);
        
        const uiTransform = item.addComponent('UITransform');
        if (uiTransform) {
            (uiTransform as any).setContentSize(360, 80);
        }
        
        const bg = item.addComponent(Sprite);
        bg.color = title.unlocked ? new Color(60, 50, 40) : new Color(40, 40, 45);
        bg.type = Sprite.Type.SLICE;
        
        // 图标
        const iconNode = new Node();
        iconNode.setParent(item);
        iconNode.setPosition(-150, 0, 0);
        const il = iconNode.addComponent(Label);
        il.string = title.unlocked ? (title.icon || '🏆') : '🔒';
        il.fontSize = 32;
        
        // 名称
        const nameNode = new Node();
        nameNode.setParent(item);
        nameNode.setPosition(-90, 15, 0);
        const nl = nameNode.addComponent(Label);
        nl.string = title.unlocked ? title.name : '???';
        nl.color = title.unlocked ? new Color(255, 200, 0) : new Color(100, 100, 100);
        nl.fontSize = 16;
        
        // 描述
        const descNode = new Node();
        descNode.setParent(item);
        descNode.setPosition(-90, -10, 0);
        const dl = descNode.addComponent(Label);
        dl.string = title.unlocked ? title.desc : '未解锁';
        dl.color = title.unlocked ? new Color(180, 180, 180) : new Color(80, 80, 80);
        dl.fontSize = 12;
        
        // 加成
        const bonusNode = new Node();
        bonusNode.setParent(item);
        bonusNode.setPosition(100, 0, 0);
        const bl = bonusNode.addComponent(Label);
        bl.string = title.unlocked ? (title.bonus || '') : '';
        bl.color = new Color(46, 204, 113);
        bl.fontSize = 11;
        bl.horizontalAlign = Label.HorizontalAlign.RIGHT;
        
        // 装备按钮
        if (title.unlocked) {
            const equipBtn = new Node();
            equipBtn.setParent(item);
            equipBtn.setPosition(160, 0, 0);
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
                quest.claimed = true;
                
                if (result.data?.player) {
                    Object.assign(gm.networkManager.playerData, result.data.player);
                    gm.uiGame?.updateMoney?.();
                }
                
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
                this._titles.forEach(t => t.equipped = false);
                title.equipped = true;
                
                if (this.currentTitleLabel) {
                    this.currentTitleLabel.string = '当前称号: ' + title.name;
                }
                
                this.loadTitles();
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
    
    showAchievementMessage(msg: string, isError: boolean = false) {
        if (this.achievementMessageLabel) {
            this.achievementMessageLabel.string = msg;
            this.achievementMessageLabel.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);
            
            if (this._messageTimer) {
                clearTimeout(this._messageTimer);
            }
            this._messageTimer = setTimeout(() => {
                if (this.achievementMessageLabel) {
                    this.achievementMessageLabel.string = '';
                }
            }, 3000) as any;
        }
    }
}
