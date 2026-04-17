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

@ccclass('UITemple')
export class UITemple extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    templePanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(Label)
    outputLabel: Label = null;
    
    @property(Label)
    storageValueLabel: Label = null;
    
    @property(Button)
    collectBtn: Button = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    start() {
        console.log('UITemple start');
        this.bindButtonEvents();
        this.hide();
        console.log('UITemple 初始化完成');
    }
    
    // 绑定按钮事件
    bindButtonEvents() {
        console.log('绑定庙宇面板按钮事件...');
        
        if (this.collectBtn) {
            this.collectBtn.node.on('click', this.onCollectClicked, this);
        }
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
    }
    
    // 更新显示
    updateDisplay(playerData: any) {
        if (!playerData) return;
        
        const level = playerData.level || 1;
        // 后端返回 temple_storage（下划线）
        const templeStorage = playerData.temple_storage || 0;
        const temple = TEMPLE_DATA[level] || TEMPLE_DATA[1];
        
        // 更新等级显示
        if (this.levelLabel) {
            this.levelLabel.string = `🏛️ ${temple.stage} Lv.${level}`;
        }
        
        // 更新产出显示
        if (this.outputLabel) {
            this.outputLabel.string = `24h产出 ${temple.output} | 上限 ${temple.storage} | 修缮 -${temple.repair}/h`;
        }
        
        // 更新存储金额
        if (this.storageValueLabel) {
            this.storageValueLabel.string = templeStorage.toLocaleString();
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
        
        // 后端返回 temple_storage（下划线）
        const templeStorage = playerData.temple_storage || 0;
        if (templeStorage <= 0) {
            console.log('庙宇存储为0，无需收取');
            if (this.storageValueLabel) {
                this.storageValueLabel.string = '0';
            }
            return;
        }
        
        // 调用后端 API 收取庙宇存储
        gm.networkManager.collectTempleStorage().then((result: any) => {
            console.log('收取结果:', result);
            // 后端返回 code: 200
            if (result.code === 200) {
                // 更新显示
                if (this.storageValueLabel) {
                    this.storageValueLabel.string = '0';
                }
                // 更新玩家金额（只是本地更新，刷新后会从服务器获取最新值）
                if (result.data && result.data.money !== undefined) {
                    playerData.money = result.data.money;
                    playerData.temple_storage = 0;
                }
            }
        }).catch((err: any) => {
            console.error('收取失败:', err);
        });
    }
    
    show(playerData: any) {
        console.log('=== UITemple show 被调用 ===');
        console.log('templePanel:', this.templePanel);
        console.log('playerData:', playerData);
        if (this.templePanel) {
            this.templePanel.active = true;
            console.log('templePanel 已设置为 active');
            this.updateDisplay(playerData);
        } else {
            console.error('templePanel 为 null!');
        }
    }
    
    hide() {
        if (this.templePanel) {
            this.templePanel.active = false;
        }
    }
}
