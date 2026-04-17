import { _decorator, Component, Node, game } from 'cc';

const { ccclass, property } = _decorator;

// 游戏数据默认配置
const GAME_DATA_DEFAULTS = {
    // 基础数据
    level: 1,
    exp: 0,
    gold: 500,
    yuanbao: 0,
    merit: 0,
    faith: 0,
    reputation: 0,
    mana: 100,
    
    // 庙宇
    templeLevel: 1,
    templeOutput: 100,
    templeStorage: 0,
    
    // 每日
    dailyAlms: 20,
    dailySign: 0,
    lastLoginDate: null,
    
    // 化缘
    almsCount: 0,
    greatCount: 0,
    worshipCount: 0,
    beAlmsCount: 0,
    
    // 财神
    deityBuff: null,  // JSON string
    unlockedGods: ['tudigong'],
    
    // 其他
    playerName: null,
    playerId: null,
    tutorialCompleted: false,
    todayLogin: false,
    signStreak: 0,
    
    // 守护状态
    shieldActive: false,
    shieldEndTime: 0,
    
    // 当前香火
    currentIncense: null,
};

@ccclass('DataManager')
export class DataManager extends Component {
    private static _instance: DataManager = null;
    private _data: any = {};
    private _apiBase: string = 'http://localhost:3000/api';
    
    static getInstance(): DataManager {
        if (!DataManager._instance) {
            // 创建一个隐藏的节点来挂载DataManager
            const node = new Node('DataManager');
            DataManager._instance = node.addComponent(DataManager);
            game.addPersistRootNode(node);
        }
        return DataManager._instance;
    }
    
    onLoad() {
        this.load();
    }
    
    load() {
        // 从localStorage加载
        const saved = localStorage.getItem('caishen_cocos_data');
        if (saved) {
            try {
                this._data = JSON.parse(saved);
            } catch(e) {
                console.error('Failed to load data', e);
                this._data = { ...GAME_DATA_DEFAULTS };
            }
        } else {
            this._data = { ...GAME_DATA_DEFAULTS };
        }
        console.log('Data loaded:', this._data);
    }
    
    save() {
        localStorage.setItem('caishen_cocos_data', JSON.stringify(this._data));
        console.log('Data saved');
    }
    
    getPlayerData() {
        return this._data;
    }
    
    updatePlayerData(data: any) {
        Object.keys(data).forEach(key => {
            if (this._data.hasOwnProperty(key)) {
                this._data[key] = data[key];
            }
        });
    }
    
    set(key: string, value: any) {
        this._data[key] = value;
    }
    
    get(key: string): any {
        return this._data[key];
    }
    
    getGold(): number {
        return this._data.gold || 0;
    }
    
    setGold(value: number) {
        this._data.gold = value;
    }
    
    getLevel(): number {
        return this._data.level || 1;
    }
    
    getMana(): number {
        return this._data.mana || 0;
    }
    
    setMana(value: number) {
        this._data.mana = Math.max(0, Math.min(100, value));
    }
    
    getTempleLevel(): number {
        return this._data.templeLevel || 1;
    }
    
    getTempleOutput(): number {
        return this._data.templeOutput || 100;
    }
    
    getDeityBuff(): any[] {
        if (!this._data.deityBuff) return [];
        try {
            return JSON.parse(this._data.deityBuff);
        } catch(e) {
            return [];
        }
    }
    
    setDeityBuff(buffs: any[]) {
        this._data.deityBuff = JSON.stringify(buffs);
    }
    
    resetDaily() {
        this._data.dailyAlms = 20;
        this._data.dailySign = 0;
        this._data.lastLoginDate = new Date().toISOString().split('T')[0];
    }
    
    checkDailyReset() {
        const today = new Date().toISOString().split('T')[0];
        if (this._data.lastLoginDate !== today) {
            this.resetDaily();
            return true;
        }
        return false;
    }
    
    // ==================== 设置管理 ====================
    
    getSettings(): any {
        if (!this._data.settings) {
            this._data.settings = {
                bgm: true,
                sfx: true,
                notify_login: true,
                notify_event: true
            };
        }
        return this._data.settings;
    }
    
    saveSettings(settings: any) {
        this._data.settings = settings;
        this.save();
    }
    
    clearCache() {
        // 清除本地缓存但保留玩家数据
        const playerData = {
            playerId: this._data.playerId,
            playerName: this._data.playerName
        };
        localStorage.removeItem('caishen_cocos_data');
        this._data = { ...GAME_DATA_DEFAULTS, ...playerData };
        this.save();
    }
}
