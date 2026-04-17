import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ScrollView, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 背包物品数据
interface InventoryItem {
    id: number;
    name: string;
    icon: string;
    count: number;
    type: string;
}

@ccclass('UIInventory')
export class UIInventory extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    inventoryPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    itemTemplate: Node = null;
    
    // 模拟背包物品数据
    private _inventoryList: InventoryItem[] = [
        { id: 1, name: '线香', icon: '📿', count: 10, type: 'material' },
        { id: 2, name: '红烛', icon: '🕯️', count: 5, type: 'material' },
        { id: 3, name: '金纸', icon: '💰', count: 20, type: 'material' },
        { id: 4, name: '供果', icon: '🍎', count: 3, type: 'material' },
        { id: 5, name: '体力药水', icon: '🧪', count: 1, type: 'item' },
        { id: 6, name: '幸运符', icon: '🍀', count: 1, type: 'item' },
        { id: 7, name: '财神碎片', icon: '💎', count: 5, type: 'fragment' },
        { id: 8, name: '功德令牌', icon: '🏅', count: 2, type: 'item' },
    ];
    
    start() {
        console.log('UIInventory start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIInventory show');
        if (this.inventoryPanel) {
            this.inventoryPanel.active = true;
            this.updateInventoryList();
        }
    }
    
    hide() {
        if (this.inventoryPanel) {
            this.inventoryPanel.active = false;
        }
    }
    
    updateInventoryList() {
        console.log('更新背包列表');
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.itemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemSize = 70;
        const columns = 5;
        const spacingX = 10;
        const spacingY = 10;
        
        // 设置 Content 高度
        const rowCount = Math.ceil(this._inventoryList.length / columns);
        const totalHeight = rowCount * itemSize + (rowCount - 1) * spacingY;
        const contentTrans = this.scrollContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(400, Math.max(totalHeight, 300));
        }
        
        this._inventoryList.forEach((item, index) => {
            // 克隆模板
            const node = instantiate(this.itemTemplate);
            node.setParent(this.scrollContent);
            
            // 计算位置（网格布局）
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = -180 + col * (itemSize + spacingX);
            const y = -row * (itemSize + spacingY) - itemSize / 2;
            node.setPosition(x, y, 0);
            node.active = true;
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label && child.name === 'CountLabel') {
                    label.string = 'x' + item.count;
                }
            }
        });
        
        console.log('背包列表创建完成');
        
        // 滚动到顶部
        this.scheduleOnce(() => {
            const scrollView = this.scrollContent?.parent?.getComponent(ScrollView);
            if (scrollView) {
                scrollView.scrollToTop();
            }
        }, 0.1);
    }
}