import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform } from 'cc';
import { GameManager } from '../GameManager';
import * as V19Lib from '../Data/V19Lib';
import { NodeEventType } from 'cc';
import { view, director } from 'cc';
import { UITemple } from './UITemple';
import { UISignIn } from './UISignIn';
import { UIRank } from './UIRank';
import { UIShop } from './UIShop';
import { UIQuest } from './UIQuest';
import { UITravel } from './UITravel';
import { UIAchievement } from './UIAchievement';
import { UIInventory } from './UIInventory';
import { UIHour } from './UIHour';
import { UIInvite } from './UIInvite';
import { UIFriend } from './UIFriend';
import { UIMail } from './UIMail';
import { UIDecor } from './UIDecor';
import { UIGuide } from './UIGuide';
import { UIKaimen } from './UIKaimen';
import { UISettings } from './UISettings';
const { ccclass, property } = _decorator;

@ccclass('UIGame')
export class UIGame extends Component {

    @property(Label)
    nicknameLabel: Label = null;

    @property(Label)
    levelLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    @property(Label)
    yuanbaoLabel: Label = null;

    @property(Label)
    meritLabel: Label = null;

    @property(Label)
    blessingLabel: Label = null;  // 财神庇佑显示

    @property(Label)
    manaLabel: Label = null;

    @property(Label)
    realmLabel: Label = null;

    @property(Label)
    realmLabel: Label = null;

    @property(Label)
    loadingLabel: Label = null;

    @property(Button)
    almsButton: Button = null;

    @property(Button)
    refreshButton: Button = null;

    @property(Button)
    signInButton: Button = null;

    @property(Button)
    rankButton: Button = null;

    @property(Button)
    shopButton: Button = null;

    @property(Button)
    questButton: Button = null;

    @property(Button)
    travelButton: Button = null;

    @property(Button)
    achievementButton: Button = null;

    @property(Button)
    inventoryButton: Button = null;

    @property(Node)
    rankPanel: Node = null;

    @property(Node)
    shopPanel: Node = null;

    @property(Node)
    questPanel: Node = null;

    @property(Node)
    travelPanel: Node = null;

    @property(Node)
    achievementPanel: Node = null;

    @property(Node)
    inventoryPanel: Node = null;

    @property(Node)
    hourPanel: Node = null;

    @property(Node)
    kaimenPanel: Node = null;

    @property(Node)
    signInPanel: Node = null;

    @property(Button)
    templeButton: Button = null;

    // 区域选择面板节点
    @property(Node)
    areaSelectPanel: Node = null;

    // 化缘事件面板（intro + 稳求/险求按钮）
    @property(Node)
    almsEventPanel: Node = null;

    @property(Label)
    almsEventDescLabel: Label = null;  // 事件描述Label

    @property(Button)
    almsSafeBtn: Button = null;  // 稳求按钮

    @property(Button)
    almsRiskyBtn: Button = null;  // 险求按钮

    // 化缘结果面板
    @property(Node)
    almsResultPanel: Node = null;

    @property(Label)
    almsResultLabel: Label = null;

    @property(Button)
    almsResultCloseBtn: Button = null;

    @property(Label)
    areaNameLabel: Label = null;

    @property(Label)
    thresholdLabel: Label = null;

    @property(Button)
    leftAreaBtn: Button = null;

    @property(Button)
    rightAreaBtn: Button = null;

    @property(Button)
    confirmAreaBtn: Button = null;

    @property(Button)
    closeAreaBtn: Button = null;

    // 供奉面板(编辑器绑定)
    // 庙宇面板(编辑器绑定)
    @property(Node)
    templePanel: Node = null;

    // 设置按钮
    @property(Button)
    settingsBtn: Button = null;

    // 设置面板
    @property(Node)
    settingsPanel: Node = null;

    // 邀请按钮
    @property(Button)
    inviteBtn: Button = null;

    // 邀请面板
    @property(Node)
    invitePanel: Node = null;

    // 好友按钮
    @property(Button)
    friendBtn: Button = null;

    // 好友面板
    @property(Node)
    friendPanel: Node = null;

    // 邮件按钮
    @property(Button)
    mailBtn: Button = null;

    // 邮件面板
    @property(Node)
    mailPanel: Node = null;

    // 装饰按钮
    @property(Button)
    decorBtn: Button = null;

    // 玩家信息面板
    @property(Button)
    playerInfoBtn: Button = null;
    @property(Node)
    playerInfoPanel: Node = null;
    @property(Label)
    playerIdValue: Label = null;
    @property(Label)
    nicknameValue: Label = null;
    @property(Label)
    levelValue: Label = null;
    @property(Label)
    realmValue: Label = null;
    @property(Label)
    shanyuanValue: Label = null;
    @property(Label)
    reputationValue: Label = null;
    @property(Label)
    fragmentValue: Label = null;
    @property(Label)
    bannerValue: Label = null;
    @property(Label)
    signDayValue: Label = null;

    // 装饰面板
    @property(Node)
    decorPanel: Node = null;

    // 新手引导面板
    @property(Node)
    guidePanel: Node = null;


    // 区域选择面板（使用编辑器绑定的 areaSelectPanel）

    private _dataLoaded: boolean = false;

    // 庙宇面板组件
    private _signInComp: UISignIn = null;
    private _rankComp: UIRank = null;
    private _shopComp: UIShop = null;
    private _questComp: UIQuest = null;
    private _travelComp: UITravel = null;
    private _achievementComp: UIAchievement = null;
    private _inventoryComp: UIInventory = null;
    private _hourComp: UIHour = null;
    private _kaimenComp: UIKaimen = null;
    private _templeComp: UITemple = null;
    private _settingsComp: any = null;
    private _inviteComp: UIInvite = null;
    private _friendComp: any = null;
    private _mailComp: any = null;
    private _decorComp: any = null;
    private _guideComp: any = null;
    private _currentAreaIndex: number = 0;
    private _currentAlmsAreaId: string = '';  // 当前化缘区域ID
    private _currentAlmsMode: string = 'safe';  // 当前化缘模式
    private _manaRegenInterval: number = 0;  // 法力恢复定时器ID
    private _isReloading: boolean = false;  // 防止 update 和 setTimeout 同时触发 loadPlayerDataCore
    // 8个区域配置
    // type: '5r'=前6区(稳求/险求模式), '2r'=后2区(纯赌博模式)
    private _areas = [
        { id: 'tianlu',  name: '天禄', threshold: 100,    icon: '☰', type: '5r' },
        { id: 'zhenyue', name: '镇岳', threshold: 500,    icon: '☶', type: '5r' },
        { id: 'longyin', name: '龙吟', threshold: 1000,   icon: '☳', type: '5r' },
        { id: 'fuyao',   name: '扶摇', threshold: 5000,   icon: '☴', type: '5r' },
        { id: 'nanming', name: '南明', threshold: 10000,  icon: '☲', type: '5r' },
        { id: 'dibao',   name: '地宝', threshold: 50000,  icon: '☷', type: '5r' },
        { id: 'ganze',   name: '甘泽', threshold: 77777,  icon: '☱', type: '2r' },
        { id: 'liquan',  name: '流泉', threshold: 99999,  icon: '☵', type: '2r' }
    ];

    start() {
        console.log('=== UIGame start ===');

        // 注册到GameManager
        const gm = GameManager.instance;
        if (gm) gm.uiGame = this;

        // 清除旧数据
        if (this.nicknameLabel) this.nicknameLabel.string = '';
        if (this.levelLabel) this.levelLabel.string = '';
        if (this.goldLabel) this.goldLabel.string = '';
        if (this.yuanbaoLabel) this.yuanbaoLabel.string = '';
        if (this.meritLabel) this.meritLabel.string = '';
        if (this.manaLabel) this.manaLabel.string = '';
        if (this.realmLabel) this.realmLabel.string = '';
        if (this.loadingLabel) {
            this.loadingLabel.node.active = true;
            this.loadingLabel.string = '加载中...';
        }

        // 法力恢复：根据后台配置的恢复速度动态计算间隔，上限100
        const gm2 = GameManager.instance;
        const regenPerHour = gm2?.networkManager?.manaRegenPerHour || 10;
        const intervalMs = Math.floor(3600000 / regenPerHour); // 每X毫秒恢复1点
        if (this._manaRegenInterval) {
            clearInterval(this._manaRegenInterval);
        }
        this._manaRegenInterval = setInterval(() => {
            const gm = GameManager.instance;
            const p = gm?.networkManager?.playerData;
            if (p && p.mana < 100) {
                p.mana = Math.min(100, p.mana + 1);
                if (this.manaLabel) {
                    this.manaLabel.string = '法力 ' + Math.floor(p.mana) + '/100';
                }
            }
            // 每30秒同步一次法力到服务端
            if (gm?.networkManager?.playerData) {
                gm.networkManager.syncData(gm.networkManager.playerData).catch(() => {});
            }
        }, intervalMs);

        // 绑定按钮
        this.bindButton(this.almsButton, 'AlmsButton', this.onAlmsClicked.bind(this));
        this.bindButton(this.refreshButton, 'RefreshButton', this.onRefreshClicked.bind(this));
        this.bindButton(this.templeButton, 'TempleButton', this.onTempleClicked.bind(this));
        this.bindButton(this.signInButton, 'SignInButton', this.onSignInClicked.bind(this));
        this.bindButton(this.rankButton, 'RankButton', this.onRankClicked.bind(this));
        this.bindButton(this.shopButton, 'ShopButton', this.onShopClicked.bind(this));
        this.bindButton(this.questButton, 'QuestButton', this.onQuestClicked.bind(this));
        this.bindButton(this.travelButton, 'TravelButton', this.onTravelClicked.bind(this));
        this.bindButton(this.achievementButton, 'AchievementButton', this.onAchievementClicked.bind(this));
        this.bindButton(this.inventoryButton, 'InventoryButton', this.onInventoryClicked.bind(this));
        this.bindButton(this.settingsBtn, 'SettingsBtn', this.onSettingsBtnClicked.bind(this));

        // 直接查找并绑定 settingsBtn
        const settingsBtnNode = this.findInScene('SettingsBtn');
        if (settingsBtnNode) {
            const btn = settingsBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onSettingsBtnClicked, this);
            }
        }

        // 邀请按钮
        const inviteBtnNode = this.findInScene('InviteBtn');
        console.log('查找InviteBtn结果:', inviteBtnNode);
        if (inviteBtnNode) {
            const btn = inviteBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onInviteClicked, this);
            }
        }

        // 好友按钮
        const friendBtnNode = this.findInScene('FriendBtn');
        if (friendBtnNode) {
            const btn = friendBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onFriendClicked, this);
            }
        }

        // 邮件按钮
        const mailBtnNode = this.findInScene('MailBtn');
        if (mailBtnNode) {
            const btn = mailBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onMailClicked, this);
            }
        }

        // 玩家信息（名字）点击
        const nicknameLabelNode = this.findInScene('NicknameLabel');
        if (nicknameLabelNode) {
            const btn = nicknameLabelNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onPlayerInfoBtnClicked, this);
            }
        }

        // 玩家信息按钮（红色方块）点击
        const playerInfoBtnNode = this.findInScene('PlayerInfoBtn');
        if (playerInfoBtnNode) {
            const btn = playerInfoBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onPlayerInfoBtnClicked, this);
            }
        }

        // 玩家信息面板关闭按钮
        const playerInfoCloseBtnNode = this.findInScene('PlayerInfoCloseBtn');
        if (playerInfoCloseBtnNode) {
            const btn = playerInfoCloseBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onPlayerInfoCloseBtnClicked, this);
            }
        }

        // 查找玩家信息面板节点
        this.playerInfoPanel = this.findInScene('PlayerInfoPanel');
        if (this.playerInfoPanel) {
            this.playerInfoPanel.active = false;
        }
        const labels = [
            ['PlayerIdValue', 'playerIdValue'],
            ['NicknameValue', 'nicknameValue'],
            ['LevelValue', 'levelValue'],
            ['RealmValue', 'realmValue'],
            ['ShanyuanValue', 'shanyuanValue'],
            ['ReputationValue', 'reputationValue'],
            ['FragmentValue', 'fragmentValue'],
            ['BannerValue', 'bannerValue'],
            ['SignDayValue', 'signDayValue'],
        ];
        labels.forEach(([nodeName, propName]) => {
            const node = this.findInScene(nodeName);
            if (node) {
                const lbl = node.getComponent(Label);
                if (lbl) (this as any)[propName] = lbl;
            }
        });

        // 邮件面板
        if (!this.mailPanel) {
            this.mailPanel = this.findInScene('MailPanel');
        }

        // 装饰按钮
        const decorBtnNode = this.findInScene('DecorBtn');
        if (decorBtnNode) {
            const btn = decorBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onDecorClicked, this);
            }
        }

        // 装饰面板
        if (!this.decorPanel) {
            this.decorPanel = this.findInScene('DecorPanel');
        }

        // 化缘事件面板（从编辑器创建的节点）
        if (!this.almsEventPanel) {
            this.almsEventPanel = this.findInScene('AlmsEventPanel');
        }
        if (!this.almsResultPanel) {
            this.almsResultPanel = this.findInScene('AlmsResultPanel');
        }

        // 启动时隐藏化缘面板
        if (this.almsEventPanel) {
            this.almsEventPanel.active = false;
        }
        if (this.almsResultPanel) {
            this.almsResultPanel.active = false;
        }

        // 化缘事件描述Label
        const almsEventDescNode = this.findInScene('AlmsEventDescLabel');
        if (almsEventDescNode) {
            const lbl = almsEventDescNode.getComponent(Label);
            if (lbl) {
                this.almsEventDescLabel = lbl;
                lbl.fontSize = 22;
                lbl.lineHeight = 32;
                lbl.color = new Color(255, 255, 255, 255);
                lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
                lbl.verticalAlign = Label.VerticalAlign.TOP;
                lbl.overflow = Label.Overflow.CLAMP;
            }
        }

        // 化缘结果Label
        const almsResultLabelNode = this.findInScene('AlmsResultLabel');
        if (almsResultLabelNode) {
            const lbl = almsResultLabelNode.getComponent(Label);
            if (lbl) {
                this.almsResultLabel = lbl;
                lbl.fontSize = 24;
                lbl.lineHeight = 36;
                lbl.color = new Color(255, 215, 0, 255);
                lbl.horizontalAlign = Label.HorizontalAlign.CENTER;
                lbl.verticalAlign = Label.VerticalAlign.TOP;
                lbl.overflow = Label.Overflow.CLAMP;
                console.log('almsResultLabel 找到并设置完成');
            } else {
                console.error('almsResultLabel 没有 Label 组件');
            }
        } else {
            console.error('almsResultLabelNode 未找到');
        }

        // 化缘按钮绑定
        const almsSafeBtnNode = this.findInScene('AlmsSafeBtn');
        if (almsSafeBtnNode) {
            const btn = almsSafeBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onAlmsSafeClicked, this);
                this.almsSafeBtn = btn;
                // 设置稳求按钮样式
                const safeLabel = almsSafeBtnNode.getChildByName('Label');
                if (safeLabel) {
                    const lbl = safeLabel.getComponent(Label);
                    if (lbl) {
                        lbl.fontSize = 18;
                        lbl.color = new Color(255, 255, 255, 255);
                    }
                }
            }
        }

        const almsRiskyBtnNode = this.findInScene('AlmsRiskyBtn');
        if (almsRiskyBtnNode) {
            const btn = almsRiskyBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onAlmsRiskyClicked, this);
                this.almsRiskyBtn = btn;
                // 设置险求按钮样式
                const riskyLabel = almsRiskyBtnNode.getChildByName('Label');
                if (riskyLabel) {
                    const lbl = riskyLabel.getComponent(Label);
                    if (lbl) {
                        lbl.fontSize = 18;
                        lbl.color = new Color(255, 255, 255, 255);
                    }
                }
            }
        }

        const almsResultCloseBtnNode = this.findInScene('AlmsResultCloseBtn');
        if (almsResultCloseBtnNode) {
            const btn = almsResultCloseBtnNode.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onAlmsResultCloseClicked, this);
                this.almsResultCloseBtn = btn;
                // 设置关闭按钮样式
                const closeLabel = almsResultCloseBtnNode.getChildByName('Label');
                if (closeLabel) {
                    const lbl = closeLabel.getComponent(Label);
                    if (lbl) {
                        lbl.fontSize = 18;
                        lbl.color = new Color(255, 255, 255, 255);
                    }
                }
            }
        }

        // 新手引导面板
        if (!this.guidePanel) {
            this.guidePanel = this.findInScene('GuidePanel');
        }

        // 创建面板组件
        if (this.templePanel) {
            this._templeComp = this.templePanel.getComponent(UITemple);
            if (!this._templeComp) {
                this._templeComp = this.templePanel.addComponent(UITemple);
            }
        }

        // 设置面板组件
        if (this.settingsPanel) {
            this._settingsComp = this.settingsPanel.getComponent(UISettings);
        }

        // 邀请面板组件
        if (this.invitePanel) {
            this._inviteComp = this.invitePanel.getComponent(UIInvite);
        }

        // 好友面板组件
        if (this.friendPanel) {
            this._friendComp = this.friendPanel.getComponent(UIFriend);
        }

        // 邮件面板组件
        if (this.mailPanel) {
            this._mailComp = this.mailPanel.getComponent(UIMail);
        }

        // 装饰面板组件
        if (this.decorPanel) {
            this._decorComp = this.decorPanel.getComponent(UIDecor);
        }

        // 引导面板组件
        if (this.guidePanel) {
            this._guideComp = this.guidePanel.getComponent(UIGuide);
        }

        if (this.signInPanel) {
            this._signInComp = this.signInPanel.getComponent(UISignIn);
            if (!this._signInComp) {
                this._signInComp = this.signInPanel.addComponent(UISignIn);
            }
        }

        // 排行榜面板组件
        if (this.rankPanel) {
            this._rankComp = this.rankPanel.getComponent(UIRank);
            if (!this._rankComp) {
                this._rankComp = this.rankPanel.addComponent(UIRank);
            }
        }

        // 商城面板组件
        if (this.shopPanel) {
            this._shopComp = this.shopPanel.getComponent(UIShop);
            if (!this._shopComp) {
                this._shopComp = this.shopPanel.addComponent(UIShop);
            }
        }

        // 任务面板组件
        if (this.questPanel) {
            this._questComp = this.questPanel.getComponent(UIQuest);
            if (!this._questComp) {
                this._questComp = this.questPanel.addComponent(UIQuest);
            }
        }

        // 云游面板组件
        if (this.travelPanel) {
            this._travelComp = this.travelPanel.getComponent(UITravel);
            if (!this._travelComp) {
                this._travelComp = this.travelPanel.addComponent(UITravel);
            }
        }

        // 成就面板组件
        if (this.achievementPanel) {
            this._achievementComp = this.achievementPanel.getComponent(UIAchievement);
            if (!this._achievementComp) {
                this._achievementComp = this.achievementPanel.addComponent(UIAchievement);
            }
        }

        // 背包面板组件
        if (this.inventoryPanel) {
            this._inventoryComp = this.inventoryPanel.getComponent(UIInventory);
            if (!this._inventoryComp) {
                this._inventoryComp = this.inventoryPanel.addComponent(UIInventory);
            }
        }

        // 时辰选择面板组件
        if (this.hourPanel) {
            this._hourComp = this.hourPanel.getComponent(UIHour);
            if (!this._hourComp) {
                this._hourComp = this.hourPanel.addComponent(UIHour);
            }
        }

        // 开财门面板组件
        if (this.kaimenPanel) {
            this._kaimenComp = this.kaimenPanel.getComponent(UIKaimen);
            if (!this._kaimenComp) {
                this._kaimenComp = this.kaimenPanel.addComponent(UIKaimen);
            }
        }

        // 绑定区域选择面板按钮事件
        this.bindAreaPanelEvents();

        // 隐藏所有面板
        if (this.areaSelectPanel) this.areaSelectPanel.active = false;
        if (this.templePanel) this.templePanel.active = false;
        if (this.signInPanel) this.signInPanel.active = false;
        if (this.rankPanel) this.rankPanel.active = false;
        if (this.shopPanel) this.shopPanel.active = false;
        if (this.questPanel) this.questPanel.active = false;
        if (this.travelPanel) this.travelPanel.active = false;
        if (this.achievementPanel) this.achievementPanel.active = false;
        if (this.inventoryPanel) this.inventoryPanel.active = false;
        if (this.invitePanel) this.invitePanel.active = false;
        if (this.friendPanel) this.friendPanel.active = false;
        if (this.mailPanel) this.mailPanel.active = false;
        if (this.decorPanel) this.decorPanel.active = false;
        if (this.guidePanel) this.guidePanel.active = false;
    }

    // 绑定区域选择面板按钮事件
    bindAreaPanelEvents() {
        console.log('绑定区域面板按钮事件...');
        console.log('areaSelectPanel:', this.areaSelectPanel);
        console.log('leftAreaBtn:', this.leftAreaBtn);
        console.log('rightAreaBtn:', this.rightAreaBtn);
        console.log('confirmAreaBtn:', this.confirmAreaBtn);
        console.log('closeAreaBtn:', this.closeAreaBtn);

        if (this.leftAreaBtn) {
            this.leftAreaBtn.node.on('click', this.onLeftAreaClicked, this);
        }
        if (this.rightAreaBtn) {
            this.rightAreaBtn.node.on('click', this.onRightAreaClicked, this);
        }
        if (this.confirmAreaBtn) {
            this.confirmAreaBtn.node.on('click', this.onConfirmAreaClicked, this);
        }
        if (this.closeAreaBtn) {
            this.closeAreaBtn.node.on('click', this.onCloseAreaClicked, this);
        }

        this.updateAreaDisplay();
    }

    // 更新区域显示
    updateAreaDisplay() {
        const area = this._areas[this._currentAreaIndex];
        const gm = GameManager.instance;
        const dailyAlms = gm?.networkManager?.playerData?.daily_alms ?? 0;
        const totalAlms = 20;
        const usedAlms = totalAlms - dailyAlms;
        const playerMana = gm?.networkManager?.playerData?.mana ?? 0;
        if (this.areaNameLabel) {
            this.areaNameLabel.string = area.icon + ' ' + area.name;
        }
        if (this.thresholdLabel) {
            this.thresholdLabel.string = '门槛: ' + area.threshold.toLocaleString() + ' 香火';
            this.thresholdLabel.string += '\n今日化缘: ' + usedAlms + '/' + totalAlms;
            this.thresholdLabel.string += '\n法力 ' + Math.floor(playerMana) + '/100';
        }
    }

    onLeftAreaClicked() {
        console.log('点击左箭头');
        this._currentAreaIndex--;
        if (this._currentAreaIndex < 0) {
            this._currentAreaIndex = this._areas.length - 1;
        }
        this.updateAreaDisplay();
    }

    onRightAreaClicked() {
        console.log('点击右箭头');
        this._currentAreaIndex++;
        if (this._currentAreaIndex >= this._areas.length) {
            this._currentAreaIndex = 0;
        }
        this.updateAreaDisplay();
    }

    onConfirmAreaClicked() {
        console.log('确认区域');
        const area = this._areas[this._currentAreaIndex];
        const gm = GameManager.instance;
        const playerGold = gm?.networkManager?.playerData?.gold || 0;

        if (playerGold < area.threshold) {
            // 门槛不足：在 thresholdLabel 显示提示，2秒后恢复
            if (this.thresholdLabel) {
                this.thresholdLabel.string = '门槛: ' + area.threshold.toLocaleString() + ' 香火\n❌ 香火钱不足，无法进入' + area.name;
                setTimeout(() => this.updateAreaDisplay(), 2000);
            }
            return;
        }

        const dailyAlms = gm?.networkManager?.playerData?.daily_alms ?? 0;
        if (dailyAlms <= 0) {
            // 次数用完：在 thresholdLabel 显示提示，2秒后恢复
            if (this.thresholdLabel) {
                this.thresholdLabel.string = '❌ 今日化缘次数已用完';
                setTimeout(() => this.updateAreaDisplay(), 2000);
            }
            return;
        }

        const playerMana = gm?.networkManager?.playerData?.mana ?? 0;
        if (playerMana < 5) {
            // 法力不足：在 thresholdLabel 显示提示，2秒后恢复
            if (this.thresholdLabel) {
                this.thresholdLabel.string = '❌ 法力不足，每次化缘需5点法力';
                setTimeout(() => this.updateAreaDisplay(), 2000);
            }
            return;
        }

        if (this.areaSelectPanel) {
            this.areaSelectPanel.active = false;
        }
        this._currentAlmsAreaId = area.id;
        this.showAlmsEventPanel(area.id);
        if (this.almsSafeBtn) this.almsSafeBtn.node.active = true;
        if (this.almsRiskyBtn) this.almsRiskyBtn.node.active = true;
    }

    // 显示化缘事件面板
    showAlmsEventPanel(areaId: string) {
        if (!this.almsEventPanel) {
            console.error('almsEventPanel 未绑定!');
            return;
        }
        // 清空结果区
        if (this.almsResultLabel) this.almsResultLabel.string = '';
        // 生成随机intro
        const intro = V19Lib.getAlmsIntro(areaId);
        console.log('化缘intro:', intro);
        if (this.almsEventDescLabel) {
            this.almsEventDescLabel.string = intro;
        } else {
            console.error('almsEventDescLabel 未绑定!');
        }
        // 调试：检查面板状态
        console.log('almsEventPanel.active设置前:', this.almsEventPanel.active);
        console.log('almsEventPanel.position:', this.almsEventPanel.position);
        console.log('almsEventPanel.parent:', this.almsEventPanel.parent?.name);
        this.almsEventPanel.active = true;
        console.log('almsEventPanel.active设置后:', this.almsEventPanel.active);
    }

    // 稳求按钮点击
    onAlmsSafeClicked() {
        console.log('稳求 clicked');
        this._currentAlmsMode = 'safe';
        this.doAlmsWithArea(this._currentAlmsAreaId, 'safe');
    }

    // 险求按钮点击
    onAlmsRiskyClicked() {
        console.log('险求 clicked');
        this._currentAlmsMode = 'risky';
        this.doAlmsWithArea(this._currentAlmsAreaId, 'risky');
    }

    // 化缘结果关闭按钮
    onAlmsResultCloseClicked() {
        console.log('关闭化缘结果面板');
        // 关闭结果面板
        const rp = this.almsResultPanel || this.findInScene('AlmsResultPanel');
        if (rp) {
            rp.active = false;
            console.log('结果面板已关闭, active=', rp.active);
        } else {
            console.error('结果面板节点未找到!');
        }
        // 关闭事件面板
        const ep = this.almsEventPanel || this.findInScene('AlmsEventPanel');
        if (ep) {
            ep.active = false;
            console.log('事件面板已关闭, active=', ep.active);
        } else {
            console.error('事件面板节点未找到!');
        }
    }

    onCloseAreaClicked() {
        console.log('关闭区域面板');
        if (this.areaSelectPanel) {
            this.areaSelectPanel.active = false;
        }
    }

    // 查找并绑定按钮
    bindButton(btn: Button, nodeName: string, handler: Function) {
        if (btn) {
            console.log('绑定按钮:', nodeName);
            // 同时绑定 click 和 touchend
            btn.node.on('click', handler, this);
            btn.node.on(NodeEventType.TOUCH_END, handler, this);
        } else {
            // 从场景根节点递归查找
            const found = this.findInScene(nodeName);
            if (found) {
                const button = found.getComponent(Button);
                if (button) {
                    console.log('自动找到按钮:', nodeName);
                    button.node.on('click', handler, this);
                    button.node.on(NodeEventType.TOUCH_END, handler, this);
                    // 保存引用
                    if (nodeName === 'AlmsButton') this.almsButton = button;
                    if (nodeName === 'RefreshButton') this.refreshButton = button;
                }
            } else {
                console.log('按钮未绑定:', nodeName);
                // 尝试备用名称
                const altName = nodeName.replace('Button', 'Btn');
                const altFound = this.findInScene(altName);
                if (altFound) {
                    const altBtn = altFound.getComponent(Button);
                    if (altBtn) {
                        console.log('备用找到按钮:', altName);
                        altBtn.node.on('click', handler, this);
                        // 保存引用
                        if (nodeName === 'SignInButton') this.signInButton = altBtn;
                    }
                }
            }
        }
    }

    // 递归查找节点
    findNodeByName(node: Node, name: string): Node | null {
        if (node.name === name) return node;
        for (const child of node.children) {
            const found = this.findNodeByName(child, name);
            if (found) return found;
        }
        return null;
    }

    // 从场景根节点开始查找
    findInScene(name: string): Node | null {
        const scene = this.node.parent; // 通常是 Canvas 或 Scene
        if (scene) {
            return this.findNodeByName(scene, name);
        }
        return null;
    }

    update() {
        if (this._dataLoaded || this._isReloading) return;

        const gm = GameManager.instance;
        if (gm && gm.networkManager) {
            this._dataLoaded = true;
            this._isReloading = true;
            this.loadPlayerDataCore(gm);
        }
    }

    onAlmsClicked() {
        console.log('=== onAlmsClicked ===');

        // 显示区域选择面板
        if (this.areaSelectPanel) {
            console.log('显示 areaSelectPanel');
            this.areaSelectPanel.active = true;
            this.updateAreaDisplay();
        } else {
            console.error('areaSelectPanel 为 null!');
        }
    }

    onTempleClicked() {
        console.log('=== 点击庙宇 ===');
        console.log('templeButton:', this.templeButton);
        console.log('templePanel:', this.templePanel);
        console.log('_templeComp:', this._templeComp);

        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 networkManager 为空');
            return;
        }

        if (this._templeComp) {
            console.log('调用 _templeComp.show()');
            this._templeComp.show(gm.networkManager.playerData);
        } else {
            console.error('_templeComp 为 null!');
            // 尝试重新获取组件
            if (this.templePanel) {
                console.log('尝试从 templePanel 获取 UITemple 组件');
                this._templeComp = this.templePanel.getComponent(UITemple);
                console.log('重新获取的 _templeComp:', this._templeComp);
                if (this._templeComp) {
                    this._templeComp.show(gm.networkManager.playerData);
                }
            }
        }
    }

    onSignInClicked() {
        console.log('=== 点击签到 ===');
        console.log('signInButton:', this.signInButton);
        console.log('signInPanel:', this.signInPanel);
        console.log('_signInComp:', this._signInComp);

        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            console.error('GameManager 或 networkManager 为空');
            return;
        }

        if (this._signInComp) {
            console.log('调用 _signInComp.show()');
            this._signInComp.show(gm.networkManager.playerData);
        } else {
            console.error('_signInComp 为 null!');
            if (this.signInPanel) {
                this._signInComp = this.signInPanel.getComponent(UISignIn);
                if (this._signInComp) {
                    this._signInComp.show(gm.networkManager.playerData);
                }
            }
        }
    }

    onRankClicked() {
        console.log('=== 点击排行榜 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._rankComp) {
            this._rankComp.show();
        } else {
            console.error('_rankComp 为 null!');
            if (this.rankPanel) {
                this._rankComp = this.rankPanel.getComponent(UIRank);
                if (this._rankComp) {
                    this._rankComp.show();
                }
            }
        }
    }

    onShopClicked() {
        console.log('=== 点击商城 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._shopComp) {
            this._shopComp.show();
        } else {
            console.error('_shopComp 为 null!');
            if (this.shopPanel) {
                this._shopComp = this.shopPanel.getComponent(UIShop);
                if (this._shopComp) {
                    this._shopComp.show();
                }
            }
        }
    }

    onQuestClicked() {
        console.log('=== 点击任务 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._questComp) {
            this._questComp.show();
        } else {
            console.error('_questComp 为 null!');
            if (this.questPanel) {
                this._questComp = this.questPanel.getComponent(UIQuest);
                if (this._questComp) {
                    this._questComp.show();
                }
            }
        }
    }

    onTravelClicked() {
        console.log('=== 点击云游 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._travelComp) {
            this._travelComp.show();
        } else {
            console.error('_travelComp 为 null!');
            if (this.travelPanel) {
                this._travelComp = this.travelPanel.getComponent(UITravel);
                if (this._travelComp) {
                    this._travelComp.show();
                }
            }
        }
    }

    onAchievementClicked() {
        console.log('=== 点击成就 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._achievementComp) {
            this._achievementComp.show();
        } else {
            console.error('_achievementComp 为 null!');
            if (this.achievementPanel) {
                this._achievementComp = this.achievementPanel.getComponent(UIAchievement);
                if (this._achievementComp) {
                    this._achievementComp.show();
                }
            }
        }
    }

    onInventoryClicked() {
        console.log('=== 点击背包 ===');
        const gm = GameManager.instance;
        if (!gm) return;

        if (this._inventoryComp) {
            this._inventoryComp.show();
        } else {
            console.error('_inventoryComp 为 null!');
            if (this.inventoryPanel) {
                this._inventoryComp = this.inventoryPanel.getComponent(UIInventory);
                if (this._inventoryComp) {
                    this._inventoryComp.show();
                }
            }
        }
    }

    // 检查并显示每日弹窗(时辰选择或开财门)
    checkAndShowDailyPanels(playerData: any) {
        // 检查今天是否已经弹过开财门
        const today = new Date().toDateString();
        console.log('checkAndShowDailyPanels, today:', today);
        const lastKaimenDate = localStorage.getItem('lastKaimenDate');
        console.log('lastKaimenDate:', lastKaimenDate);
        
        // 如果没有选择时辰,显示时辰选择面板
        if (playerData.shengxiao === null || playerData.shengxiao === undefined) {
            console.log('未选择时辰,显示时辰选择面板');
            if (this._hourComp) {
                this._hourComp.show();
            }
        } else if (lastKaimenDate !== today) {
            // 已选时辰,且今天还没弹过开财门
            console.log('显示开财门面板');
            if (this._kaimenComp) {
                this._kaimenComp.show();
                localStorage.setItem('lastKaimenDate', today);
            }
        } else {
            console.log('今天已弹过开财门,不再显示');
        }
    }

    onRefreshClicked() {
        console.log('点击刷新');
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) return;
        this._dataLoaded = false;
        this.loadPlayerDataCore(gm);
    }

    async doAlmsWithArea(areaId: string, mode: string = 'safe') {
        console.log('=== doAlms, 区域:', areaId, '模式:', mode, '===');
        const gm = GameManager.instance;
        if (!gm || !gm.networkManager) {
            if (this.loadingLabel) this.loadingLabel.string = '网络未就绪';
            return;
        }

        if (this.loadingLabel) {
            this.loadingLabel.node.active = true;
            this.loadingLabel.string = '化缘中...';
        }

        try {
            const result = await gm.networkManager.request('/alms/go', {
                method: 'POST',
                body: JSON.stringify({ area: areaId, mode: mode })
            });
            console.log('化缘结果:', JSON.stringify(result));

            if (result && result.code === 200) {
                const resultNames: any = {
                    'JP': '大吉大利', 'BW': '欧皇降临', 'NM': '平安顺遂',
                    'SW': '破财消灾', 'MS': '非酋本酋',
                    'W2': '大吉大利', 'L2': '非酋本酋'
                };
                const r = result.data || result;
                const resultName = resultNames[r.result] || r.resultName || '完成';
                
                // 获取事件文本（intro + results）
                console.log('areaId:', areaId, 'result:', r.result);
                const eventData = V19Lib.getAlmsEvent(areaId, r.result);
                console.log('eventData:', eventData);
                
                // 生成结果文本
                let displayText = resultName;
                if (eventData) {
                    const resultText = V19Lib.getAlmsResultText(r.result, eventData, this._currentAlmsMode);
                    displayText = resultName + '\n\n' + resultText;
                }
                
                // 添加香火钱盈亏显示
                if (r.netGain !== undefined) {
                    const netGain = r.netGain;
                    console.log('netGain:', netGain);
                    const gainText = netGain >= 0 ? '+' + netGain : '' + netGain;
                    displayText += '\n' + gainText + ' 香火钱';
                    if (r.fragBonus) {
                        displayText += '  碎片+' + (r.fragGain || 0);
                    }
                }
                
                // 添加庇佑信息
                if (r.usedBlessing) {
                    const godNames: any = {
                        'tudigong': '土地公', 'guanyu': '关羽', 'yaoshaosi': '姚少司',
                        'chenjiugong': '陈九公', 'fanli': '范蠡', 'caobao': '曹宝',
                        'liuhai': '刘海', 'xiaosheng': '萧升', 'zhaogongming': '赵公明'
                    };
                    const godName = godNames[r.usedBlessing] || r.usedBlessing;
                    if (r.blessingBonus < 1) {
                        displayText += '\n[' + godName + '庇佑 +' + Math.floor(r.blessingBonus * 100) + '%]';
                    } else {
                        displayText += '\n[' + godName + '庇佑 +' + Math.floor(r.blessingBonus) + ']';
                    }
                    // 更新本地庇佑数据
                    if (r.deityBuff && gm?.networkManager?.playerData) {
                        gm.networkManager.playerData.deity_buff = r.deityBuff;
                    }
                }
                
                // 先隐藏事件面板，再显示结果
                if (this.almsEventPanel) this.almsEventPanel.active = false;

                console.log('最终displayText:', displayText);

                // 显示结果面板
                if (this.almsResultPanel) {
                    this.almsResultPanel.active = true;
                    if (this.almsResultLabel) {
                        // 强制设置足够大的Content Size
                        const tf = this.almsResultLabel.node.getComponent(UITransform);
                        if (tf) {
                            tf.setContentSize(560, 350);
                        }
                        this.almsResultLabel.string = displayText;
                        console.log('用 almsResultLabel 显示结果');
                    } else {
                        console.error('almsResultLabel 是 null，用 loadingLabel 显示');
                        this.loadingLabel.node.active = true;
                        this.loadingLabel.string = displayText;
                    }
                } else if (this.loadingLabel) {
                    this.loadingLabel.node.active = true;
                    this.loadingLabel.string = displayText;
                }

                if (this.goldLabel && r.newGold !== undefined) {
                    this.goldLabel.string = '香火钱 ' + r.newGold;
                    // 同步更新 playerData.gold，防止下次 sync 时被旧值覆盖
                    if (gm?.networkManager?.playerData) {
                        gm.networkManager.playerData.gold = Number(r.newGold) || 0;
                    }
                    console.log('化缘后更新goldLabel为:', r.newGold, 'netGain:', r.netGain);
                } else {
                    console.error('goldLabel更新失败: goldLabel=', this.goldLabel, 'r.newGold=', r.newGold);
                }

                // 更新功德显示
                if (this.meritLabel && r.newMerit !== undefined) {
                    this.meritLabel.string = '功德×' + r.newMerit;
                    if (gm?.networkManager?.playerData) {
                        gm.networkManager.playerData.merit = r.newMerit;
                    }
                }

                // 更新声望显示
                if (this.reputationValue && r.newReputation !== undefined && gm?.networkManager?.playerData) {
                    gm.networkManager.playerData.reputation = r.newReputation;
                }

                // 更新碎片显示
                if (this.fragmentValue && r.newFragments !== undefined && gm?.networkManager?.playerData) {
                    gm.networkManager.playerData.fragments = r.newFragments;
                }

                // 立即更新次数和法力显示
                if (r.remainAlms !== undefined && gm?.networkManager?.playerData) {
                    gm.networkManager.playerData.daily_alms = r.remainAlms;
                }
                if (r.newMana !== undefined && gm?.networkManager?.playerData) {
                    gm.networkManager.playerData.mana = r.newMana;
                }
                this.updateAreaDisplay();
                this.updateBlessingDisplay();
                // 隐藏 loadingLabel
                if (this.loadingLabel) this.loadingLabel.node.active = false;
            } else {
                // 错误：隐藏事件面板，显示错误信息
                if (this.almsEventPanel) this.almsEventPanel.active = false;
                // 隐藏 loadingLabel
                if (this.loadingLabel) this.loadingLabel.node.active = false;
                const errMsg = result?.message || '化缘失败';
                if (this.almsResultLabel) {
                    this.almsResultLabel.string = '❌ ' + errMsg;
                }
                // 显示结果面板让错误可见
                if (this.almsResultPanel) this.almsResultPanel.active = true;
                // 隐藏稳求/险求按钮
                if (this.almsSafeBtn) this.almsSafeBtn.node.active = false;
                if (this.almsRiskyBtn) this.almsRiskyBtn.node.active = false;
            }
        } catch(e: any) {
            console.error('化缘出错:', e);
            if (this.almsResultLabel) {
                this.almsResultLabel.string = '❌ 化缘出错';
            }
            if (this.almsSafeBtn) this.almsSafeBtn.node.active = false;
            if (this.almsRiskyBtn) this.almsRiskyBtn.node.active = false;
        }
    }

    async doWorship() {
        if (this.loadingLabel) {
            this.loadingLabel.node.active = true;
            this.loadingLabel.string = '供奉功能开发中...';
            setTimeout(() => {
                if (this.loadingLabel) this.loadingLabel.node.active = false;
            }, 2000);
        }
    }

    async loadPlayerDataCore(gm: any) {
        try {
            const result = await gm.networkManager.request('/player/info');
            console.log('玩家数据:', JSON.stringify(result));

            if (result && result.code === 200 && result.data) {
                const p = result.data;

                // 确保数字字段是number类型，防止字符串拼接
                p.gold = Number(p.gold) || 0;
                p.gold_paper = Number(p.gold_paper) || 0;
                p.fruits = Number(p.fruits) || 0;
                p.incense_sticks = Number(p.incense_sticks) || 0;
                p.candles = Number(p.candles) || 0;
                p.mana = Number(p.mana) || 0;
                p.fragments = Number(p.fragments) || 0;
                p.level = Number(p.level) || 1;
                p.exp = Number(p.exp) || 0;
                p.merit = Number(p.merit) || 0;
                p.reputation = Number(p.reputation) || 0;
                p.faith = Number(p.faith) || 0;
                p.temple_storage = Number(p.temple_storage) || 0;

                // 保存到 networkManager.playerData
                gm.networkManager.playerData = p;

                // 更新法力恢复速度（从服务端获取）
                if (p.manaRegenPerHour) {
                    gm.networkManager.manaRegenPerHour = p.manaRegenPerHour;
                    // 同时重新设置恢复间隔
                    const newIntervalMs = Math.floor(3600000 / p.manaRegenPerHour);
                    if (this._manaRegenInterval) {
                        clearInterval(this._manaRegenInterval);
                    }
                    const self = this;
                    this._manaRegenInterval = setInterval(() => {
                        const gmInner = GameManager.instance;
                        const pInner = gmInner?.networkManager?.playerData;
                        if (pInner && pInner.mana < 100) {
                            pInner.mana = Math.min(100, pInner.mana + 1);
                            if (self.manaLabel) {
                                self.manaLabel.string = '法力 ' + Math.floor(pInner.mana) + '/100';
                            }
                        }
                        if (gmInner?.networkManager?.playerData) {
                            gmInner.networkManager.syncData(gmInner.networkManager.playerData).catch(() => {});
                        }
                    }, newIntervalMs);
                }

                if (this.loadingLabel) this.loadingLabel.node.active = false;

                if (this.nicknameLabel) {
                    this.nicknameLabel.string = p.nickname || '玩家';
                }
                if (this.levelLabel) {
                    this.levelLabel.string = '等级: ' + (p.level || 1);
                }
                if (this.goldLabel) {
                    this.goldLabel.string = '香火钱 ' + (p.gold || 0);
                }
                if (this.yuanbaoLabel) {
                    this.yuanbaoLabel.string = '元宝×' + (p.yuanbao || 0);
                }
                if (this.meritLabel) {
                    this.meritLabel.string = '功德×' + (p.merit || 0);
                }
                if (this.manaLabel) {
                    this.manaLabel.string = '法力 ' + Math.floor(p.mana || 0) + '/100';
                }
                if (this.levelLabel) {
                    this.levelLabel.string = '等级 Lv.' + (p.level || 1);
                }
                if (this.realmLabel) {
                    this.realmLabel.string = '境界·' + (p.realm_name || '凡人');
                }

                // 检查是否需要显示时辰选择或开财门
                this.checkAndShowDailyPanels(p);
                
                // 更新财神庇佑显示
                this.updateBlessingDisplay();

                // 从服务端更新化缘区域门槛
                try {
                    const almsStatus = await gm.networkManager.request('/alms/status');
                    if (almsStatus && almsStatus.code === 200 && almsStatus.data && almsStatus.data.areas) {
                        const serverAreas = almsStatus.data.areas;
                        for (let i = 0; i < this._areas.length; i++) {
                            const sa = serverAreas[this._areas[i].id];
                            if (sa && sa.threshold !== undefined) {
                                this._areas[i].threshold = sa.threshold;
                            }
                        }
                    }
                } catch (e) {
                    console.error('更新化缘门槛失败:', e);
                }
            } else {
                if (this.loadingLabel) this.loadingLabel.string = '数据加载失败';
            }
        } catch(e: any) {
            console.error('加载出错:', e);
            if (this.loadingLabel) this.loadingLabel.string = '加载出错';
        }
    }

    // 显示设置面板
    showSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.active = true;
        }
    }

    // 隐藏设置面板
    hideSettings() {
        if (this.settingsPanel) {
            this.settingsPanel.active = false;
        }
    }

    // 邀请按钮点击
    onInviteClicked() {
        if (this._inviteComp) {
            this._inviteComp.show();
        }
    }

    // 好友按钮点击
    onFriendClicked() {
        if (this._friendComp) {
            this._friendComp.show();
        }
    }

    // 邮件按钮点击
    onMailClicked() {
        if (this._mailComp) {
            this._mailComp.show();
        }
    }

    // 装饰按钮点击
    onDecorClicked() {
        if (this._decorComp) {
            this._decorComp.show();
        }
    }

    // 玩家信息按钮点击
    onPlayerInfoBtnClicked() {
        if (this.playerInfoPanel) {
            this.playerInfoPanel.active = true;
            this.updatePlayerInfoPanel();
        }
    }

    // 玩家信息面板关闭按钮
    onPlayerInfoCloseBtnClicked() {
        if (this.playerInfoPanel) {
            this.playerInfoPanel.active = false;
        }
    }

    // 更新玩家信息面板内容
    updatePlayerInfoPanel() {
        const gm = GameManager.instance;
        const p = gm?.networkManager?.playerData;
        if (!p) return;

        if (this.playerIdValue) this.playerIdValue.string = '玩家ID：' + (p.player_id || 0);
        if (this.nicknameValue) this.nicknameValue.string = '昵称：' + (p.nickname || '-');
        if (this.levelValue) this.levelValue.string = '等级：Lv.' + (p.level || 1);
        if (this.realmValue) this.realmValue.string = '境界：' + (p.realm_name || p.realm || '-');
        if (this.shanyuanValue) this.shanyuanValue.string = '善缘：' + (p.faith || 0);
        if (this.reputationValue) this.reputationValue.string = '声望：' + (p.reputation || 0);
        if (this.fragmentValue) this.fragmentValue.string = '碎片：' + (p.fragments || 0);
        if (this.bannerValue) this.bannerValue.string = '招财幡：' + (p.banners || 0);
        if (this.signDayValue) this.signDayValue.string = '签到天数：' + (p.sign_streak || 0);
        
        this.updateBlessingDisplay();
    }
    
    // 财神名称映射
    private _godNames: { [id: string]: string } = {
        'tudigong': '土地公',
        'guanyu': '关羽',
        'yaoshaosi': '姚少司',
        'chenjiugong': '陈九公',
        'fanli': '范蠡',
        'caobao': '曹宝',
        'liuhai': '刘海',
        'xiaosheng': '萧升',
        'zhaogongming': '赵公明'
    };
    
    // 更新财神庇佑显示（多行格式）
    updateBlessingDisplay() {
        const gm = GameManager.instance;
        const p = gm?.networkManager?.playerData;
        if (!p || !this.blessingLabel) return;
        
        // deity_buff可能是JSON字符串，需要解析
        let deityBuff = p.deity_buff;
        if (typeof deityBuff === 'string') {
            try {
                deityBuff = JSON.parse(deityBuff);
            } catch (e) {
                deityBuff = {};
            }
        }
        deityBuff = deityBuff || {};
        
        // 构建多行显示字符串
        const lines: string[] = ['财神庇佑'];  // 第一行标题
        for (const godId in deityBuff) {
            const count = deityBuff[godId].count || 0;
            if (count > 0) {
                const name = this._godNames[godId] || godId;
                lines.push(`${name}: ${count}次`);
            }
        }
        
        if (lines.length > 1) {
            this.blessingLabel.string = lines.join('\n');
        } else {
            this.blessingLabel.string = '财神庇佑\n无庇佑';
        }
    }
    
    // 更新香火钱显示（供奉后调用）
    updateMoney() {
        const gm = GameManager.instance;
        const p = gm?.networkManager?.playerData;
        if (!p) return;
        if (this.goldLabel) {
            this.goldLabel.string = '香火钱 ' + (p.gold || p.money || 0);
        }
    }

    // 更新等级显示（庙宇升级后调用）
    updateLevel() {
        const gm = GameManager.instance;
        const p = gm?.networkManager?.playerData;
        if (!p) return;
        if (this.levelLabel) {
            this.levelLabel.string = '等级 Lv.' + (p.level || 1);
        }
    }
    
    // 更新功德显示（供奉后调用）
    updateMerit() {
        const gm = GameManager.instance;
        const p = gm?.networkManager?.playerData;
        if (!p) return;
        if (this.meritLabel) {
            this.meritLabel.string = '功德×' + (p.merit || 0);
        }
    }

    // 显示新手引导
    showGuide() {
        if (this._guideComp) {
            this._guideComp.show(() => {
                console.log('新手引导完成');
            });
        }
    }

    // 设置按钮点击
    onSettingsBtnClicked() {
        if (this.settingsPanel?.active) {
            this.hideSettings();
        } else {
            this.showSettings();
        }
    }
}
