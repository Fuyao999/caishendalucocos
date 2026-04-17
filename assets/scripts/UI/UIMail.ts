import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, instantiate } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

interface MailData {
    id: number;
    title: string;
    content: string;
    rewards: any;
    claimed: boolean;
    date: string;
}

@ccclass('UIMail')
export class UIMail extends Component {
    
    @property(Node)
    private mailPanel: Node = null;
    
    @property(Label)
    private titleLabel: Label = null;
    
    @property(Button)
    private closeBtn: Button = null;
    
    @property(Node)
    private scrollContent: Node = null;
    
    @property(Node)
    private mailItemTemplate: Node = null;
    
    @property(Label)
    private unreadCountLabel: Label = null;
    
    @property(Node)
    private emptyHint: Node = null;
    
    private mails: MailData[] = [];
    
    start() {
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        this.hide();
    }
    
    show() {
        if (this.mailPanel) {
            this.mailPanel.active = true;
            this.loadMails();
        }
    }
    
    hide() {
        if (this.mailPanel) {
            this.mailPanel.active = false;
        }
    }
    
    loadMails() {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            gm.networkManager.request('/mail/list').then((result: any) => {
                if (result.code === 200) {
                    this.mails = result.data?.mails || [];
                    this.updateMailList();
                }
            }).catch((err: any) => {
                console.error('加载邮件列表失败:', err);
            });
        } catch (error) {
            console.error('加载邮件列表失败:', error);
        }
    }
    
    updateMailList() {
        if (!this.scrollContent) {
            console.error('scrollContent 未绑定');
            return;
        }
        
        this.scrollContent.removeAllChildren();
        
        if (this.mails.length === 0) {
            this.emptyHint.active = true;
            return;
        }
        
        this.emptyHint.active = false;
        
        if (!this.mailItemTemplate) {
            console.error('mailItemTemplate 未绑定');
            return;
        }
        
        // 更新未读数量
        const unreadCount = this.mails.filter(m => !m.claimed).length;
        if (this.unreadCountLabel) {
            this.unreadCountLabel.string = `未读消息: ${unreadCount} 封`;
        }
        
        const itemHeight = 110;
        
        this.mails.forEach((mail, index) => {
            const node = instantiate(this.mailItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 设置邮件信息
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'TitleLabel') {
                        label.string = mail.claimed ? `✓ ${mail.title}` : mail.title;
                        label.color = mail.claimed ? new Color(170, 170, 170) : new Color(255, 215, 0);
                    } else if (child.name === 'DateLabel') {
                        label.string = mail.date || '';
                    } else if (child.name === 'ContentLabel') {
                        label.string = mail.content || '';
                    } else if (child.name === 'StatusLabel') {
                        label.string = mail.claimed ? '已领取' : '点击领取奖励';
                        label.color = mail.claimed ? new Color(46, 204, 113) : new Color(255, 215, 0);
                    }
                }
                
                // 点击领取奖励
                if (child.name === 'ClaimBtn' || child.name === 'StatusLabel') {
                    const btn = child.getComponent(Button);
                    if (btn) {
                        btn.node.off('click');
                        btn.node.on('click', () => this.onClaimMail(mail), this);
                    }
                }
            }
            
            // 点击整个邮件项领取奖励
            node.off('click');
            node.on('click', () => {
                if (!mail.claimed) {
                    this.onClaimMail(mail);
                }
            }, this);
        });
    }
    
    onClaimMail(mail: MailData) {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            gm.networkManager.request('/mail/claim/' + mail.id, { method: 'POST' }).then((result: any) => {
                if (result.code === 200) {
                    console.log('领取成功:', result.data?.rewards);
                    this.loadMails();
                } else {
                    console.error('领取失败:', result.message);
                }
            }).catch((err: any) => {
                console.error('领取邮件失败:', err);
            });
        } catch (error) {
            console.error('领取邮件失败:', error);
        }
    }
}
