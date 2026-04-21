import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

// 庙宇等级数据
const TEMPLE_DATA: { [level: number]: { output: number, storage: number, repair: number, stage: string } } = {
    1: { output: 2400, storage: 5000, repair: 10, stage: '泥胎' },
    2: { output: 4320, storage: 10000, repair: 20, stage: '泥胎' },
    3: { output: 6000, storage: 18000, repair: 30, stage: '木骨' },
    4: { output: 8000, storage: 30000, repair: 40, stage: '铜身' },
    5: { output: 10000, storage: 50000, repair: 50, stage: '金身' },
    6: { output: 20000, storage: 100000, repair: 100, stage: '金身·开天门' }
};

// 9位财神
const GODS = [
    { id: 'tudigong', name: '土地公', title: '福德正神', effect: '香火钱+10%', type: 'money', bonus: 0.10, unlocked: true, icon: '🏠', unlockDesc: '初始解锁' },
    { id: 'guanyu', name: '关羽', title: '武财神', effect: '化缘收益+15%', type: 'alms', bonus: 0.15, unlocked: false, unlockLevel: 3, icon: '⚔️', unlockDesc: '庙宇升到3级' },
    { id: 'yaoshaosi', name: '姚少司', title: '北路利市仙官', effect: '暴击率+5%', type: 'crit', bonus: 0.05, unlocked: false, unlockAlms: 30, icon: '🎯', unlockDesc: '化缘30次' },
    { id: 'chenjiugong', name: '陈九公', title: '东路招财使者', effect: '香火钱上限+500', type: 'cap', bonus: 500, unlocked: false, unlockMoney: 5000, icon: '💰', unlockDesc: '累计5000香火钱' },
    { id: 'fanli', name: '范蠡', title: '东南财神', effect: '碎片获取+20%', type: 'fragment', bonus: 0.20, unlocked: false, unlockMerit: 100, icon: '🔮', unlockDesc: '功德值≥100' },
    { id: 'caobao', name: '曹宝', title: '南路招宝天尊', effect: '化缘风险-10%', type: 'risk', bonus: -0.10, unlocked: false, icon: '🛡️', unlockDesc: '大吉3次+供奉100次+功德500' },
    { id: 'liuhai', name: '刘海', title: '偏财神', effect: '每日首供双倍', type: 'daily', bonus: 0, unlocked: false, icon: '🐸', unlockDesc: '完成1次大吉化缘' },
    { id: 'xiaosheng', name: '萧升', title: '西路纳珍天尊', effect: '供奉功德+10%', type: 'merit', bonus: 0.10, unlocked: false, icon: '📿', unlockDesc: '供奉50次' },
    { id: 'zhaogongming', name: '赵公明', title: '正财神', effect: '香火钱+25%', type: 'money', bonus: 0.25, unlocked: false, icon: '👑', unlockDesc: '8位全齐+50万香火钱' }
];

// 供奉材料
const MATERIALS = [
    { id: 'incense', name: '线香', cost: 1, duration: 1, icon: '📿' },
    { id: 'candle', name: '红烛', cost: 1, duration: 3, icon: '🕯️' },
    { id: 'paper', name: '金纸', cost: 1, duration: 5, icon: '💰' },
    { id: 'fruit', name: '供果', cost: 1, duration: 10, icon: '🍎' }
];

@ccclass('UITemple')
export class UITemple extends Component {

    // ===== 庙宇相关节点 =====
    @property(Node)
    templePanel: Node = null;

    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Label)
    outputLabel: Label = null;  // 24h产出/上限/修缮信息

    @property(Label)
    incenseStatusLabel: Label = null;  // 香火状态(燃烧中/已熄灭)

    @property(Label)
    incenseTimeLabel: Label = null;  // 香火剩余时间

    // 材料库存显示
    @property(Label)
    incenseStockLabel: Label = null;   // 线香库存

    @property(Label)
    candleStockLabel: Label = null;    // 红烛库存

    @property(Label)
    paperStockLabel: Label = null;     // 金纸库存

    @property(Label)
    fruitStockLabel: Label = null;     // 供果库存

    @property(Label)
    storageValueLabel: Label = null;

    @property(Button)
    collectBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    // ===== 供奉相关节点(从WorshipPanel移过来的) =====
    @property(Label)
    godNameLabel: Label = null;

    @property(Label)
    effectLabel: Label = null;

    @property(Button)
    leftGodBtn: Button = null;

    @property(Button)
    rightGodBtn: Button = null;

    @property(Button)
    matIncenseBtn: Button = null;

    @property(Button)
    matCandleBtn: Button = null;

    @property(Button)
    matPaperBtn: Button = null;

    @property(Button)
    matFruitBtn: Button = null;

    @property(Button)
    doWorshipBtn: Button = null;

    @property(Label)
    resultLabel: Label = null;

    // ===== 新增按钮 =====
    @property(Button)
    upgradeBtn: Button = null;  // 升级按钮

    @property(Button)
    composeBtn: Button = null;   // 合成按钮(碎片→招财幡)

    @property(Button)
    incenseFriendBtn: Button = null;  // 代点香按钮

    @property(Label)
    modeToggleLabel: Label = null;  // 模式切换标签（续香/供奉）

    // ===== 升级确认弹窗 =====
    @property(Node)
    upgradeConfirmPanel: Node = null;  // 升级确认弹窗

    @property(Label)
    materialInfoLabel: Label = null;  // 材料对比显示

    @property(Label)
    rewardInfoLabel: Label = null;  // 升级后收益显示

    @property(Button)
    cancelUpgradeBtn: Button = null;  // 取消升级按钮

    @property(Button)
    confirmUpgradeBtn: Button = null;  // 确认升级按钮

    // 当前升级信息（用于确认时使用）
    private _pendingUpgrade: { level: number, need: any } | null = null;

    // 当前选择的财神和材料
    private _selectedGodIndex: number = 0;
    private _selectedMatIndex: number = 0;

    // 模式切换:true=续香模式, false=供奉模式
    private _isIncenseMode: boolean = true;

    // 财神庇佑顺序(拖动排序用)
    private _godOrder: string[] = [];
    private _orderPanel: Node = null;  // 排序面板

    start() {
        console.log('UITemple start');
        this.bindButtonEvents();
        this.hide();
        console.log('UITemple 初始化完成');
    }

    // 绑定按钮事件
    bindButtonEvents() {
        console.log('绑定庙宇面板按钮事件...');

        // 庙宇按钮
        if (this.collectBtn) {
            this.collectBtn.node.on('click', this.onCollectClicked, this);
        }
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        if (this.upgradeBtn) {
            this.upgradeBtn.node.on('click', this.onUpgradeClicked, this);
        }
        if (this.composeBtn) {
            this.composeBtn.node.on('click', this.onComposeClicked, this);
        }
        if (this.incenseFriendBtn) {
            this.incenseFriendBtn.node.on('click', this.onIncenseFriendClicked, this);
        }
        if (this.cancelUpgradeBtn) {
            this.cancelUpgradeBtn.node.on('click', this.onCancelUpgrade, this);
        }
        if (this.confirmUpgradeBtn) {
            this.confirmUpgradeBtn.node.on('click', this.onConfirmUpgrade, this);
        }
        if (this.modeToggleLabel && this.modeToggleLabel.node) {
            this.modeToggleLabel.node.on(Node.EventType.TOUCH_END, this.toggleMode, this);
        }

        // 供奉按钮
        if (this.leftGodBtn) {
            this.leftGodBtn.node.on('click', this.prevGod, this);
        }
        if (this.rightGodBtn) {
            this.rightGodBtn.node.on('click', this.nextGod, this);
        }
        if (this.matIncenseBtn) {
            this.matIncenseBtn.node.on('click', () => this.onMatBtnClicked(0), this);
        }
        if (this.matCandleBtn) {
            this.matCandleBtn.node.on('click', () => this.onMatBtnClicked(1), this);
        }
        if (this.matPaperBtn) {
            this.matPaperBtn.node.on('click', () => this.onMatBtnClicked(2), this);
        }
        if (this.matFruitBtn) {
            this.matFruitBtn.node.on('click', () => this.onMatBtnClicked(3), this);
        }
        if (this.doWorshipBtn) {
            this.doWorshipBtn.node.on('click', this.doWorship, this);
        }

    }

    // ===== 庙宇相关 =====

    updateDisplay(playerData: any) {
        // 直接从GameManager获取最新数据,确保显示最新状态
        const gm = GameManager.instance;
        const latestData = gm?.networkManager?.playerData || playerData;
        if (!latestData) return;

        const level = latestData.level || 1;
        const templeStorage = latestData.temple_storage || 0;
        const temple = TEMPLE_DATA[level] || TEMPLE_DATA[1];

        if (this.levelLabel) {
            this.levelLabel.string = `🏛️ ${temple.stage} Lv.${level}`;
        }

        if (this.outputLabel) {
            this.outputLabel.string = `24h产出 ${temple.output} | 上限 ${temple.storage} | 修缮 -${temple.repair}/h`;
        }

        if (this.storageValueLabel) {
            this.storageValueLabel.string = (Number(templeStorage) || 0).toLocaleString();
        }

        // 香火状态显示(根据incense_type和incense_end_at判断)
        const now = Date.now();
        const incenseEndAt = Number(latestData.incense_end_at) || 0;
        const isBurning = latestData.incense_type && incenseEndAt && incenseEndAt > now;
        const remainingMs = incenseEndAt - now;
        const remainingHours = Math.max(0, Math.ceil(remainingMs / 3600000));

        if (this.incenseStatusLabel) {
            this.incenseStatusLabel.string = isBurning ? '香火状态: 燃烧中🔥' : '香火状态: 已熄灭';
        }

        if (this.incenseTimeLabel) {
            if (isBurning && remainingHours > 0) {
                this.incenseTimeLabel.string = `剩余: ${remainingHours}小时`;
            } else {
                this.incenseTimeLabel.string = '无香火则不产出';
            }
        }

        // 材料库存显示(后端字段名:incense_sticks, candles, gold_paper, fruits)
        const incense = latestData.incense_sticks || 0;
        const candle = latestData.candles || 0;
        const paper = latestData.gold_paper || 0;
        const fruit = latestData.fruits || 0;

        if (this.incenseStockLabel) {
            this.incenseStockLabel.string = `📿线香: ${incense}`;
        }
        if (this.candleStockLabel) {
            this.candleStockLabel.string = `🕯️红烛: ${candle}`;
        }
        if (this.paperStockLabel) {
            this.paperStockLabel.string = `💰金纸: ${paper}`;
        }
        if (this.fruitStockLabel) {
            this.fruitStockLabel.string = `🍎供果: ${fruit}`;
        }
    }

    onCollectClicked() {
        console.log('点击收取按钮');

        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 NetworkManager 为空');
            return;
        }

        const playerData = gm.networkManager.playerData;
        if (!playerData) {
            console.error('playerData 为空');
            return;
        }

        const templeStorage = playerData.temple_storage || 0;
        if (templeStorage <= 0) {
            console.log('庙宇存储为0,无需收取');
            if (this.storageValueLabel) {
                this.storageValueLabel.string = '0';
            }
            return;
        }

        gm.networkManager.collectTempleStorage().then((result: any) => {
            console.log('收取结果:', result);
            if (result.code === 200) {
                if (this.storageValueLabel) {
                    this.storageValueLabel.string = '0';
                }
                if (result.data && result.data.money !== undefined) {
                    playerData.gold = Number(result.data.money) || 0;
                    playerData.temple_storage = 0;
                }
                this.updateDisplay();
                // 更新主界面钱兜兜显示
                if (gm.uiGame) {
                    gm.uiGame.updateMoney?.();
                }
            } else {
                if (this.resultLabel) this.resultLabel.string = '❌ ' + (result.message || '收取失败');
            }
        }).catch((err: any) => {
            console.error('收取失败:', err);
        });
    }

    // 庙宇等级数据（用于显示升级后收益）
    private TEMPLE_DATA: any = {
        1: { output: 2400, storage: 5000 },
        2: { output: 4320, storage: 10000 },
        3: { output: 6000, storage: 18000 },
        4: { output: 8000, storage: 30000 },
        5: { output: 10000, storage: 50000 },
        6: { output: 20000, storage: 100000 }
    };

    // 升级配置
    private upgradeNeeds: any = {
        1: { money: 5000, banners: 3, merit: 100 },
        2: { money: 15000, banners: 6, merit: 500 },
        3: { money: 50000, banners: 10, merit: 1500 },
        4: { money: 150000, banners: 15, merit: 3300 }
    };

    onUpgradeClicked() {
        console.log('点击升级按钮');
        const gm = GameManager.instance;
        const p = gm.networkManager.playerData;

        const currentLevel = p.level || 1;
        
        // 5级：开天门
        if (currentLevel === 5) {
            this.showHeavenDoorPanel();
            return;
        }
        
        // 6级及以上：已进入第二阶段
        if (currentLevel > 5) {
            if (this.resultLabel) this.resultLabel.string = '🌟 已进入第二阶段（九重天）';
            return;
        }

        // 1-4级：普通升级
        const need = this.upgradeNeeds[currentLevel];
        if (!need) return;

        const hasMoney = (p.gold || 0) >= need.money;
        const hasBanners = (p.banners || 0) >= need.banners;
        const hasMerit = (p.merit || 0) >= need.merit;

        // 保存升级信息
        this._pendingUpgrade = { level: currentLevel, need };

        // 显示材料对比
        const moneyStatus = hasMoney ? '✅' : '❌';
        const bannersStatus = hasBanners ? '✅' : '❌';
        const meritStatus = hasMerit ? '✅' : '❌';
        const materialText = `香火钱: ${need.money.toLocaleString()} / ${(p.gold || 0).toLocaleString()} ${moneyStatus}\n招财幡: ${need.banners} / ${p.banners || 0} ${bannersStatus}\n功德: ${need.merit.toLocaleString()} / ${p.merit || 0} ${meritStatus}`;

        // 显示升级后收益
        const currentData = this.TEMPLE_DATA[currentLevel] || { output: 0, storage: 0 };
        const nextData = this.TEMPLE_DATA[currentLevel + 1] || { output: 0, storage: 0 };
        const rewardText = `──── 升级后收益 ────\n每日产出: ${currentData.output.toLocaleString()} → ${nextData.output.toLocaleString()}\n存储上限: ${currentData.storage.toLocaleString()} → ${nextData.storage.toLocaleString()}`;

        // 更新弹窗显示
        if (this.materialInfoLabel) this.materialInfoLabel.string = materialText;
        if (this.rewardInfoLabel) this.rewardInfoLabel.string = rewardText;

        // 显示弹窗
        if (this.upgradeConfirmPanel) {
            this.upgradeConfirmPanel.active = true;
        }
    }

    // 显示开天门面板
    showHeavenDoorPanel() {
        const gm = GameManager.instance;
        const p = gm.networkManager.playerData;
        
        // 检查9位财神是否全齐
        const godIds = ['tudigong', 'guanyu', 'yaoshaosi', 'chenjiugong', 'fanli', 'caobao', 'liuhai', 'xiaosheng'];
        let unlockedCount = 0;
        godIds.forEach(id => {
            if (this.checkGodUnlocked(id, p)) unlockedCount++;
        });
        // 赵公明也算解锁（因为其他8位齐了他就解锁了）
        const zhaoUnlocked = this.checkGodUnlocked('zhaogongming', p);
        const allGodsUnlocked = unlockedCount === 8;
        
        const hasMoney = (p.gold || 0) >= 500000;
        const godsStatus = allGodsUnlocked ? '✅' : '❌';
        const moneyStatus = hasMoney ? '✅' : '❌';
        
        const materialText = `9位财神: ${unlockedCount}/8 ${godsStatus}\n香火钱: 500,000 / ${(p.gold || 0).toLocaleString()} ${moneyStatus}`;
        const rewardText = `──── 开天门效果 ────\n🌟 赵公明降临\n🌟 自动升到6级\n🌟 进入第二阶段（九重天）`;

        if (this.materialInfoLabel) this.materialInfoLabel.string = materialText;
        if (this.rewardInfoLabel) this.rewardInfoLabel.string = rewardText;

        // 保存开天门信息
        this._pendingUpgrade = { level: 5, isHeavenDoor: true };

        if (this.upgradeConfirmPanel) {
            this.upgradeConfirmPanel.active = true;
        }
    }

    // 开天门点击
    onOpenHeavenDoorClicked() {
        console.log('点击开天门按钮');
        this.showHeavenDoorPanel();
    }

    // 取消升级
    onCancelUpgrade() {
        if (this.upgradeConfirmPanel) {
            this.upgradeConfirmPanel.active = false;
        }
        this._pendingUpgrade = null;
    }

    // 确认升级
    onConfirmUpgrade() {
        if (!this._pendingUpgrade) return;

        const gm = GameManager.instance;
        const isHeavenDoor = this._pendingUpgrade.isHeavenDoor;

        // 关闭弹窗
        if (this.upgradeConfirmPanel) {
            this.upgradeConfirmPanel.active = false;
        }

        // 执行开天门或普通升级
        const apiCall = isHeavenDoor 
            ? gm.networkManager.openHeavenDoor()
            : gm.networkManager.upgradeTemple();

        apiCall.then((result: any) => {
            if (result.code === 200 || result.code === 0) {
                const d = result.data;
                if (d.newGold !== undefined) gm.networkManager.playerData.gold = Number(d.newGold) || 0;
                if (d.newBanners !== undefined) gm.networkManager.playerData.banners = Number(d.newBanners) || 0;
                if (d.newMerit !== undefined) gm.networkManager.playerData.merit = d.newMerit;
                if (d.newLevel !== undefined) gm.networkManager.playerData.level = d.newLevel;
                
                const successMsg = isHeavenDoor 
                    ? '🎉 开天门成功！赵公明降临！进入第二阶段！'
                    : '🎉 ' + (result.message || '升级成功！');
                if (this.resultLabel) this.resultLabel.string = successMsg;
                this.updateDisplay();
                if (gm.uiGame) {
                    gm.uiGame.updateMoney?.();
                    gm.uiGame.updateLevel?.();
                }
                // 3秒后清除结果文字
                setTimeout(() => {
                    if (this.resultLabel && (this.resultLabel.string.includes('升级成功') || this.resultLabel.string.includes('开天门成功'))) {
                        this.resultLabel.string = '';
                    }
                }, 3000);
            } else {
                let errMsg = result.message || '升级失败';
                if (typeof errMsg === 'string' && errMsg.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(errMsg);
                        errMsg = parsed.message || parsed.msg || errMsg;
                    } catch(e) {}
                }
                if (this.resultLabel) this.resultLabel.string = '❌ ' + errMsg;
                // 3秒后清除错误文字
                setTimeout(() => {
                    if (this.resultLabel && this.resultLabel.string.includes('❌')) {
                        this.resultLabel.string = '';
                    }
                }, 3000);
            }
            this._pendingUpgrade = null;
        }).catch((err: any) => {
            console.error('升级失败:', err);
            if (this.resultLabel) this.resultLabel.string = '❌ 升级失败';
            setTimeout(() => {
                if (this.resultLabel && this.resultLabel.string.includes('升级失败')) {
                    this.resultLabel.string = '';
                }
            }, 3000);
            this._pendingUpgrade = null;
        });
    }

    onComposeClicked() {
        console.log('点击合成按钮');
        const gm = GameManager.instance;
        gm.networkManager.composeBanner().then((result: any) => {
            if (result.code === 200) {
                const d = result.data;
                if (d.newFragments !== undefined) gm.networkManager.playerData.fragments = d.newFragments;
                if (d.newBanners !== undefined) gm.networkManager.playerData.banners = d.newBanners;
                if (this.resultLabel) this.resultLabel.string = result.message || '合成成功!';
                this.updateDisplay();
            } else {
                if (this.resultLabel) this.resultLabel.string = '❌ ' + (result.message || '合成失败');
            }
        }).catch((err: any) => {
            console.error('合成失败:', err);
            if (this.resultLabel) this.resultLabel.string = '❌ 合成失败';
        });
    }

    onIncenseFriendClicked() {
        console.log('点击代点香按钮');
        const gm = GameManager.instance;
        gm.networkManager.incenseFriend().then((result: any) => {
            if (result.code === 200) {
                const d = result.data;
                if (d.newGold !== undefined) gm.networkManager.playerData.gold = Number(d.newGold) || 0;
                if (this.resultLabel) this.resultLabel.string = result.message || '代点香成功!';
                this.updateDisplay();
                // 更新主界面钱兜兜显示
                if (gm.uiGame) {
                    gm.uiGame.updateMoney?.();
                }
            } else {
                if (this.resultLabel) this.resultLabel.string = '❌ ' + (result.message || '代点香失败');
            }
        }).catch((err: any) => {
            console.error('代点香失败:', err);
            if (this.resultLabel) this.resultLabel.string = '❌ 代点香失败';
        });
    }

    // 模式切换:续香 <-> 供奉
    toggleMode() {
        this._isIncenseMode = !this._isIncenseMode;
        this.updateModeDisplay();
        this.updateButtonDisplay();
    }

    // 更新模式标签显示
    updateModeDisplay() {
        if (this.modeToggleLabel) {
            this.modeToggleLabel.string = this._isIncenseMode ? '续香模式' : '供奉模式';
        }
    }

    // 材料按钮点击处理(根据模式决定是续香还是供奉)
    onMatBtnClicked(index: number) {
        console.log('点击材料按钮, index:', index, '模式:', this._isIncenseMode ? '续香' : '供奉');

        if (this._isIncenseMode) {
            // 续香模式
            const types = ['incense', 'candle', 'paper', 'fruit'];
            this.renewIncense(types[index]);
        } else {
            // 供奉模式
            this.selectMat(index);
        }
    }

    // 更新4个材料按钮的显示
    updateButtonDisplay() {
        const matNames = [
            this._isIncenseMode ? '线香+2h' : '线香1庇佑',
            this._isIncenseMode ? '红烛+4h' : '红烛3庇佑',
            this._isIncenseMode ? '金纸+6h' : '金纸5庇佑',
            this._isIncenseMode ? '供果+8h' : '供果10庇佑'
        ];

        const btns = [this.matIncenseBtn, this.matCandleBtn, this.matPaperBtn, this.matFruitBtn];
        btns.forEach((btn, i) => {
            if (btn && btn.node) {
                const label = btn.node.getChildByName('Label');
                if (label) {
                    const lbl = label.getComponent(Label);
                    if (lbl) {
                        lbl.string = matNames[i];
                        lbl.fontSize = 20;
                    }
                }
            }
        });
    }

    // 代点香 - 用指定材料续香
    // incenseType: 'incense'(线香+2h), 'candle'(红烛+4h), 'paper'(金纸+6h), 'fruit'(供果+8h)
    renewIncense(incenseType: string) {
        console.log('续香类型:', incenseType);

        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 NetworkManager 为空');
            return;
        }

        const playerData = gm.networkManager.playerData;
        if (!playerData) {
            console.error('playerData 为空');
            return;
        }

        // 检查材料库存
        const burnTimes: any = {
            'incense': 2 * 60 * 60 * 1000,   // 线香 2小时
            'candle': 4 * 60 * 60 * 1000,     // 红烛 4小时
            'paper': 6 * 60 * 60 * 1000,      // 金纸 6小时
            'fruit': 8 * 60 * 60 * 1000       // 供果 8小时
        };

        const matNames: any = {
            'incense': '线香',
            'candle': '红烛',
            'paper': '金纸',
            'fruit': '供果'
        };

        // 检查库存
        const stockMap: any = {
            'incense': playerData.incense_sticks || 0,
            'candle': playerData.candles || 0,
            'paper': playerData.gold_paper || 0,
            'fruit': playerData.fruits || 0
        };

        if (stockMap[incenseType] <= 0) {
            if (this.resultLabel) {
                this.resultLabel.string = '❌ ' + matNames[incenseType] + '库存不足';
            }
            return;
        }

        // 计算新的结束时间
        const now = Date.now();
        const addTime = burnTimes[incenseType];
        const currentEndTime = Number(playerData.incense_end_at) || now;
        let newEndTime = currentEndTime > now ? currentEndTime + addTime : now + addTime;

        if (this.resultLabel) {
            this.resultLabel.string = '🔥 ' + matNames[incenseType] + '燃烧中...';
        }

        // 调用后端API
        gm.networkManager.renewIncense(incenseType, newEndTime).then((result: any) => {
            console.log('续香结果:', result);
            if (result.code === 200) {
                playerData.incense_type = incenseType;
                playerData.incense_end_at = newEndTime;
                playerData.incense_sticks = (playerData.incense_sticks || 0) - (incenseType === 'incense' ? 1 : 0);
                playerData.candles = (playerData.candles || 0) - (incenseType === 'candle' ? 1 : 0);
                playerData.gold_paper = (playerData.gold_paper || 0) - (incenseType === 'paper' ? 1 : 0);
                playerData.fruits = (playerData.fruits || 0) - (incenseType === 'fruit' ? 1 : 0);

                if (this.resultLabel) {
                    this.resultLabel.string = '🔥 ' + matNames[incenseType] + '续香成功!+' + (addTime / 3600000) + '小时';
                }
                // 刷新显示
                this.updateDisplay(playerData);
            } else {
                if (this.resultLabel) {
                    this.resultLabel.string = '❌ 续香失败: ' + (result.message || '未知错误');
                }
            }
        }).catch((err: any) => {
            console.error('续香失败:', err);
            if (this.resultLabel) {
                this.resultLabel.string = '❌ 续香失败: ' + err;
            }
        });
    }

    // ===== 供奉相关 =====

    prevGod() {
        console.log('点击左箭头切换财神');
        this._selectedGodIndex--;
        if (this._selectedGodIndex < 0) {
            this._selectedGodIndex = GODS.length - 1;
        }
        this.updateWorshipDisplay();
    }

    nextGod() {
        console.log('点击右箭头切换财神');
        this._selectedGodIndex++;
        if (this._selectedGodIndex >= GODS.length) {
            this._selectedGodIndex = 0;
        }
        this.updateWorshipDisplay();
    }

    selectMat(index: number) {
        console.log('选择材料:', index);
        this._selectedMatIndex = index;
        this.updateWorshipDisplay();
    }

    // 检查财神是否解锁
    checkGodUnlocked(godId: string, playerData: any): boolean {
        // 土地公默认解锁
        if (godId === 'tudigong') return true;

        const p = playerData || {};
        switch (godId) {
            case 'guanyu':  // 关羽: 3级
                return (p.level || 1) >= 3;
            case 'yaoshaosi':  // 姚少司: 化缘30次
                return (p.alms_count || 0) >= 30;
            case 'chenjiugong':  // 陈九公: 累计5000钱
                return (p.gold || 0) >= 5000;
            case 'fanli':  // 范蠡: 功德100
                return (p.merit || 0) >= 100;
            case 'caobao':  // 曹宝: 3次大吉+100次供奉+500功德
                return (p.great_count || 0) >= 3
                    && (p.worship_count || 0) >= 100
                    && (p.merit || 0) >= 500;
            case 'liuhai':  // 刘海: 1次大吉
                return (p.great_count || 0) >= 1;
            case 'xiaosheng':  // 萧升: 供奉50次
                return (p.worship_count || 0) >= 50;
            case 'zhaogongming':  // 赵公明: 需解锁其他8位+50万香火钱
                const otherGodsUnlocked = ['tudigong', 'guanyu', 'yaoshaosi', 'chenjiugong', 'fanli', 'caobao', 'liuhai', 'xiaosheng']
                    .every(id => this.checkGodUnlocked(id, p));
                return otherGodsUnlocked && (p.gold || 0) >= 500000;
            default:
                return false;
        }
    }

    updateWorshipDisplay() {
        const gm = GameManager.instance;
        const playerData = gm?.networkManager?.playerData;
        const god = GODS[this._selectedGodIndex];
        const mat = MATERIALS[this._selectedMatIndex];

        // 检查并更新财神解锁状态
        const isUnlocked = this.checkGodUnlocked(god.id, playerData);

        if (this.godNameLabel) {
            const lockIcon = isUnlocked ? '' : '🔒';
            this.godNameLabel.string = lockIcon + god.icon + ' ' + god.name + ' ' + god.title;
        }

        if (this.effectLabel) {
            this.effectLabel.string = isUnlocked ? god.effect : '🔒 ' + god.unlockDesc;
        }

        if (this.resultLabel) {
            const costText = '消耗: ' + mat.icon + mat.name + ' x1';
            const rewardText = '奖励: ' + (10 + mat.duration * 5) + ' 钱 +' + (god.id === 'xiaosheng' ? 1.1 : 1) + ' 功德';
            this.resultLabel.string = costText + '\n' + rewardText;
        }
    }

    async doWorship() {
        console.log('执行供奉');
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 NetworkManager 为空');
            return;
        }

        const playerData = gm.networkManager.playerData;
        if (!playerData) {
            console.error('playerData 为空');
            return;
        }

        const god = GODS[this._selectedGodIndex];
        const mat = MATERIALS[this._selectedMatIndex];

        // 检查财神是否解锁
        const isUnlocked = this.checkGodUnlocked(god.id, playerData);
        if (!isUnlocked) {
            if (this.resultLabel) {
                this.resultLabel.string = '🔒 ' + god.unlockDesc;
                this.resultLabel.color = new Color(255, 100, 100);
            }
            return;
        }

        // 检查材料库存
        const invMap: any = {
            'incense': 'incense_sticks',
            'candle': 'candles',
            'paper': 'gold_paper',
            'fruit': 'fruits'
        };
        const invKey = invMap[mat.id];
        const currentStock = playerData[invKey] || 0;

        if (currentStock < mat.cost) {
            if (this.resultLabel) {
                this.resultLabel.string = '❌ ' + mat.name + '库存不足';
                this.resultLabel.color = new Color(255, 100, 100);
            }
            return;
        }

        if (this.resultLabel) {
            this.resultLabel.string = '🙏 供奉中...';
            this.resultLabel.color = new Color(255, 215, 0);
        }

        // 计算奖励
        const reward = 10 + mat.duration * 5;
        let merit = 1;
        if (god.id === 'xiaosheng') merit = Math.floor(1.1);

        // 调用后端API（这样服务器才能正确记录worship_count）
        try {
            const result = await gm.networkManager.worship(god.id, mat.id);
            console.log('供奉API结果:', result);
            
            // API成功后，更新本地数据
            playerData.worship_count = (playerData.worship_count || 0) + 1;  // 供奉次数+1
            playerData[invKey] = currentStock - mat.cost;  // 扣材料
            playerData.gold = (Number(playerData.gold) || 0) + Number(reward);  // 加钱(香火钱)
            playerData.merit = (playerData.merit || 0) + merit;  // 加功德

            // 更新财神庇佑次数(deity_buff可能是JSON字符串,需要解析)
            let deityBuff = playerData.deity_buff;
            if (typeof deityBuff === 'string') {
                try {
                    deityBuff = JSON.parse(deityBuff);
                } catch (e) {
                    deityBuff = {};
                }
            } else if (!deityBuff) {
                deityBuff = {};
            }

            if (!deityBuff[god.id]) {
                deityBuff[god.id] = { count: 0, bonus: god.bonus };
            }
            deityBuff[god.id].count += mat.duration;
            playerData.deity_buff = deityBuff;

            if (this.resultLabel) {
                this.resultLabel.string = `🙏 供奉成功!+${reward}钱 +${merit}功德 庇佑+${mat.duration}次`;
                this.resultLabel.color = new Color(100, 255, 100);
            }
            this.updateDisplay(playerData);

            if (gm.uiGame) {
                gm.uiGame.updateMoney?.();
                gm.uiGame.updateMerit?.();
                gm.uiGame.updateBlessingDisplay?.();
            }
        } catch (err) {
            console.error('供奉API失败:', err);
            if (this.resultLabel) {
                this.resultLabel.string = '❌ 供奉失败';
                this.resultLabel.color = new Color(255, 100, 100);
            }
        }
    }

    show(playerData: any) {
        console.log('=== UITemple show 被调用 ===');
        if (this.templePanel) {
            this.templePanel.active = true;
            // 确保升级确认弹窗默认隐藏
            if (this.upgradeConfirmPanel) {
                this.upgradeConfirmPanel.active = false;
            }
            // 加载财神排序
            this.loadGodOrder(playerData);
            this.updateDisplay(playerData);
            this.updateWorshipDisplay();
            this.updateModeDisplay();
            this.updateButtonDisplay();
            // 打开时拉取最新庙宇存储数据
            const gm = GameManager.instance;
            if (gm?.networkManager) {
                gm.networkManager.getTempleData().then((result: any) => {
                    if ((result.code === 0 || result.code === 200) && result.data) {
                        const newStorage = Number(result.data.temple_storage) || 0;
                        if (this.storageValueLabel) {
                            this.storageValueLabel.string = newStorage.toLocaleString();
                        }
                        // 同时更新 playerData.temple_storage
                        if (gm.networkManager.playerData) {
                            gm.networkManager.playerData.temple_storage = newStorage;
                        }
                    }
                }).catch(() => {});
            }
        } else {
            console.error('templePanel 为 null!');
        }
    }

    // 加载财神排序
    loadGodOrder(playerData: any) {
        if (playerData.deity_order) {
            try {
                this._godOrder = typeof playerData.deity_order === 'string'
                    ? JSON.parse(playerData.deity_order)
                    : playerData.deity_order;
            } catch (e) {
                this._godOrder = [];
            }
        }
        if (!this._godOrder || this._godOrder.length === 0) {
            // 默认顺序
            this._godOrder = GODS.map(g => g.id);
        }
        console.log('加载财神排序:', this._godOrder);
    }

    // 保存财神排序
    async saveGodOrder() {
        const gm = GameManager.instance;
        if (!gm?.networkManager?.playerData) return;
        gm.networkManager.playerData.deity_order = this._godOrder;
        await gm.networkManager.syncData(gm.networkManager.playerData);
        console.log('保存财神排序:', this._godOrder);
    }

    // 移动财神顺序(fromIndex到toIndex)
    moveGod(fromIndex: number, toIndex: number) {
        if (fromIndex < 0 || fromIndex >= this._godOrder.length) return;
        if (toIndex < 0 || toIndex >= this._godOrder.length) return;
        const item = this._godOrder.splice(fromIndex, 1)[0];
        this._godOrder.splice(toIndex, 0, item);
        console.log('移动财神顺序:', fromIndex, '->', toIndex, this._godOrder);
        this.saveGodOrder();
    }

    // 获取当前排序后的GODS列表
    getOrderedGods(): any[] {
        return this._godOrder.map(id => GODS.find(g => g.id === id)).filter(Boolean);
    }

    hide() {
        if (this.templePanel) {
            this.templePanel.active = false;
        }
    }
}
