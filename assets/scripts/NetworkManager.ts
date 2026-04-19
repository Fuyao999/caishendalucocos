import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('NetworkManager')
export class NetworkManager extends Component {
    private static _instance: NetworkManager = null;
    
    private _baseUrl: string = 'http://localhost:3000/api';
    private _token: string = '';
    private _userId: number = 0;
    
    // 玩家数据（共享）
    public playerData: any = null;

    // 法力恢复速度（从服务端获取，默认10点/小时）
    public manaRegenPerHour: number = 10;
    
    onLoad() {
        if (NetworkManager._instance === null) {
            NetworkManager._instance = this;
            this.loadToken();
        }
    }
    
    static getInstance(): NetworkManager {
        return NetworkManager._instance;
    }
    
    loadToken() {
        this._token = localStorage.getItem('caishen_token') || '';
        const userId = localStorage.getItem('caishen_userId');
        this._userId = userId ? parseInt(userId) : 0;
    }
    
    saveToken(token: string, userId: number) {
        this._token = token;
        this._userId = userId;
        localStorage.setItem('caishen_token', token);
        localStorage.setItem('caishen_userId', String(userId));
    }
    
    clearToken() {
        this._token = '';
        this._userId = 0;
        localStorage.removeItem('caishen_token');
        localStorage.removeItem('caishen_userId');
    }
    
    getToken(): string {
        return this._token;
    }
    
    getUserId(): number {
        return this._userId;
    }
    
    isLoggedIn(): boolean {
        return this._token !== '';
    }
    
    async request(endpoint: string, options: any = {}): Promise<any> {
        const url = `${this._baseUrl}${endpoint}`;
        const headers: any = {
            'Content-Type': 'application/json'
        };
        
        if (this._token) {
            headers['Authorization'] = `Bearer ${this._token}`;
        }
        
        console.log('请求:', options.method || 'GET', url);
        
        try {
            console.log('请求完整选项:', JSON.stringify(options));
            const response = await fetch(url, {
                ...options,
                headers: { ...headers, ...options.headers }
            });
            
            console.log('响应状态:', response.status);
            const responseText = await response.text();
            console.log('响应内容:', responseText);
            
            if (!response.ok) {
                // 尝试解析错误响应JSON
                try {
                    const errData = JSON.parse(responseText);
                    return { code: response.status, message: errData.message || `请求失败(${response.status})`, data: errData };
                } catch(e2) {
                    throw new Error(`HTTP ${response.status}: ` + responseText);
                }
            }
            
            const data = JSON.parse(responseText);
            console.log('响应数据:', data);
            return data;
        } catch(e) {
            console.error('网络错误:', e);
            return { code: -1, message: '网络错误: ' + e.message };
        }
    }
    
    async login(username: string, password: string): Promise<any> {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }
    
    async register(username: string, password: string, nickname: string): Promise<any> {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, nickname })
        });
    }
    
    logout() {
        this.clearToken();
    }
    
    async getPlayerData(): Promise<any> {
        return this.request('/player/data');
    }
    
    async syncData(playerData: any): Promise<any> {
        return this.request('/player/sync-data', {
            method: 'POST',
            body: JSON.stringify(playerData)
        });
    }
    
    async dailyReset(): Promise<any> {
        return this.request('/player/daily-reset', {
            method: 'POST'
        });
    }
    
    async clearShield(): Promise<any> {
        return this.request('/player/clear-shield', {
            method: 'POST'
        });
    }
    
    async getLeaderboard(type: string = 'gold'): Promise<any> {
        return this.request(`/player/leaderboard?type=${type}`);
    }
    
    async worship(godId: string, type: string): Promise<any> {
        return this.request('/alms/worship', {
            method: 'POST',
            body: JSON.stringify({ godId, type })
        });
    }
    
    async alms(): Promise<any> {
        return this.request('/alms/go', {
            method: 'POST'
        });
    }
    
    async signIn(): Promise<any> {
        return this.request('/player/sign-in', {
            method: 'POST'
        });
    }
    
    async getTempleData(): Promise<any> {
        return this.request('/player/temple-data', { method: 'GET' });
    }

    async collectTempleStorage(): Promise<any> {
        return this.request('/player/collect-temple', {
            method: 'POST'
        });
    }
    
    async upgradeTemple(): Promise<any> {
        return this.request('/player/upgrade-temple', { method: 'POST' });
    }
    
    async openHeavenDoor(): Promise<any> {
        return this.request('/player/open-heaven-door', { method: 'POST' });
    }
    
    async composeBanner(): Promise<any> {
        return this.request('/player/compose-banner', { method: 'POST' });
    }
    
    async incenseFriend(): Promise<any> {
        return this.request('/player/incense-friend', { method: 'POST' });
    }
    
    async renewIncense(incenseType: string, incenseEndAt: number): Promise<any> {
        return this.request('/player/update-incense', {
            method: 'POST',
            body: JSON.stringify({
                incense_type: incenseType,
                incense_end_at: incenseEndAt
            })
        });
    }
    
    async getRankList(): Promise<any> {
        return this.request('/player/rank-list');
    }
    
    async getAnnouncements(): Promise<any> {
        return this.request('/announcements/');
    }
}
