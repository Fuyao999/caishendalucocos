import { _decorator, Component, Node, Label, Button, Sprite, ScrollView, Prefab, instantiate, UITransform, Layout, Color } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

interface DecorData {
    theme: string;
    ownedThemes: string[];
    ownedItems: string[];
    equippedItems: string[];
}

const THEMES = [
    { id: 'default', name: '默认', colors: ['#333333', '#222222'], bonus: {}, price: 0 },
    { id: 'red', name: '中国红', colors: ['#8B0000', '#FF0000'], bonus: { gold: 5 }, price: 100 },
    { id: 'gold', name: '金色年华', colors: ['#DAA520', '#FFD700'], bonus: { merit: 10 }, price: 200 },
    { id: 'jade', name: '翡翠绿', colors: ['#2E8B57', '#98FB98'], bonus: { fragments: 5 }, price: 150 }
];

const ITEMS = [
    { id: 'statue1', name: '小财神像', emoji: '🧧', slot: '地面', bonus: { gold: 2 }, price: 50 },
    { id: 'banner1', name: '招财横幅', emoji: '🏮', slot: '墙面', bonus: { alms: 3 }, price: 80 },
    { id: 'plant1', name: '发财树', emoji: '🌲', slot: '角落', bonus: { merit: 5 }, price: 100 }
];

@ccclass('UIDecor')
export class UIDecor extends Component {
    
    @property(Node)
    private closeBtn: Node = null!;
    
    @property(Label)
    private currentThemeLabel: Label = null!;
    
    @property(Node)
    private ThemeListContent: Node = null!;
    
    @property(Node)
    private ItemListContent: Node = null!;
    
    @property(Node)
    private equippedLabel: Node = null!;
    
    @property(Node)
    private bonusLabel: Node = null!;
    
    @property(Node)
    private ThemeItemTemplate: Node = null!;
    
    @property(Node)
    private DecorItemTemplate: Node = null!;
    
    private decorData: DecorData = {
        theme: 'default',
        ownedThemes: ['default'],
        ownedItems: [],
        equippedItems: []
    };
    
    start() {
        const closeBtnNode = this.node.getChildByName('CloseBtn');
        if (closeBtnNode) {
            closeBtnNode.on('click', this.hide, this);
        }
    }
    
    show() {
        this.node.active = true;
        this.loadDecorData();
    }
    
    hide() {
        this.node.active = false;
    }
    
    async loadDecorData() {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            const result = await gm.networkManager.request('/decor/data');
            if (result.code === 200) {
                this.decorData = result.data || this.decorData;
                this.renderAll();
            }
        } catch (error) {
            console.error('加载装修数据失败:', error);
            this.renderAll();
        }
    }
    
    renderAll() {
        this.renderThemes();
        this.renderItems();
        this.updateEquipped();
    }
    
    renderThemes() {
        if (!this.ThemeListContent || !this.ThemeItemTemplate) return;
        
        // 先清除所有子节点
        this.ThemeListContent.removeAllChildren();
        
        // 禁用 Layout
        const layout = this.ThemeListContent.getComponent(Layout);
        if (layout) layout.enabled = false;
        
        const itemHeight = 80;
        const totalHeight = THEMES.length * itemHeight;
        const contentTrans = this.ThemeListContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(280, totalHeight);
        }
        
        THEMES.forEach((theme, index) => {
            const item = instantiate(this.ThemeItemTemplate);
            item.setParent(this.ThemeListContent);
            item.setPosition(0, -index * itemHeight, 0);
            item.active = true;
            
            // 设置名字、价格的 Label
            const nameLabel = item.getChildByName('NameLabel')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = theme.name;
                nameLabel.color = this.decorData.theme === theme.id ? new Color(255, 215, 0) : new Color(255, 255, 255);
            }
            
            const priceLabel = item.getChildByName('PriceLabel')?.getComponent(Label);
            if (priceLabel) {
                priceLabel.string = theme.price === 0 ? '默认' : `${theme.price}元宝`;
            }
            
            // 绑定点击事件
            const btn = item.getComponent(Button);
            if (btn) {
                console.log('ThemeItem button found, binding click');
                btn.node.on('click', () => {
                    console.log('Theme clicked:', theme.id);
                    this.onThemeClicked(theme.id);
                }, this);
            }
        });
    }
    
    onThemeClicked(themeId: string) {
        console.log('点击主题:', themeId);
        this.decorData.theme = themeId;
        this.renderThemes();
        this.updateEquipped();
    }
    
    renderItems() {
        if (!this.ItemListContent || !this.DecorItemTemplate) return;
        
        // 先清除所有子节点
        this.ItemListContent.removeAllChildren();
        
        // 禁用 Layout
        const layout = this.ItemListContent.getComponent(Layout);
        if (layout) layout.enabled = false;
        
        const itemHeight = 80;
        const totalHeight = ITEMS.length * itemHeight;
        const contentTrans = this.ItemListContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(280, totalHeight);
        }
        
        ITEMS.forEach((item, index) => {
            const node = instantiate(this.DecorItemTemplate);
            node.setParent(this.ItemListContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            const emojiLabel = node.getChildByName('EmojiLabel')?.getComponent(Label);
            if (emojiLabel) emojiLabel.string = item.emoji;
            
            const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
            if (nameLabel) nameLabel.string = item.name;
            
            const slotLabel = node.getChildByName('SlotLabel')?.getComponent(Label);
            if (slotLabel) slotLabel.string = `${item.slot} ${item.price}元宝`;
            
            // 绑定点击事件
            const btn = node.getComponent(Button);
            if (btn) {
                console.log('DecorItem button found, binding click');
                btn.node.on('click', () => {
                    console.log('Item clicked:', item.id);
                    this.onItemClicked(item.id);
                }, this);
            }
        });
    }
    
    onItemClicked(itemId: string) {
        console.log('点击装饰物品:', itemId);
        // 装备装饰物品
        if (!this.decorData.equippedItems.includes(itemId)) {
            this.decorData.equippedItems.push(itemId);
        }
        this.updateEquipped();
        this.renderItems();
    }
    
    updateEquipped() {
        if (this.equippedLabel) {
            const equipped = ITEMS.filter(i => this.decorData.equippedItems.includes(i.id));
            const label = this.equippedLabel.getComponent(Label);
            if (label) {
                label.string = equipped.length === 0 ? '暂无装饰' : equipped.map(i => `${i.emoji}${i.name}`).join(', ');
            }
        }
        
        if (this.bonusLabel) {
            const theme = THEMES.find(t => t.id === this.decorData.theme);
            const equipped = ITEMS.filter(i => this.decorData.equippedItems.includes(i.id));
            let bonusStr = '无';
            if (theme && Object.keys(theme.bonus).length > 0) {
                bonusStr = Object.entries(theme.bonus).map(([k, v]) => `${k}+${v}`).join(' ');
            }
            if (equipped.length > 0) {
                const itemBonus = equipped.map(i => Object.entries(i.bonus).map(([k, v]) => `${k}+${v}`).join(' ')).join(' | ');
                bonusStr = bonusStr === '无' ? itemBonus : `${bonusStr} | ${itemBonus}`;
            }
            const label = this.bonusLabel.getComponent(Label);
            if (label) label.string = bonusStr;
        }
    }
}
