import { _decorator, Component, Node, Label, Button, Color } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

@ccclass('UISettings')
export class UISettings extends Component {
    
    // 面板节点
    @property(Node)
    settingsPanel: Node = null;
    
    // 关闭按钮
    @property(Node)
    closeButton: Node = null;
    
    // BGM开关
    @property(Node)
    bgmToggle: Node = null;
    
    // 音效开关
    @property(Node)
    sfxToggle: Node = null;
    
    // 登录通知开关
    @property(Node)
    loginToggle: Node = null;
    
    // 活动通知开关
    @property(Node)
    eventToggle: Node = null;
    
    // 帮助按钮
    @property(Node)
    faqButton: Node = null;
    
    // 客服按钮
    @property(Node)
    contactButton: Node = null;
    
    // 隐私政策按钮
    @property(Node)
    privacyButton: Node = null;
    
    // 清除缓存按钮
    @property(Node)
    clearCacheButton: Node = null;
    
    start() {
        // 自动查找面板节点
        if (!this.settingsPanel) {
            this.settingsPanel = this.node;
        }
        this.bindEvents();
        // 确保面板初始隐藏
        this.hide();
    }
    
    // 绑定按钮事件
    bindEvents() {
        // 关闭按钮
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onClose, this);
            }
        }
        
        // BGM开关
        if (this.bgmToggle) {
            const btn = this.bgmToggle.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onToggleBGM, this);
            }
        }
        
        // 音效开关
        if (this.sfxToggle) {
            const btn = this.sfxToggle.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onToggleSFX, this);
            }
        }
        
        // 登录通知开关
        if (this.loginToggle) {
            const btn = this.loginToggle.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onToggleLoginNotify, this);
            }
        }
        
        // 活动通知开关
        if (this.eventToggle) {
            const btn = this.eventToggle.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onToggleEventNotify, this);
            }
        }
        
        // 帮助按钮
        if (this.faqButton) {
            const btn = this.faqButton.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onShowFAQ, this);
            }
        }
        
        // 客服按钮
        if (this.contactButton) {
            const btn = this.contactButton.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onShowContact, this);
            }
        }
        
        // 隐私政策按钮
        if (this.privacyButton) {
            const btn = this.privacyButton.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onShowPrivacy, this);
            }
        }
        
        // 清除缓存按钮
        if (this.clearCacheButton) {
            const btn = this.clearCacheButton.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onClearCache, this);
            }
        }
    }
    
    // 更新开关显示
    updateToggleLabel(toggleNode: Node, isOn: boolean) {
        if (!toggleNode) return;
        
        // 尝试三种命名方式
        const nameWithoutToggle = toggleNode.name.replace('Toggle', '');
        let label = toggleNode.getChildByName(nameWithoutToggle + 'ToggleLabel')?.getComponent(Label);
        if (!label) {
            label = toggleNode.getChildByName(nameWithoutToggle + 'Label')?.getComponent(Label);
        }
        if (!label) {
            label = toggleNode.getChildByName('ToggleLabel')?.getComponent(Label);
        }
        if (label) {
            label.string = isOn ? '开启' : '关闭';
            label.color = isOn ? new Color(46, 204, 113) : new Color(200, 200, 200);
        }
    }
    
    // 初始化显示
    initDisplay() {
        const settings = GameManager.instance.dataManager.getSettings();
        
        this.updateToggleLabel(this.bgmToggle, settings.bgm !== false);
        this.updateToggleLabel(this.sfxToggle, settings.sfx !== false);
        this.updateToggleLabel(this.loginToggle, settings.notify_login !== false);
        this.updateToggleLabel(this.eventToggle, settings.notify_event !== false);
    }
    
    // 关闭
    onClose() {
        this.hide();
    }
    
    // 切换BGM
    onToggleBGM() {
        const settings = GameManager.instance.dataManager.getSettings();
        settings.bgm = !settings.bgm;
        GameManager.instance.dataManager.saveSettings(settings);
        this.updateToggleLabel(this.bgmToggle, settings.bgm);
        
        if (settings.bgm) {
            GameManager.instance.playBGM();
        } else {
            GameManager.instance.stopBGM();
        }
    }
    
    // 切换音效
    onToggleSFX() {
        const settings = GameManager.instance.dataManager.getSettings();
        settings.sfx = !settings.sfx;
        GameManager.instance.dataManager.saveSettings(settings);
        this.updateToggleLabel(this.sfxToggle, settings.sfx);
    }
    
    // 切换登录通知
    onToggleLoginNotify() {
        const settings = GameManager.instance.dataManager.getSettings();
        settings.notify_login = !settings.notify_login;
        GameManager.instance.dataManager.saveSettings(settings);
        this.updateToggleLabel(this.loginToggle, settings.notify_login);
    }
    
    // 切换活动通知
    onToggleEventNotify() {
        const settings = GameManager.instance.dataManager.getSettings();
        settings.notify_event = !settings.notify_event;
        GameManager.instance.dataManager.saveSettings(settings);
        this.updateToggleLabel(this.eventToggle, settings.notify_event);
    }
    
    // 显示帮助
    onShowFAQ() {
        GameManager.instance.showModal('帮助与FAQ', 
            'Q: 如何获得香火钱？\nA: 通过化缘、供奉、完成每日任务等方式获得\n\n' +
            'Q: 如何解锁更多财神？\nA: 提升等级、完成成就、积累功德等方式解锁\n\n' +
            'Q: 香火钱不够用怎么办？\nA: 多做任务、邀请好友、每日签到等都能获得香火钱');
    }
    
    // 显示客服
    onShowContact() {
        GameManager.instance.showModal('联系客服', 
            '📧 邮箱: support@caishen.com\n' +
            '💬 微信公众号: 财神大陆\n' +
            '⏰ 工作时间: 9:00-18:00');
    }
    
    // 显示隐私政策
    onShowPrivacy() {
        GameManager.instance.showModal('隐私政策', 
            '我们非常重视您的隐私保护\n\n' +
            '1. 我们会收集您的游戏数据用于提供更好的服务\n' +
            '2. 您的个人信息不会被出售给第三方\n' +
            '3. 您可以随时联系我们删除您的账户数据\n\n' +
            '如有疑问，请联系客服');
    }
    
    // 清除缓存
    onClearCache() {
        GameManager.instance.showConfirm('确定要清除缓存吗？', 
            '这将重置所有设置但不会删除游戏进度',
            () => {
                GameManager.instance.dataManager.clearCache();
                GameManager.instance.showToast('缓存已清除');
            });
    }
    
    // 显示面板
    show() {
        if (this.settingsPanel) {
            this.settingsPanel.active = true;
            this.initDisplay();
        }
    }
    
    // 隐藏面板
    hide() {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
    }
}
