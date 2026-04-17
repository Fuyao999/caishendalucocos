import { _decorator, Component, Node, Label, Prefab, instantiate, Button } from 'cc';
import { DataManager } from './DataManager';
import { NetworkManager } from './NetworkManager';
import { UISettings } from './UI/UISettings';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    public static instance: GameManager = null;
    
    public dataManager: DataManager = null;
    public networkManager: NetworkManager = null;
    
    // 设置按钮
    public settingsBtn: Node = null;
    
    // 设置面板
    public settingsPanel: Node = null;
    
    private _isLoggedIn: boolean = false;
    
    // 弹窗节点
    private _modalNode: Node = null;
    private _confirmNode: Node = null;
    private _confirmCallback: any = null;
    
    onLoad() {
        console.log('GameManager onLoad 开始');
        if (GameManager.instance === null) {
            GameManager.instance = this;
            this.dataManager = DataManager.getInstance();
            // NetworkManager should be added as component to this node
            this.networkManager = this.getComponent(NetworkManager) || this.addComponent(NetworkManager);
            console.log('GameManager networkManager:', this.networkManager);
            this.loadData();
        } else {
            console.log('GameManager instance 已存在，销毁');
            this.destroy();
            return;
        }
    }
    
    start() {
        console.log('GameManager initialized');
        
        // 绑定设置按钮点击事件
        if (this.settingsBtn) {
            const btn = this.settingsBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onSettingsBtnClicked, this);
            }
        }
    }
    
    loadData() {
        this.dataManager.load();
    }
    
    saveData() {
        this.dataManager.save();
    }
    
    isLoggedIn(): boolean {
        return this._isLoggedIn;
    }
    
    setLoggedIn(value: boolean) {
        this._isLoggedIn = value;
    }
    
    getPlayerData() {
        return this.dataManager.getPlayerData();
    }
    
    updatePlayerData(data: any) {
        this.dataManager.updatePlayerData(data);
        this.saveData();
    }
    
    // 显示设置面板
    showSettings() {
        if (this.settingsPanel) {
            const settings = this.settingsPanel.getComponent(UISettings);
            if (settings) {
                settings.show();
            }
        }
    }
    
    // 隐藏设置面板
    hideSettings() {
        if (this.settingsPanel) {
            const settings = this.settingsPanel.getComponent(UISettings);
            if (settings) {
                settings.hide();
            }
        }
    }
    
    // 设置按钮点击
    onSettingsBtnClicked() {
        this.showSettings();
    }
    
    // 显示弹窗
    showModal(title: string, content: string) {
        console.log('显示弹窗:', title, content);
    }
    
    // 显示确认框
    showConfirm(title: string, content: string, callback: any) {
        console.log('显示确认框:', title, content);
        this._confirmCallback = callback;
    }
    
    // 显示Toast提示
    showToast(message: string) {
        console.log('Toast:', message);
    }
    
    // 播放BGM
    playBGM() {
        console.log('播放BGM');
    }
    
    // 停止BGM
    stopBGM() {
        console.log('停止BGM');
    }
}
