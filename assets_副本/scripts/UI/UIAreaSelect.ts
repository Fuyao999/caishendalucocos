import { _decorator, Component, Node, Label, Button } from 'cc';
const { ccclass, property } = _decorator;

// 8个区域配置
const AREAS = [
    { id: 'tianlu',  name: '天禄', threshold: 100,    icon: '☰' },
    { id: 'zhenyue', name: '镇岳', threshold: 500,    icon: '☶' },
    { id: 'longyin', name: '龙吟', threshold: 1000,   icon: '☳' },
    { id: 'fuyao',   name: '扶摇', threshold: 5000,   icon: '☴' },
    { id: 'nanming', name: '南明', threshold: 10000,  icon: '☲' },
    { id: 'dibao',   name: '地宝', threshold: 50000,  icon: '☷' },
    { id: 'ganze',   name: '甘泽', threshold: 77777,  icon: '☱' },
    { id: 'liquan',  name: '流泉', threshold: 99999,  icon: '☵' }
];

@ccclass('UIAreaSelect')
export class UIAreaSelect extends Component {
    
    @property(Node)
    panel: Node = null;
    
    @property(Label)
    areaNameLabel: Label = null;
    
    @property(Label)
    thresholdLabel: Label = null;
    
    @property(Button)
    leftBtn: Button = null;
    
    @property(Button)
    rightBtn: Button = null;
    
    @property(Button)
    confirmBtn: Button = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Label)
    confirmLabel: Label = null;
    
    private _currentIndex: number = 0;
    private _onConfirmCallback: ((areaId: string) => void) | null = null;
    
    start() {
        if (this.panel) {
            this.panel.active = false;
        }
        
        // 绑定按钮事件
        if (this.leftBtn) {
            this.leftBtn.node.on('click', this.onLeftClicked, this);
        }
        if (this.rightBtn) {
            this.rightBtn.node.on('click', this.onRightClicked, this);
        }
        if (this.confirmBtn) {
            this.confirmBtn.node.on('click', this.onConfirmClicked, this);
        }
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.onCloseClicked, this);
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const area = AREAS[this._currentIndex];
        if (this.areaNameLabel) {
            this.areaNameLabel.string = area.icon + ' ' + area.name;
        }
        if (this.thresholdLabel) {
            this.thresholdLabel.string = '门槛: ' + area.threshold.toLocaleString() + ' 香火钱';
        }
    }
    
    onLeftClicked() {
        this._currentIndex--;
        if (this._currentIndex < 0) {
            this._currentIndex = AREAS.length - 1;
        }
        this.updateDisplay();
    }
    
    onRightClicked() {
        this._currentIndex++;
        if (this._currentIndex >= AREAS.length) {
            this._currentIndex = 0;
        }
        this.updateDisplay();
    }
    
    onConfirmClicked() {
        const area = AREAS[this._currentIndex];
        console.log('确认选择区域:', area.id);
        this.hide();
        if (this._onConfirmCallback) {
            this._onConfirmCallback(area.id);
        }
    }
    
    onCloseClicked() {
        this.hide();
    }
    
    show() {
        if (this.panel) {
            this.panel.active = true;
        }
    }
    
    hide() {
        if (this.panel) {
            this.panel.active = false;
        }
    }
    
    setOnConfirmCallback(callback: (areaId: string) => void) {
        this._onConfirmCallback = callback;
    }
    
    getCurrentAreaId(): string {
        return AREAS[this._currentIndex].id;
    }
}
