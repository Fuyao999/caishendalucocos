import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

interface QuestData {
    id: string;
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

@ccclass('UIQuest')
export class UIQuest extends Component {
    
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
    
    private _quests: QuestData[] = [];
    private _messageTimer: number = 0;

    start() {
        console.log('UIQuest start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', () => this.hide(), this);
        }
        if (this.tabTaskBtn) {
            this.tabTaskBtn.node.on('click', () => this.switchTab('task'), this);
        }
        if (this.tabAchievementBtn) {
            this.tabAchievementBtn.node.on('click', () => this.switchTab('achievement'), this);
        }
        // 不要在这里 hide()，由 UIGame.ts 管理显示/隐藏
    }
    
    show() {
        console.log('UIQuest show, this.node:', this.node.name);
        // 直接使用 this.node，因为 UIQuest 组件挂载在 QuestPanel 上
        if (this.node) {
            this.node.active = true;
            this.switchTab('task');
            this.loadData();
        }
    }
    
    hide() {
        if (this.node) {
            this.node.active = false;
        }
    }
    
    switchTab(tab: 'task' | 'achievement') {
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
            const result = await gm.networkManager.request('/quests/list');
            if (result.code === 200) {
                this._quests = result.data?.quests?.filter((q: any) => q.type === 'daily') || [];
                this.renderTasks();
            }
            
            // 加载称号
            const titleResult = await gm.networkManager.request('/quests/titles');
            if (titleResult.code === 200) {
                const titles = titleResult.data?.titles || [];
                const equipped = titles.find((t: any) => t.equipped);
                if (this.currentTitleLabel) {
                    this.currentTitleLabel.string = '当前称号: ' + (equipped ? equipped.name : '无');
                }
            }
        } catch (err) {
            console.error('加载任务失败:', err);
            this.showMessage('加载失败', true);
        }
    }
    
    renderTasks() {
        console.log('=== renderTasks called ===');
        
        // 如果 taskContent 没有绑定，尝试从 this.node (QuestPanel) 找 TaskContent 子节点
        let contentNode = this.taskContent;
        if (!contentNode) {
            console.log('taskContent is null, searching for TaskContent child...');
            const children = this.node.children;
            for (let i = 0; i < children.length; i++) {
                console.log('Child', i, ':', children[i].name);
                if (children[i].name === 'TaskContent') {
                    contentNode = children[i];
                    console.log('Found TaskContent node!');
                    break;
                }
            }
        }
        
        if (!contentNode) {
            console.log('ERROR: still no content node!');
            return;
        }
        
        contentNode.removeAllChildren();
        
        if (this._quests.length === 0) {
            const empty = new Node();
            empty.setParent(contentNode);
            const label = empty.addComponent(Label);
            label.string = '暂无每日任务';
            label.color = new Color(180, 180, 180);
            return;
        }
        
        this._quests.forEach((quest, index) => {
            this.createTaskItem(quest, index, contentNode);
        });
    }
    
    createTaskItem(quest: QuestData, index: number, contentNode: Node) {
        const item = new Node();
        item.setParent(contentNode);
        item.setPosition(0, -index * 80, 0);
        
        const uiTransform = item.addComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(360, 70);
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
        
        // 描述/进度
        const descNode = new Node();
        descNode.setParent(item);
        descNode.setPosition(-120, -15, 0);
        const dl = descNode.addComponent(Label);
        dl.string = `${quest.progress}/${quest.target_count}`;
        dl.color = quest.done ? new Color(100, 255, 100) : new Color(200, 200, 200);
        dl.fontSize = 12;
        
        // 奖励
        const rewardNode = new Node();
        rewardNode.setParent(item);
        rewardNode.setPosition(80, 0, 0);
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
        
        const btnTransform = claimBtn.addComponent(UITransform);
        if (btnTransform) {
            btnTransform.setContentSize(60, 35);
        }
        
        const btnLabel = new Node();
        btnLabel.setParent(claimBtn);
        const bl = btnLabel.addComponent(Label);
        bl.string = quest.claimed ? '已领' : (quest.done ? '领取' : '进行中');
        bl.color = new Color(255, 255, 255);
        bl.fontSize = 14;
        
        if (quest.done && !quest.claimed) {
            claimBtn.on(Node.EventType.TOUCH_END, () => this.onClaimClicked(quest), this);
        }
    }
    
    async onClaimClicked(quest: QuestData) {
        if (quest.claimed) return;
        
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
            console.error('领取失败:', err);
            this.showMessage('领取失败', true);
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
