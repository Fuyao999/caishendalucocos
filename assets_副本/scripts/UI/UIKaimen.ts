import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIKaimen')
export class UIKaimen extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    kaimenPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Label)
    descLabel: Label = null;
    
    @property(Label)
    moneyLabel: Label = null;
    
    @property(Label)
    fragmentLabel: Label = null;
    
    @property(Label)
    meritLabel: Label = null;
    
    @property(Label)
    incenseLabel: Label = null;
    
    @property(Label)
    candleLabel: Label = null;
    
    @property(Button)
    confirmBtn: Button = null;
    
    start() {
        console.log('UIKaimen start');
        if (this.confirmBtn) {
            this.confirmBtn.node.on('click', this.onConfirmClicked, this);
        }
        this.hide();
    }
    
    show() {
        console.log('UIKaimen show');
        if (this.kaimenPanel) {
            this.kaimenPanel.active = true;
            this.updateRewards();
        }
    }
    
    hide() {
        if (this.kaimenPanel) {
            this.kaimenPanel.active = false;
        }
    }
    
    updateRewards() {
        // 从玩家数据获取奖励信息
        const gm = GameManager.instance;
        const playerData = gm?.networkManager?.playerData;
        const shengxiao = playerData?.shengxiao; // 0-11表示时辰
        
        // 基础奖励
        let reward = { money: 500, fragments: 3, merit: 1 };
        let bonusText = '';
        
        // 时辰加成
        if (shengxiao !== null && shengxiao !== undefined) {
            reward.money = Math.floor(reward.money * 1.2);
            reward.fragments = Math.floor(reward.fragments * 1.2);
            reward.merit = Math.floor(reward.merit * 1.2);
            bonusText = '\n✨ 时辰契合+20%收益！';
            
            if (this.titleLabel) {
                this.titleLabel.string = '🌟 时辰契合！开财门';
            }
        } else {
            if (this.titleLabel) {
                this.titleLabel.string = '🚪 开财门';
            }
        }
        
        // 更新显示
        if (this.moneyLabel) {
            this.moneyLabel.string = '💰 庙宇香火钱+' + reward.money;
        }
        if (this.fragmentLabel) {
            this.fragmentLabel.string = '🔷 碎片+' + reward.fragments;
        }
        if (this.meritLabel) {
            this.meritLabel.string = '⭐ 功德+' + reward.merit;
        }
        if (this.incenseLabel) {
            this.incenseLabel.string = '🕯️ 线香+2';
        }
        if (this.candleLabel) {
            this.candleLabel.string = '🔥 红烛+2';
        }
        if (this.descLabel) {
            this.descLabel.string = '朱红大门开启，财神赐福！' + bonusText;
        }
    }
    
    onConfirmClicked() {
        console.log('收下开财门奖励');
        
        // TODO: 调用后端API领取奖励
        // 奖励会加到 temple_storage、fragments、merit
        
        this.hide();
    }
}