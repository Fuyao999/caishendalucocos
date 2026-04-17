import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

@ccclass('UIInvite')
export class UIInvite extends Component {
    
    @property(Node)
    invitePanel: Node = null;
    
    @property(Label)
    myCodeLabel: Label = null;
    
    @property(Node)
    copyBtn: Node = null;
    
    @property(EditBox)
    inputCode: EditBox = null;
    
    @property(Node)
    bindBtn: Node = null;
    
    @property(Node)
    inviteList: Node = null;
    
    @property(Node)
    closeBtn: Node = null;
    
    @property(Node)
    emptyHint: Node = null;
    
    start() {
        this.bindEvents();
        this.hide();
    }
    
    bindEvents() {
        if (this.copyBtn) {
            const btn = this.copyBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onCopyCode, this);
            }
        }
        
        if (this.bindBtn) {
            const btn = this.bindBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onBindCode, this);
            }
        }
        
        if (this.closeBtn) {
            const btn = this.closeBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.hide, this);
            }
        }
    }
    
    show() {
        if (this.invitePanel) {
            this.invitePanel.active = true;
            this.refresh();
        }
    }
    
    hide() {
        if (this.invitePanel) {
            this.invitePanel.active = false;
        }
    }
    
    refresh() {
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        const playerData = gm.networkManager.playerData;
        if (!playerData) return;
        
        // 显示我的邀请码
        if (this.myCodeLabel) {
            this.myCodeLabel.string = playerData.invitationCode || '暂无';
        }
        
        // 渲染邀请好友列表
        this.renderInviteList(playerData.invitedFriends || []);
    }
    
    renderInviteList(friends: any[]) {
        if (!this.inviteList) return;
        
        // 清空现有列表
        this.inviteList.removeAllChildren();
        
        if (friends.length === 0) {
            if (this.emptyHint) {
                this.emptyHint.active = true;
            }
            return;
        }
        
        if (this.emptyHint) {
            this.emptyHint.active = false;
        }
        
        // 后续添加好友列表项
    }
    
    async onCopyCode() {
        const code = this.myCodeLabel?.string;
        if (code && code !== '暂无') {
            // 复制到剪贴板
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(code);
            }
            GameManager.instance?.showToast('邀请码已复制');
        }
    }
    
    async onBindCode() {
        const code = this.inputCode?.string?.trim();
        if (!code) {
            GameManager.instance?.showToast('请输入邀请码');
            return;
        }
        
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        
        try {
            const result = await gm.networkManager.request('/invite/bind', {
                method: 'POST',
                body: JSON.stringify({ invitationCode: code })
            });
            
            if (result && result.code === 200) {
                GameManager.instance?.showToast('绑定成功，获得奖励！');
                this.inputCode.string = '';
                this.refresh();
            } else {
                GameManager.instance?.showToast(result?.message || '绑定失败');
            }
        } catch(e: any) {
            GameManager.instance?.showToast(e.message || '绑定失败');
        }
    }
}
