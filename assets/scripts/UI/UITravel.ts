import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 云游区域数据
interface TravelArea {
    id: number;
    name: string;
    desc: string;
    level: number;
    unlocked: boolean;
}

@ccclass('UITravel')
export class UITravel extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    travelPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    areaItemTemplate: Node = null;
    
    private _areaList: TravelArea[] = [
        { id: 1, name: '土地庙', desc: '最低级的修行场所', level: 1, unlocked: true },
        { id: 2, name: '城隍庙', desc: '城市守护神所在', level: 5, unlocked: true },
        { id: 3, name: '财神庙', desc: '供奉财神的圣地', level: 10, unlocked: true },
        { id: 4, name: '文昌阁', desc: '学业文思之神', level: 15, unlocked: true },
        { id: 5, name: '关帝庙', desc: '武财神镇守之地', level: 20, unlocked: false },
        { id: 6, name: '天后宫', desc: '海上守护神', level: 25, unlocked: false },
        { id: 7, name: '药王庙', desc: '医药之神所在', level: 30, unlocked: false },
        { id: 8, name: '太清宫', desc: '最高神仙圣地', level: 50, unlocked: false },
    ];
    
    start() {
        console.log('UITravel start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UITravel show');
        if (this.travelPanel) {
            this.travelPanel.active = true;
            this.updateAreaList();
        }
    }
    
    hide() {
        if (this.travelPanel) {
            this.travelPanel.active = false;
        }
    }
    
    updateAreaList() {
        console.log('更新云游区域列表');
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.areaItemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const gm = GameManager.instance;
        const playerLevel = gm?.networkManager?.playerData?.level || 1;
        
        const itemHeight = 90;
        
        this._areaList.forEach((area, index) => {
            // 克隆模板
            const node = instantiate(this.areaItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 获取玩家数据
            const gm = GameManager.instance;
            const playerData = gm?.networkManager?.playerData;
            const playerGold = playerData?.gold || 0;
            const playerRealm = playerData?.realm_name || '凡人';
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'NameLabel') {
                        label.string = area.name + ' (需要Lv.' + area.level + ')';
                        label.color = area.unlocked ? new Color(255, 255, 255) : new Color(128, 128, 128);
                    } else if (child.name === 'DescLabel') {
                        // 显示玩家真实数据
                        label.string = area.desc + '\n玩家: ' + this.formatMoney(playerGold) + ' | ' + playerRealm;
                    }
                }
                
                // 绑定前往按钮事件
                if (child.name === 'GoBtn') {
                    const btn = child.getComponent(Button);
                    if (btn) {
                        btn.interactable = area.unlocked;
                        btn.node.on('click', () => this.onGoClicked(area), this);
                    }
                }
            }
        });
        
        console.log('云游区域列表创建完成');
    }
    
    onGoClicked(area: TravelArea) {
        console.log('点击前往:', area.name);
        if (!area.unlocked) {
            console.log('区域未解锁');
            return;
        }
        
        // TODO: 传送到该区域
        console.log('传送成功:', area.name);
        this.hide();
    }
    
    formatMoney(value: number): string {
        if (value >= 100000000) {
            return (value / 100000000).toFixed(1) + '亿';
        } else if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
        }
        return value.toString();
    }
}