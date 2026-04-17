import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, instantiate } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

interface FriendData {
    id: number;
    friendId: number;
    name: string;
    level: number;
    visitCount: number;
}

@ccclass('UIFriend')
export class UIFriend extends Component {
    
    @property(Node)
    private friendPanel: Node = null;
    
    @property(Label)
    private titleLabel: Label = null;
    
    @property(Button)
    private closeBtn: Button = null;
    
    @property(Node)
    private scrollContent: Node = null;
    
    @property(Node)
    private friendItemTemplate: Node = null;
    
    @property(Label)
    private visitCountLabel: Label = null;
    
    @property(Button)
    private addFriendBtn: Button = null;
    
    @property(Node)
    private emptyHint: Node = null;
    
    private friends: FriendData[] = [];
    
    start() {
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        if (this.addFriendBtn) {
            this.addFriendBtn.node.on('click', this.onAddFriendClicked, this);
        }
        this.hide();
    }
    
    show() {
        if (this.friendPanel) {
            this.friendPanel.active = true;
            this.loadFriends();
        }
    }
    
    hide() {
        if (this.friendPanel) {
            this.friendPanel.active = false;
        }
    }
    
    updateFriendList() {
        if (!this.scrollContent) {
            console.error('scrollContent 未绑定');
            return;
        }
        
        // 清除旧的列表项
        this.scrollContent.removeAllChildren();
        
        if (this.friends.length === 0) {
            this.emptyHint.active = true;
            return;
        }
        
        this.emptyHint.active = false;
        
        // 更新拜访次数显示
        if (this.visitCountLabel) {
            const totalVisits = this.friends.reduce((sum, f) => sum + (f.visitCount || 0), 0);
            this.visitCountLabel.string = totalVisits + '/20';
        }
        
        if (!this.friendItemTemplate) {
            console.error('friendItemTemplate 未绑定');
            return;
        }
        
        const itemHeight = 90;
        
        this.friends.forEach((friend, index) => {
            const node = instantiate(this.friendItemTemplate);
            node.setParent(this.scrollContent);
            node.setPosition(0, -index * itemHeight, 0);
            node.active = true;
            
            // 设置好友信息
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (child.name === 'NameLabel') {
                    const label = child.getComponent(Label);
                    if (label) {
                        label.string = friend.name;
                    }
                }
                
                // 绑定拜访按钮
                if (child.name === 'VisitBtn') {
                    const btn = child.getComponent(Button);
                    if (btn) {
                        btn.node.on('click', () => this.onVisitClicked(friend), this);
                    }
                }
            }
        });
    }
    
    async onVisitClicked(friend: FriendData) {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            const result = await gm.networkManager.request('/friend/visit/' + friend.id, { method: 'POST' });
            if (result.code === 200) {
                this.loadFriends();
            }
        } catch (error) {
            console.error('拜访出错:', error);
        }
    }
    
    async loadFriends() {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            const result = await gm.networkManager.request('/friend/list');
            if (result.code === 200) {
                this.friends = result.data?.friends || [];
                this.updateFriendList();
            }
        } catch (error) {
            console.error('加载好友列表失败:', error);
        }
    }
    
    async onAddFriendClicked() {
        try {
            const gm = GameManager.instance;
            if (!gm?.networkManager) return;
            
            const result = await gm.networkManager.request('/friend/add', { method: 'POST' });
            if (result.code === 200) {
                this.loadFriends();
            }
        } catch (error) {
            console.error('添加好友出错:', error);
        }
    }
}
