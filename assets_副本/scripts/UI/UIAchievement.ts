import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ScrollView, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 成就数据
interface AchievementItem {
    id: number;
    name: string;
    desc: string;
    reward: number;
    completed: boolean;
    claimed: boolean;
}

@ccclass('UIAchievement')
export class UIAchievement extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    achievementPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    achievementItemTemplate: Node = null;
    
    private _achievementList: AchievementItem[] = [
        { id: 1, name: '初入江湖', desc: '完成新手引导', reward: 100, completed: true, claimed: false },
        { id: 2, name: '财源广进', desc: '累计获得10万香火钱', reward: 500, completed: true, claimed: false },
        { id: 3, name: '功德无量', desc: '累计获得1000功德', reward: 300, completed: true, claimed: false },
        { id: 4, name: '化缘达人', desc: '完成100次化缘', reward: 800, completed: true, claimed: false },
        { id: 5, name: '供奉虔诚', desc: '供奉财神50次', reward: 400, completed: false, claimed: false },
        { id: 6, name: '境界突破', desc: '突破到真仙境界', reward: 1000, completed: false, claimed: false },
        { id: 7, name: '每日签到', desc: '连续签到30天', reward: 600, completed: false, claimed: false },
        { id: 8, name: '一掷千金', desc: '单次供奉消耗10000香火钱', reward: 700, completed: false, claimed: false },
    ];
    
    start() {
        console.log('UIAchievement start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIAchievement show');
        if (this.achievementPanel) {
            this.achievementPanel.active = true;
            this.updateAchievementList();
        }
    }
    
    hide() {
        if (this.achievementPanel) {
            this.achievementPanel.active = false;
        }
    }
    
    updateAchievementList() {
        console.log('更新成就列表');
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.achievementItemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemHeight = 70;
        
        // 设置 Content 高度
        const totalHeight = this._achievementList.length * itemHeight;
        const contentTrans = this.scrollContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(400, Math.max(totalHeight, 300));
        }
        
        this._achievementList.forEach((achievement, index) => {
            // 克隆模板
            const node = instantiate(this.achievementItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'NameLabel') {
                        label.string = achievement.name;
                        label.color = achievement.claimed ? new Color(128, 128, 128) : new Color(255, 255, 255);
                    } else if (child.name === 'DescLabel') {
                        label.string = achievement.desc;
                    } else if (child.name === 'RewardLabel') {
                        label.string = '+' + achievement.reward + ' 香火钱';
                    }
                }
                
                // 绑定领取按钮事件
                if (child.name === 'ClaimBtn') {
                    const btn = child.getComponent(Button);
                    if (btn) {
                        btn.interactable = achievement.completed && !achievement.claimed;
                        btn.node.on('click', () => this.onClaimClicked(achievement), this);
                    }
                }
            }
        });
        
        console.log('成就列表创建完成');
        
        // 滚动到顶部
        this.scheduleOnce(() => {
            const scrollView = this.scrollContent?.parent?.getComponent(ScrollView);
            if (scrollView) {
                scrollView.scrollToTop();
            }
        }, 0.1);
    }
    
    onClaimClicked(achievement: AchievementItem) {
        console.log('点击领取:', achievement.name);
        if (!achievement.completed) {
            console.log('成就未完成，无法领取');
            return;
        }
        if (achievement.claimed) {
            console.log('奖励已领取');
            return;
        }
        
        achievement.claimed = true;
        console.log('领取成功:', achievement.name);
    }
}