import { _decorator, Component, Node, Label, Button, Sprite, ScrollView, Prefab, instantiate, UITransform, Layout, Color } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

interface TitleData {
    id: string;
    name: string;
    desc: string;
    bonus: string;
    unlocked: boolean;
    progress: number;
}

@ccclass('UITitle')
export class UITitle extends Component {
    
    @property(Node)
    private closeBtn: Node = null!;
    
    @property(Label)
    private titleCountLabel: Label = null!;
    
    @property(Node)
    private titleListContent: Node = null!;
    
    @property(Prefab)
    private titleItemPrefab: Prefab = null!;
    
    @property(Node)
    private emptyHint: Node = null!;
    
    private titles: TitleData[] = [];
    
    start() {
        const closeBtnNode = this.node.getChildByName('CloseBtn');
        if (closeBtnNode) {
            closeBtnNode.on('click', this.hide, this);
        }
    }
    
    show() {
        this.node.active = true;
        this.loadTitles();
    }
    
    hide() {
        this.node.active = false;
    }
    
    async loadTitles() {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            const result = await gm.networkManager.request('/title/list');
            if (result.code === 200) {
                this.titles = result.data?.titles || [];
                this.renderTitleList();
            }
        } catch (error) {
            console.error('加载称号列表失败:', error);
        }
    }
    
    renderTitleList() {
        if (!this.titleListContent || !this.titleItemPrefab) {
            console.error('titleListContent 或 titleItemPrefab 未绑定');
            return;
        }
        
        this.titleListContent.removeAllChildren();
        
        if (this.titles.length === 0) {
            this.emptyHint.active = true;
            return;
        }
        
        this.emptyHint.active = false;
        
        // 更新称号数量
        const unlockedCount = this.titles.filter(t => t.unlocked).length;
        if (this.titleCountLabel) {
            this.titleCountLabel.string = `已解锁: ${unlockedCount}/${this.titles.length}`;
        }
        
        // 禁用 Layout
        const layout = this.titleListContent.getComponent(Layout);
        if (layout) {
            layout.enabled = false;
        }
        
        // 设置 Content 高度
        const itemHeight = 90;
        const totalHeight = this.titles.length * itemHeight;
        const contentTrans = this.titleListContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(560, totalHeight);
        }
        
        // 创建称号项
        this.titles.forEach((title, index) => {
            const item = instantiate(this.titleItemPrefab);
            item.setParent(this.titleListContent);
            item.setPosition(0, -index * itemHeight, 0);
            item.active = true;
            
            // 设置称号信息
            const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
            const descLabel = item.getChildByName('DescLabel')?.getComponent(Label);
            const bonusLabel = item.getChildByName('BonusLabel')?.getComponent(Label);
            const statusLabel = item.getChildByName('StatusLabel')?.getComponent(Label);
            
            if (nameLabel) {
                nameLabel.string = title.unlocked ? `✓ ${title.name}` : title.name;
                nameLabel.color = title.unlocked ? new Color(255, 215, 0) : new Color(170, 170, 170);
            }
            
            if (descLabel) descLabel.string = title.desc;
            if (bonusLabel) bonusLabel.string = title.bonus;
            
            if (statusLabel) {
                if (title.unlocked) {
                    statusLabel.string = '已解锁';
                    statusLabel.color = new Color(46, 204, 113);
                } else {
                    statusLabel.string = '未解锁';
                    statusLabel.color = new Color(150, 150, 150);
                }
            }
            
            // 设置背景颜色
            const bg = item.getComponent(Sprite);
            if (bg) {
                bg.color = title.unlocked ? new Color(50, 40, 20) : new Color(30, 30, 30);
            }
        });
    }
}
