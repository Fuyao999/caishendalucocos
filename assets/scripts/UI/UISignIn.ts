import { _decorator, Component, Label, Button, Node, Color } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('UISignIn')
export class UISignIn extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    signInPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Label)
    statusLabel: Label = null;
    
    @property(Button)
    signInBtn: Button = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    // 签到状态
    private _signedToday: boolean = false;
    private _signStreak: number = 0;
    
    start() {
        console.log('UISignIn start');
        this.bindButtonEvents();
        this.hide();
        console.log('UISignIn 初始化完成');
    }
    
    onEnable() {
        console.log('UISignIn onEnable');
        this.bindButtonEvents();
    }
    
    // 绑定按钮事件
    bindButtonEvents() {
        if (this.signInBtn) {
            this.signInBtn.node.on('click', this.onSignInClicked, this);
        }
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
    }
    
    // 更新显示
    updateDisplay(playerData: any) {
        if (!playerData) return;
        
        // 后端返回 daily_sign (0或1), sign_streak
        this._signedToday = playerData.daily_sign === 1;
        this._signStreak = playerData.sign_streak || 0;
        
        if (this.statusLabel) {
            this.statusLabel.string = `已连续签到 ${this._signStreak} 天`;
        }
        
        if (this.signInBtn) {
            const btnLabel = this.signInBtn.node.getChildByName('Label');
            if (btnLabel) {
                const label = btnLabel.getComponent(Label);
                if (label) {
                    if (this._signedToday) {
                        label.string = '✅ 已签到';
                        label.color = new Color(46, 204, 113); // 绿色
                    } else {
                        label.string = '今日签到';
                        label.color = new Color(255, 215, 0); // 黄色
                    }
                }
            }
        }
    }
    
    onSignInClicked() {
        console.log('点击签到按钮');
        
        if (this._signedToday) {
            console.log('今日已签到');
            return;
        }
        
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 NetworkManager 为空');
            return;
        }
        
        // 调用后端签到 API
        gm.networkManager.signIn().then((result: any) => {
            console.log('签到结果:', result);
            if (result.code === 200) {
                this._signedToday = true;
                if (result.data) {
                    this._signStreak = result.data.streak || this._signStreak + 1;
                }
                // 临时修改playerData让updateDisplay正确显示
                const tempData = { ...gm.networkManager.playerData, daily_sign: 1 };
                this.updateDisplay(tempData);
                
                // 刷新玩家数据
                gm.networkManager.request('/player/info').then((info: any) => {
                    if (info.code === 200 && info.data) {
                        gm.networkManager.playerData = info.data;
                    }
                });
            }
        }).catch((err: any) => {
            console.error('签到失败:', err);
        });
    }
    
    show(playerData: any) {
        console.log('UISignIn show 被调用');
        if (this.signInPanel) {
            this.signInPanel.active = true;
            this.updateDisplay(playerData);
        } else {
            console.error('signInPanel 为 null!');
        }
    }
    
    hide() {
        if (this.signInPanel) {
            this.signInPanel.active = false;
        }
    }
}
