import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

interface CloudPlayer {
    playerId: number;
    nickname: string;
    level: number;
    templeStorage: number;
    reputation: number;
    hasShield: boolean;
    isRobot: boolean;
}

@ccclass('UITravel')
export class UITravel extends Component {

    // 编辑器绑定的节点
    @property(Node)
    travelPanel: Node = null;

    @property(Label)
    titleLabel: Label = null;

    @property(Label)
    remainLabel: Label = null;

    @property(Button)
    refreshBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    @property(Node)
    scrollContent: Node = null;

    @property(Node)
    areaItemTemplate: Node = null;

    @property(Node)
    cloudTourResultPanel: Node = null;

    @property(Label)
    resultTitleLabel: Label = null;

    @property(Label)
    resultContentLabel: Label = null;

    @property(Button)
    resultCloseBtn: Button = null;

    private _players: CloudPlayer[] = [];

    start() {
        console.log('UITravel start');
        if (this.refreshBtn) {
            this.refreshBtn.node.on('click', this.onRefreshClicked, this);
        }
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        if (this.resultCloseBtn) {
            this.resultCloseBtn.node.on('click', this.hideResultPanel, this);
        }
        if (this.cloudTourResultPanel) {
            this.cloudTourResultPanel.active = false;
        }
        this.hide();
    }

    show() {
        console.log('UITravel show');
        if (this.travelPanel) {
            this.travelPanel.active = true;
        }

        // 标题和标签位置由编辑器自行调整，代码不写死

        // 刷新按钮、列表容器、模板的XY位置由编辑器自行调整，代码不写死

        this.refreshList();
    }

    hide() {
        if (this.travelPanel) {
            this.travelPanel.active = false;
        }
    }

    hideResultPanel() {
        if (this.cloudTourResultPanel) {
            this.cloudTourResultPanel.active = false;
        }
    }

    showResultPanel(title: string, content: string) {
        if (this.resultTitleLabel) {
            this.resultTitleLabel.string = title;
        }
        if (this.resultContentLabel) {
            this.resultContentLabel.string = content;
        }
        if (this.cloudTourResultPanel) {
            this.cloudTourResultPanel.active = true;
        }
    }

    async refreshList() {
        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        try {
            const result = await gm.networkManager.request('/cloud-tour/list');
            if (result && result.code === 200) {
                this._players = result.data.players || [];
                this.renderList();
            } else {
                console.error('获取云游列表失败:', result);
            }
        } catch (e) {
            console.error('获取云游列表异常:', e);
        }
    }

    renderList() {
        if (!this.scrollContent || !this.areaItemTemplate) {
            console.error('scrollContent或areaItemTemplate为空:', !!this.scrollContent, !!this.areaItemTemplate);
            return;
        }

        // 清除旧的列表项
        this.scrollContent.removeAllChildren();

        console.log('开始渲染列表, 玩家数:', this._players.length);

        const itemHeight = 70;

        this._players.forEach((player, index) => {
            // 克隆模板
            const node = instantiate(this.areaItemTemplate);
            node.setParent(this.scrollContent);
            // Y 从上往下排，第一个在上方（scrollContent本地坐标，anchor是中间）
            // scrollContent高280，第一个在y=+140，每下一个减70
            const y = 140 - index * (itemHeight + 5);
            node.setPosition(0, y, 0);
            node.active = true;
            console.log('克隆节点, index:', index, 'y:', y, '子节点数:', node.children.length);

            // 更新子节点显示
            for (const child of node.children) {
                const label = child.getComponent(Label);
                const btn = child.getComponent(Button);
                const tf = child.getComponent(UITransform);

                if (child.name === 'ItemBg' && tf) {
                    tf.setContentSize(440, 60);
                    child.setPosition(0, 0, 0);
                } else if (child.name === 'NicknameLabel' && label && tf) {
                    label.string = player.nickname;
                    label.color = new Color(255, 215, 0); // 金色
                    tf.setContentSize(120, 20);
                    tf.setAnchorPoint(0, 0.5);
                    child.setPosition(-180, 15, 0);
                } else if (child.name === 'LevelLabel' && label && tf) {
                    label.string = 'Lv.' + player.level;
                    label.color = new Color(255, 255, 255);
                    tf.setContentSize(60, 20);
                    tf.setAnchorPoint(0, 0.5);
                    child.setPosition(-180, -5, 0);
                } else if (child.name === 'StorageLabel' && label && tf) {
                    label.string = '储量:' + this.formatMoney(player.templeStorage);
                    label.color = new Color(100, 200, 255);
                    tf.setContentSize(100, 20);
                    tf.setAnchorPoint(0, 0.5);
                    child.setPosition(-100, -5, 0);
                } else if (child.name === 'ShieldLabel' && label && tf) {
                    label.string = player.hasShield ? '🛡' : '❓';
                    label.color = player.hasShield ? new Color(80, 255, 80) : new Color(102, 102, 102);
                    tf.setContentSize(30, 20);
                    tf.setAnchorPoint(0, 0.5);
                    child.setPosition(10, -5, 0);
                } else if (child.name === 'AlmsBtn' && btn) {
                    btn.interactable = !player.hasShield;
                    // 找到按钮里的 Label
                    const btnLabel = btn.node.getComponentInChildren(Label);
                    if (btnLabel) {
                        btnLabel.string = player.hasShield ? '护盾中' : '化缘';
                        btnLabel.color = new Color(0, 0, 0);
                        btnLabel.fontSize = 22;
                    }
                    const btnTf = btn.node.getComponent(UITransform);
                    if (btnTf) {
                        btnTf.setContentSize(80, 30);
                        btnTf.setAnchorPoint(0.5, 0.5);
                    }
                    btn.node.setPosition(170, 0, 0);
                    btn.node.off('click');
                    btn.node.on('click', () => this.onAlmsClicked(player), this);
                } else if (child.name === 'FriendBtn' && btn) {
                    // 好友按钮
                    const btnLabel = btn.node.getComponentInChildren(Label);
                    if (btnLabel) {
                        btnLabel.string = '加好友';
                        btnLabel.color = new Color(0, 0, 0);
                        btnLabel.fontSize = 18;
                    }
                    const btnTf = btn.node.getComponent(UITransform);
                    if (btnTf) {
                        btnTf.setContentSize(60, 30);
                        btnTf.setAnchorPoint(0.5, 0.5);
                    }
                    btn.node.setPosition(80, 0, 0);
                    btn.node.off('click');
                    btn.node.on('click', () => this.onFriendBtnClicked(player), this);
                }
            }
        });
    }

    async onFriendBtnClicked(player: CloudPlayer) {
        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        try {
            const result = await gm.networkManager.request('/friend/add', {
                method: 'POST',
                body: JSON.stringify({ targetPlayerId: player.playerId })
            });

            if (result && result.code === 200) {
                this.showResultPanel('添加好友', `已成功添加 ${player.nickname} 为好友！`);
            } else {
                // 检查是否是"已在好友列表"的情况
                const msg = result?.message || '';
                if (msg.includes('已在好友列表') || msg.includes('已是好友')) {
                    this.showResultPanel('添加好友', '该玩家已在好友列表中');
                } else {
                    this.showResultPanel('添加失败', result?.message || '添加好友失败');
                }
            }
        } catch (e) {
            console.error('添加好友异常:', e);
            this.showResultPanel('添加失败', '网络错误');
        }
    }

    async onAlmsClicked(player: CloudPlayer) {
        if (player.hasShield) return;

        const gm = GameManager.instance;
        if (!gm?.networkManager) return;

        // 检查法力
        const mana = gm.networkManager.playerData?.mana || 0;
        const manaCost = 5;
        if (mana < manaCost) {
            this.showResultPanel('法力不足', `每次云游化缘需要${manaCost}点法力，当前只有${mana}点`);
            return;
        }

        try {
            const result = await gm.networkManager.request('/cloud-tour/alms', {
                method: 'POST',
                body: JSON.stringify({
                    targetPlayerId: player.playerId,
                    currentMana: gm.networkManager.playerData?.mana || 0
                })
            });

            if (result && result.code === 200) {
                // 更新本地数据显示
                player.templeStorage = result.data.newTempleStorage;
                this.renderList();

                // 更新玩家金币
                if (result.data.newGold !== undefined) {
                    gm.networkManager.playerData.gold = result.data.newGold;
                    // 刷新主界面金币显示
                    const goldLabel = gm.uiGame?.goldLabel;
                    if (goldLabel) {
                        goldLabel.string = '香火钱 ' + result.data.newGold;
                    }
                }

                // 更新玩家法力
                if (result.data.newMana !== undefined) {
                    gm.networkManager.playerData.mana = result.data.newMana;
                    // 刷新主界面法力显示
                    const manaLabel = gm.uiGame?.manaLabel;
                    if (manaLabel) {
                        manaLabel.string = '法力 ' + result.data.newMana + '/100';
                    }
                }

                // 显示结果面板
                const gain = result.data.almsAmount || 0;
                const name = result.data.targetName || '';
                // 碎片每次云游固定+1
                const fragGain = 1;
                let line1 = `向 ${name} 化缘成功！获得 ${Math.floor(gain)} 香火钱`;
                // 显示庇佑信息
                if (result.data.usedBlessing) {
                    const godNames: any = {
                        'tudigong': '土地公', 'guanyu': '关羽', 'yaoshaosi': '姚少司',
                        'chenjiugong': '陈九公', 'fanli': '范蠡', 'caobao': '曹宝',
                        'liuhai': '刘海', 'xiaosheng': '萧升', 'zhaogongming': '赵公明'
                    };
                    const godName = godNames[result.data.usedBlessing] || result.data.usedBlessing;
                    line1 += ` [${godName}庇佑+${Math.floor(result.data.blessingBonus * 100)}%]`;
                }
                const line2 = `功德 +5，碎片 +${fragGain}，声望 +1`;
                this.showResultPanel('云游化缘', line1 + '\n' + line2);
                
                // 更新玩家碎片显示
                if (result.data.newFragments !== undefined) {
                    gm.networkManager.playerData.fragments = result.data.newFragments;
                    // 更新主界面碎片显示
                    if (gm.uiGame && gm.uiGame.fragmentValue) {
                        gm.uiGame.fragmentValue.string = '碎片 ' + result.data.newFragments;
                    }
                }
                
                // 更新玩家声望显示
                if (result.data.newReputation !== undefined) {
                    gm.networkManager.playerData.reputation = result.data.newReputation;
                    if (gm.uiGame && gm.uiGame.reputationValue) {
                        gm.uiGame.reputationValue.string = '声望 ' + result.data.newReputation;
                    }
                }
                
                // 更新玩家功德显示
                if (result.data.newMerit !== undefined) {
                    gm.networkManager.playerData.merit = result.data.newMerit;
                    if (gm.uiGame && gm.uiGame.meritLabel) {
                        gm.uiGame.meritLabel.string = '功德×' + result.data.newMerit;
                    }
                }

                // 更新庇佑显示
                if (result.data.deityBuff) {
                    gm.networkManager.playerData.deity_buff = result.data.deityBuff;
                    if (gm.uiGame) {
                        gm.uiGame.updateBlessingDisplay?.();
                    }
                }

                console.log('云游化缘成功:', result.data);
            } else {
                console.error('云游化缘失败:', result);
                // 从错误消息里提取有用信息
                let errMsg = (result && result.message) || '化缘失败';
                try {
                    // 如果是JSON格式的错误，提取里面的message
                    const match = errMsg.match(/\{.*?"message":"([^"]+)".*\}/);
                    if (match) errMsg = match[1];
                } catch(e) {}
                this.showResultPanel('化缘失败', errMsg);
            }
        } catch (e) {
            console.error('云游化缘异常:', e);
        }
    }

    async onRefreshClicked() {
        // 刷新列表（免费）
        this.refreshList();
    }

    formatMoney(value: number): string {
        const v = Math.floor(value);
        if (v >= 100000000) {
            return Math.floor(v / 100000000) + '亿';
        } else if (v >= 10000) {
            return Math.floor(v / 10000) + '万';
        }
        return v.toString();
    }
}
