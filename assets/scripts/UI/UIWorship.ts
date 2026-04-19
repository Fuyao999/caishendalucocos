import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 9位财神
const GODS = [
    { id: 'tudigong', name: '土地公', title: '福德正神', effect: '香火钱+10%', type: 'money', bonus: 0.10, unlocked: true, icon: '🏠' },
    { id: 'guanyu', name: '关羽', title: '武财神', effect: '化缘收益+15%', type: 'alms', bonus: 0.15, unlocked: false, unlockLevel: 3, icon: '⚔️' },
    { id: 'yaoshaosi', name: '姚少司', title: '北路利市仙官', effect: '暴击率+5%', type: 'crit', bonus: 0.05, unlocked: false, unlockAlms: 30, icon: '🎯' },
    { id: 'chenjiugong', name: '陈九公', title: '东路招财使者', effect: '香火钱上限+500', type: 'cap', bonus: 500, unlocked: false, unlockMoney: 5000, icon: '💰' },
    { id: 'fanli', name: '范蠡', title: '东南财神', effect: '碎片获取+20%', type: 'fragment', bonus: 0.20, unlocked: false, unlockMerit: 100, icon: '🔮' },
    { id: 'caobao', name: '曹宝', title: '南路招宝天尊', effect: '化缘风险-10%', type: 'risk', bonus: -0.10, unlocked: false, icon: '🛡️' },
    { id: 'liuhai', name: '刘海', title: '偏财神', effect: '每日首供双倍', type: 'daily', bonus: 0, unlocked: false, icon: '🐸' },
    { id: 'xiaosheng', name: '萧升', title: '西路纳珍天尊', effect: '供奉功德+10%', type: 'merit', bonus: 0.10, unlocked: false, icon: '📿' },
    { id: 'zhaogongming', name: '赵公明', title: '正财神', effect: '香火钱+25%', type: 'money', bonus: 0.25, unlocked: false, icon: '👑' }
];

// 供奉材料
const MATERIALS = [
    { id: 'incense', name: '线香', cost: 1, duration: 1, icon: '📿' },
    { id: 'candle', name: '红烛', cost: 1, duration: 3, icon: '🕯️' },
    { id: 'paper', name: '金纸', cost: 1, duration: 5, icon: '💰' },
    { id: 'fruit', name: '供果', cost: 1, duration: 10, icon: '🍎' }
];

@ccclass('UIWorship')
export class UIWorship extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    worshipPanel: Node = null;
    
    @property(Label)
    godNameLabel: Label = null;
    
    @property(Label)
    effectLabel: Label = null;
    
    @property(Button)
    leftGodBtn: Button = null;
    
    @property(Button)
    rightGodBtn: Button = null;
    
    @property(Button)
    matIncenseBtn: Button = null;
    
    @property(Button)
    matCandleBtn: Button = null;
    
    @property(Button)
    matPaperBtn: Button = null;
    
    @property(Button)
    matFruitBtn: Button = null;
    
    @property(Button)
    doWorshipBtn: Button = null;
    
    @property(Button)
    closeWorshipBtn: Button = null;
    
    @property(Label)
    resultLabel: Label = null;
    
    // 玩家数据（从 GameManager 获取）
    private _playerData: any = null;
    
    // 当前选择的财神和材料
    private _selectedGodIndex: number = 0;
    private _selectedMatIndex: number = 0;
    
    start() {
        console.log('UIWorship start');
        this.bindButtonEvents();
        this.hide();
        console.log('UIWorship 初始化完成');
    }
    
    // 绑定按钮事件
    bindButtonEvents() {
        console.log('绑定供奉面板按钮事件...');
        console.log('worshipPanel:', this.worshipPanel);
        console.log('leftGodBtn:', this.leftGodBtn);
        console.log('rightGodBtn:', this.rightGodBtn);
        console.log('matIncenseBtn:', this.matIncenseBtn);
        console.log('matCandleBtn:', this.matCandleBtn);
        console.log('matPaperBtn:', this.matPaperBtn);
        console.log('matFruitBtn:', this.matFruitBtn);
        console.log('doWorshipBtn:', this.doWorshipBtn);
        console.log('closeWorshipBtn:', this.closeWorshipBtn);
        
        if (this.leftGodBtn) {
            this.leftGodBtn.node.on('click', this.prevGod, this);
        }
        if (this.rightGodBtn) {
            this.rightGodBtn.node.on('click', this.nextGod, this);
        }
        if (this.matIncenseBtn) {
            this.matIncenseBtn.node.on('click', () => this.selectMat(0), this);
        }
        if (this.matCandleBtn) {
            this.matCandleBtn.node.on('click', () => this.selectMat(1), this);
        }
        if (this.matPaperBtn) {
            this.matPaperBtn.node.on('click', () => this.selectMat(2), this);
        }
        if (this.matFruitBtn) {
            this.matFruitBtn.node.on('click', () => this.selectMat(3), this);
        }
        if (this.doWorshipBtn) {
            this.doWorshipBtn.node.on('click', this.doWorship, this);
        }
        if (this.closeWorshipBtn) {
            this.closeWorshipBtn.node.on('click', this.hide, this);
        }
        
        this.updateDisplay();
    }
    
    prevGod() {
        console.log('点击左箭头切换财神');
        this._selectedGodIndex--;
        if (this._selectedGodIndex < 0) {
            this._selectedGodIndex = GODS.length - 1;
        }
        this.updateDisplay();
    }
    
    nextGod() {
        console.log('点击右箭头切换财神');
        this._selectedGodIndex++;
        if (this._selectedGodIndex >= GODS.length) {
            this._selectedGodIndex = 0;
        }
        this.updateDisplay();
    }
    
    selectMat(index: number) {
        console.log('选择材料:', index);
        this._selectedMatIndex = index;
        this.updateDisplay();
    }
    
    updateDisplay() {
        const god = GODS[this._selectedGodIndex];
        const mat = MATERIALS[this._selectedMatIndex];
        
        if (this.godNameLabel) {
            this.godNameLabel.string = god.icon + ' ' + god.name + ' ' + god.title;
        }
        
        if (this.effectLabel) {
            this.effectLabel.string = god.effect;
        }
        
        if (this.resultLabel) {
            const costText = '消耗: ' + mat.icon + mat.name + ' x1';
            const rewardText = '奖励: ' + (10 + mat.duration * 5) + ' 钱 +' + (god.id === 'xiaosheng' ? 1.1 : 1) + ' 功德';
            this.resultLabel.string = costText + '\n' + rewardText;
        }
    }
    
    async doWorship() {
        console.log('执行供奉');
        const god = GODS[this._selectedGodIndex];
        const mat = MATERIALS[this._selectedMatIndex];
        
        if (!god.unlocked) {
            if (this.resultLabel) {
                this.resultLabel.string = '🔒 ' + god.name + ' 未解锁';
                this.resultLabel.color = new Color(255, 100, 100);
            }
            return;
        }
        
        // 显示供奉中
        if (this.resultLabel) {
            this.resultLabel.string = '🙏 供奉中...';
            this.resultLabel.color = new Color(255, 215, 0);
        }
        
        const reward = 10 + mat.duration * 5;
        const merit = god.id === 'xiaosheng' ? Math.floor(1.1) : 1;
        
        // 调用后端API
        try {
            const gm = GameManager.instance;
            await gm.networkManager.worship(god.id, mat.id);
        } catch (e) {
            console.error('供奉API失败:', e);
        }
        
        // 延迟显示结果
        this.scheduleOnce(() => {
            if (this.resultLabel) {
                this.resultLabel.string = '🙏 供奉成功！+' + reward + '钱 +' + merit + '功德';
                this.resultLabel.color = new Color(100, 255, 100);
            }
        }, 0.5);
    }
    
    show() {
        console.log('UIWorship show 被调用');
        if (this.worshipPanel) {
            this.worshipPanel.active = true;
            this.updateDisplay();
        } else {
            console.error('worshipPanel 为 null!');
        }
    }
    
    hide() {
        if (this.worshipPanel) {
            this.worshipPanel.active = false;
        }
    }
}
