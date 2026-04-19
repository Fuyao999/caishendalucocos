import { _decorator, Component, Node, Label, EditBox, Button, Color } from 'cc';
import { GameManager } from '../GameManager';
import { director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILogin')
export class UILogin extends Component {
    @property(EditBox)
    usernameEdit: EditBox = null;
    
    @property(EditBox)
    passwordEdit: EditBox = null;
    
    @property(Button)
    loginBtn: Button = null;
    
    @property(Label)
    statusLabel: Label = null;
    
    private _isLoggingIn: boolean = false;
    
    start() {
        console.log('UILogin start');
        
        // 绑定登录按钮点击
        if (this.loginBtn) {
            this.loginBtn.node.on('click', this.onLoginClicked, this);
        }
        
        // 隐藏状态文本
        if (this.statusLabel) {
            this.statusLabel.node.active = false;
        }
    }
    
    showStatus(msg: string, isError: boolean = false) {
        if (this.statusLabel) {
            this.statusLabel.string = msg;
            this.statusLabel.node.active = true;
            this.statusLabel.color = isError ? new Color(255, 80, 80) : new Color(80, 255, 80);
        }
    }
    
    hideStatus() {
        if (this.statusLabel) {
            this.statusLabel.node.active = false;
        }
    }
    
    setLoginButtonEnabled(enabled: boolean) {
        if (this.loginBtn) {
            this.loginBtn.interactable = enabled;
        }
    }
    
    onLoginClicked() {
        if (this._isLoggingIn) return;
        
        const username = this.usernameEdit.string.trim();
        const password = this.passwordEdit.string;
        
        console.log('登录:', username);
        
        if (!username || !password) {
            this.showStatus('请输入用户名和密码', true);
            return;
        }
        
        this.doLogin(username, password);
    }
    
    async doLogin(username: string, password: string) {
        const gm = GameManager.instance;
        if (!gm) {
            this.showStatus('游戏管理器未初始化', true);
            return;
        }
        
        this._isLoggingIn = true;
        this.setLoginButtonEnabled(false);
        this.showStatus('登录中...');
        
        // 调用登录API
        const result = await gm.networkManager.login(username, password);
        console.log('登录结果:', result);
        
        this._isLoggingIn = false;
        this.setLoginButtonEnabled(true);
        
        if (result && result.code === 200 && result.data && result.data.token) {
            // 保存token
            gm.networkManager.saveToken(result.data.token, result.data.userId);
            gm.setLoggedIn(true);
            console.log('登录成功，跳转游戏场景');
            
            // 每日重置检查
            gm.networkManager.dailyReset();
            
            // 隐藏登录界面
            if (this.node) {
                this.node.active = false;
            }
            
            // 加载游戏场景
            director.loadScene('Game', (err: any) => {
                if (err) {
                    console.error('场景加载失败:', err);
                }
            });
        } else {
            this.showStatus(result?.message || '登录失败，请检查用户名和密码', true);
        }
    }
}
