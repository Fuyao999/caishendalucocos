import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ScrollView, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 商品数据
interface ShopItem {
    id: number;
    name: string;
    price: number;
    type: string;
}

@ccclass('UIShop')
export class UIShop extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    shopPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    shopItemTemplate: Node = null;
    
    private _shopList: ShopItem[] = [
        { id: 1, name: '线香 x10', price: 100, type: 'incense' },
        { id: 2, name: '红烛 x10', price: 150, type: 'candle' },
        { id: 3, name: '金纸 x10', price: 200, type: 'paper' },
        { id: 4, name: '供果 x5', price: 300, type: 'fruit' },
        { id: 5, name: '香火钱 x1000', price: 1000, type: 'gold' },
        { id: 6, name: '功德值 x100', price: 500, type: 'merit' },
        { id: 7, name: '体力药水', price: 80, type: 'stamina' },
        { id: 8, name: '幸运符', price: 200, type: 'luck' },
    ];
    
    start() {
        console.log('UIShop start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIShop show');
        if (this.shopPanel) {
            this.shopPanel.active = true;
            this.updateShopList();
        }
    }
    
    hide() {
        if (this.shopPanel) {
            this.shopPanel.active = false;
        }
    }
    
    updateShopList() {
        console.log('更新商城列表');
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.shopItemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemHeight = 70;
        
        // 设置 Content 高度
        const totalHeight = this._shopList.length * itemHeight;
        const contentTrans = this.scrollContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(400, Math.max(totalHeight, 300));
        }
        
        this._shopList.forEach((item, index) => {
            // 克隆模板
            const node = instantiate(this.shopItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'NameLabel') {
                        label.string = item.name;
                    } else if (child.name === 'PriceLabel') {
                        label.string = item.price + ' 香火钱';
                    }
                }
                
                // 绑定购买按钮事件
                if (child.name === 'BuyBtn') {
                    child.on('click', () => this.onBuyClicked(item), this);
                }
            }
        });
        
        console.log('商城列表创建完成');
        
        // 滚动到顶部
        this.scheduleOnce(() => {
            const scrollView = this.scrollContent?.parent?.getComponent(ScrollView);
            if (scrollView) {
                scrollView.scrollToTop();
            }
        }, 0.1);
    }
    
    onBuyClicked(item: ShopItem) {
        console.log('点击购买:', item.name);
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        // 检查玩家金钱是否足够
        const playerData = gm.networkManager.playerData;
        if (!playerData) return;
        
        const playerGold = playerData.gold || 0;
        if (playerGold < item.price) {
            console.log('金钱不足');
            return;
        }
        
        // TODO: 调用后端购买 API
        console.log('购买成功:', item.name);
    }
}