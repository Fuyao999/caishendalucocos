import { _decorator, Component, Label, Button, Node, Color, Sprite, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 商品数据
interface ShopItem {
    id: number;
    name: string;
    icon: string;
    description: string;
    price: number;
    item_type: string;
    item_count: number;
    level_req: number;
}

// 商品项UI数据
interface ShopItemUI {
    node: Node;
    item: ShopItem;
    quantity: number;
}

@ccclass('UIShop')
export class UIShop extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    shopPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Label)
    playerGoldLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    shopContent: Node = null;
    
    @property(Node)
    shopItemTemplate: Node = null;
    
    @property(Label)
    messageLabel: Label = null;
    
    private _shopList: ShopItem[] = [];
    private _itemUIs: Map<number, ShopItemUI> = new Map();
    private _messageTimer: number = 0;

    start() {
        console.log('UIShop start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', () => this.hide(), this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIShop show');
        if (this.shopPanel) {
            this.shopPanel.active = true;
            // 强制放到最前面
            this.shopPanel.setSiblingIndex(999);
            this.updatePlayerGold();
            this.loadShopList();
            this.showMessage('');
        }
    }
    
    hide() {
        if (this.shopPanel) {
            this.shopPanel.active = false;
        }
    }
    
    // 更新玩家香火钱显示
    updatePlayerGold() {
        const gm = GameManager.instance;
        const playerData = gm?.networkManager?.playerData;
        if (this.playerGoldLabel && playerData) {
            this.playerGoldLabel.string = '💰 ' + (playerData.gold || 0).toLocaleString();
        }
    }
    
    // 显示提示信息
    showMessage(msg: string, isError: boolean = false) {
        if (this.messageLabel) {
            this.messageLabel.string = msg;
            this.messageLabel.color = isError ? new Color(255, 100, 100) : new Color(100, 255, 100);
            
            // 3秒后自动清空
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
    
    // 从API加载商品列表
    async loadShopList() {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/shop/list');
            if (result.code === 200 && result.data) {
                this._shopList = result.data;
                this.renderShopList();
            } else {
                this.showMessage('加载失败', true);
            }
        } catch (err) {
            console.error('加载商品列表失败:', err);
            this.showMessage('加载失败', true);
        }
    }
    
    // 渲染商品列表
    renderShopList() {
        if (!this.shopContent || !this.shopItemTemplate) {
            console.error('shopContent or shopItemTemplate is null');
            return;
        }
        
        // 清除旧的
        this.shopContent.removeAllChildren();
        this._itemUIs.clear();
        
        // 设置Content大小和锚点
        const itemHeight = 100;
        const contentHeight = Math.max(400, this._shopList.length * itemHeight);
        const uiTransform = this.shopContent.getComponent(UITransform);
        if (uiTransform) {
            uiTransform.setContentSize(400, contentHeight);
            uiTransform.setAnchorPoint(0.5, 1); // 锚点设为顶部中间
        }
        
        this._shopList.forEach((item, index) => {
            const node = instantiate(this.shopItemTemplate);
            node.setParent(this.shopContent);
            node.active = true;
            node.setPosition(0, -20 - index * itemHeight, 0);
            
            const itemUI: ShopItemUI = {
                node,
                item,
                quantity: 1
            };
            this._itemUIs.set(item.id, itemUI);
            
            this.setupItem(node, item, itemUI);
        });
    }
    
    // 设置商品项
    setupItem(node: Node, item: ShopItem, itemUI: ShopItemUI) {
        const children = node.children;
        
        children.forEach(child => {
            const label = child.getComponent(Label);
            
            switch(child.name) {
                case 'IconLabel':
                    if (label) {
                        label.string = item.icon;
                        label.color = new Color(255, 255, 255);
                    }
                    break;
                case 'NameLabel':
                    if (label) {
                        label.string = item.name;
                        label.color = new Color(255, 255, 255);
                    }
                    break;
                case 'PriceLabel':
                    if (label) {
                        label.string = '💰 ' + item.price.toLocaleString();
                        label.color = new Color(255, 215, 0);
                    }
                    break;
                case 'QuantityLabel':
                    if (label) {
                        label.string = 'x' + itemUI.quantity;
                        label.color = new Color(255, 255, 255);
                    }
                    break;
                case 'PlusBtn':
                    child.off('click');
                    child.on('click', () => this.onPlusClicked(itemUI), this);
                    break;
                case 'MinusBtn':
                    child.off('click');
                    child.on('click', () => this.onMinusClicked(itemUI), this);
                    break;
                case 'BuyBtn':
                    child.off('click');
                    child.on('click', () => this.onBuyClicked(itemUI), this);
                    // 设置购买按钮样式
                    const btnLabel = child.getChildByName('BuyLabel')?.getComponent(Label);
                    if (btnLabel) {
                        btnLabel.string = '购买';
                        btnLabel.color = new Color(255, 255, 255);
                    }
                    const sprite = child.getComponent(Sprite);
                    if (sprite) {
                        sprite.color = new Color(46, 204, 113);
                    }
                    break;
            }
        });
    }
    
    // 加数量
    onPlusClicked(itemUI: ShopItemUI) {
        const gm = GameManager.instance;
        const playerData = gm?.networkManager?.playerData;
        const maxAfford = Math.floor((playerData?.gold || 0) / itemUI.item.price);
        const maxQty = 99;
        
        if (itemUI.quantity < Math.min(maxAfford, maxQty)) {
            itemUI.quantity++;
            this.updateItemDisplay(itemUI);
        }
    }
    
    // 减数量
    onMinusClicked(itemUI: ShopItemUI) {
        if (itemUI.quantity > 1) {
            itemUI.quantity--;
            this.updateItemDisplay(itemUI);
        }
    }
    
    // 更新商品显示
    updateItemDisplay(itemUI: ShopItemUI) {
        const node = itemUI.node;
        
        node.children.forEach(child => {
            const label = child.getComponent(Label);
            if (child.name === 'QuantityLabel' && label) {
                label.string = 'x' + itemUI.quantity;
            }
        });
    }
    
    onBuyClicked(itemUI: ShopItemUI) {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            this.showMessage('网络未就绪', true);
            return;
        }
        
        const playerData = gm.networkManager.playerData;
        if (!playerData) {
            this.showMessage('玩家数据未加载', true);
            return;
        }
        
        const item = itemUI.item;
        const totalPrice = item.price * itemUI.quantity;
        
        // 检查等级
        if ((playerData.level || 1) < item.level_req) {
            this.showMessage('需要' + item.level_req + '级才能购买', true);
            return;
        }
        
        // 检查金钱
        const playerGold = playerData.gold || 0;
        if (playerGold < totalPrice) {
            this.showMessage('香火钱不足', true);
            return;
        }
        
        this.doBuy(itemUI, totalPrice);
    }
    
    async doBuy(itemUI: ShopItemUI, totalPrice: number) {
        const gm = GameManager.instance;
        const playerData = gm.networkManager.playerData;
        const item = itemUI.item;
        
        try {
            const result = await gm.networkManager.request('/shop/buy', {
                method: 'POST',
                body: JSON.stringify({ product_id: item.id, count: itemUI.quantity })
            });
            
            if (result.code === 200) {
                // 更新本地数据
                if (result.data && result.data.new_gold !== undefined) {
                    playerData.gold = result.data.new_gold;
                }
                
                // 增加道具
                switch(item.item_type) {
                    case 'incense_sticks':
                        playerData.incense_sticks = (playerData.incense_sticks || 0) + item.item_count * itemUI.quantity;
                        break;
                    case 'candles':
                        playerData.candles = (playerData.candles || 0) + item.item_count * itemUI.quantity;
                        break;
                    case 'gold_paper':
                        playerData.gold_paper = (playerData.gold_paper || 0) + item.item_count * itemUI.quantity;
                        break;
                    case 'fruits':
                        playerData.fruits = (playerData.fruits || 0) + item.item_count * itemUI.quantity;
                        break;
                }
                
                this.showMessage('购买成功！+' + item.icon + ' x' + itemUI.quantity);
                this.updatePlayerGold();
                
                // 重置数量
                itemUI.quantity = 1;
                this.updateItemDisplay(itemUI);
                
                // 刷新主界面
                if (gm.uiGame) {
                    gm.uiGame.updateMoney?.();
                }
            } else {
                this.showMessage(result.message || '购买失败', true);
            }
        } catch (err) {
            console.error('购买失败:', err);
            this.showMessage('购买失败', true);
        }
    }
}
