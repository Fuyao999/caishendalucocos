import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ScrollView, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 任务数据
interface QuestItem {
    id: number;
    name: string;
    desc: string;
    reward: number;
    type: string;
    completed: boolean;
    claimed: boolean;
}

@ccclass('UIQuest')
export class UIQuest extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    questPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    questItemTemplate: Node = null;
    
    private _questList: QuestItem[] = [
        { id: 1, name: '每日签到', desc: '每天签到一次', reward: 100, type: 'daily', completed: true, claimed: false },
        { id: 2, name: '供奉财神', desc: '供奉任意财神一次', reward: 50, type: 'worship', completed: true, claimed: false },
        { id: 3, name: '化缘十次', desc: '完成10次化缘', reward: 200, type: 'alms', completed: true, claimed: false },
        { id: 4, name: '升级境界', desc: '提升一个境界', reward: 500, type: 'realm', completed: false, claimed: false },
        { id: 5, name: '收取庙宇', desc: '收取庙宇产出', reward: 30, type: 'temple', completed: true, claimed: false },
        { id: 6, name: '连续签到7天', desc: '连续签到7天', reward: 1000, type: 'daily', completed: false, claimed: false },
        { id: 7, name: '功德满1000', desc: '累计获得1000功德', reward: 800, type: 'merit', completed: false, claimed: false },
        { id: 8, name: '香火钱满10万', desc: '累计获得10万香火钱', reward: 1000, type: 'gold', completed: false, claimed: false },
    ];
    
    start() {
        console.log('UIQuest start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIQuest show');
        if (this.questPanel) {
            this.questPanel.active = true;
            this.updateQuestList();
        }
    }
    
    hide() {
        if (this.questPanel) {
            this.questPanel.active = false;
        }
    }
    
    updateQuestList() {
        console.log('更新任务列表');
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.questItemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemHeight = 70;
        
        // 设置 Content 高度
        const totalHeight = this._questList.length * itemHeight;
        const contentTrans = this.scrollContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(400, Math.max(totalHeight, 300));
        }
        
        this._questList.forEach((quest, index) => {
            // 克隆模板
            const node = instantiate(this.questItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'NameLabel') {
                        label.string = quest.name;
                    } else if (child.name === 'DescLabel') {
                        label.string = quest.desc;
                    } else if (child.name === 'RewardLabel') {
                        label.string = '+' + quest.reward + ' 香火钱';
                    }
                }
                
                // 绑定领取按钮事件
                if (child.name === 'ClaimBtn') {
                    const btn = child.getComponent(Button);
                    if (btn) {
                        btn.interactable = true;
                        btn.node.on('click', () => this.onClaimClicked(quest), this);
                    }
                }
            }
        });
        
        console.log('任务列表创建完成');
        
        // 滚动到顶部
        this.scheduleOnce(() => {
            const scrollView = this.scrollContent?.parent?.getComponent(ScrollView);
            if (scrollView) {
                scrollView.scrollToTop();
            }
        }, 0.1);
    }
    
    onClaimClicked(quest: QuestItem) {
        console.log('点击领取:', quest.name);
        if (!quest.completed) {
            console.log('任务未完成，无法领取');
            return;
        }
        if (quest.claimed) {
            console.log('奖励已领取');
            return;
        }
        
        quest.claimed = true;
        console.log('领取成功:', quest.name);
    }
}