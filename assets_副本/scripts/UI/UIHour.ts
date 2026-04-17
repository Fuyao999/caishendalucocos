import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 时辰数据
interface HourItem {
    id: number;
    name: string;
    time: string;
    selected: boolean;
}

@ccclass('UIHour')
export class UIHour extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    hourPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Node)
    gridContainer: Node = null;
    
    @property(Node)
    hourItemTemplate: Node = null;
    
    private _hourList: HourItem[] = [
        { id: 0, name: '子时', time: '23:00-01:00', selected: false },
        { id: 1, name: '丑时', time: '01:00-03:00', selected: false },
        { id: 2, name: '寅时', time: '03:00-05:00', selected: false },
        { id: 3, name: '卯时', time: '05:00-07:00', selected: false },
        { id: 4, name: '辰时', time: '07:00-09:00', selected: false },
        { id: 5, name: '巳时', time: '09:00-11:00', selected: false },
        { id: 6, name: '午时', time: '11:00-13:00', selected: false },
        { id: 7, name: '未时', time: '13:00-15:00', selected: false },
        { id: 8, name: '申时', time: '15:00-17:00', selected: false },
        { id: 9, name: '酉时', time: '17:00-19:00', selected: false },
        { id: 10, name: '戌时', time: '19:00-21:00', selected: false },
        { id: 11, name: '亥时', time: '21:00-23:00', selected: false },
    ];
    
    private _selectedHour: number = -1;
    
    start() {
        console.log('UIHour start');
        this.hide();
    }
    
    show() {
        console.log('UIHour show');
        if (this.hourPanel) {
            this.hourPanel.active = true;
            this.updateHourList();
            // 点击面板背景关闭
            this.hourPanel.off('click');
            this.hourPanel.on('click', () => this.hide(), this);
        }
    }
    
    hide() {
        if (this.hourPanel) {
            this.hourPanel.active = false;
        }
    }
    
    updateHourList() {
        console.log('更新时辰列表');
        
        // 清除旧的列表项
        if (this.gridContainer) {
            this.gridContainer.removeAllChildren();
        }
        
        if (!this.hourItemTemplate || !this.gridContainer) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemWidth = 140;
        const itemHeight = 70;
        const cols = 3;
        const spacingX = 10;
        const spacingY = 10;
        
        this._hourList.forEach((hour, index) => {
            // 克隆模板
            const node = instantiate(this.hourItemTemplate);
            node.setParent(this.gridContainer);
            
            // 计算位置（网格布局）
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = -220 + col * (itemWidth + spacingX);
            const y = 100 - row * (itemHeight + spacingY);
            node.setPosition(x, y, 0);
            node.active = true;
            
            // 更新显示
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label && child.name === 'HourLabel') {
                    label.string = hour.name + '\n' + hour.time;
                }
            }
            
            // 设置按钮状态
            const btn = node.getComponent(Button);
            if (btn) {
                // 如果已选中，高亮显示
                if (this._selectedHour === hour.id) {
                    btn.target = node;
                    // 使用颜色区分选中状态
                    const sprite = node.getComponent(Sprite);
                    if (sprite) {
                        sprite.color = new Color(255, 215, 0); // 金色
                    }
                }
                
                // 绑定点击事件
                btn.node.on('click', () => this.onHourClicked(hour), this);
            }
        });
    }
    
    onHourClicked(hour: HourItem) {
        console.log('选择时辰:', hour.name);
        this._selectedHour = hour.id;
        
        // 更新显示
        this.updateHourList();
    }
    
    confirmSelection() {
        if (this._selectedHour < 0) {
            console.log('请先选择时辰');
            return;
        }
        
        const hour = this._hourList[this._selectedHour];
        console.log('确认选择:', hour.name, 'id:', hour.id);
        
        // 保存时辰到本地
        const gm = GameManager.instance;
        if (gm && gm.dataManager) {
            gm.dataManager.set('shengxiao', hour.id);
            gm.saveData();
            
            // 同步到服务器
            if (gm.networkManager) {
                gm.networkManager.syncData({ shengxiao: hour.id }).catch((e: any) => {
                    console.error('同步时辰失败:', e);
                });
            }
        }
        
        this.hide();
    }
}