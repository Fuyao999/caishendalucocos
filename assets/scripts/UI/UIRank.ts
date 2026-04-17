import { _decorator, Component, Label, Button, Node, Sprite, Color, UITransform, ScrollView, Prefab, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIRank')
export class UIRank extends Component {
    
    // 编辑器绑定的节点
    @property(Node)
    rankPanel: Node = null;
    
    @property(Label)
    titleLabel: Label = null;
    
    @property(Button)
    closeBtn: Button = null;
    
    @property(Node)
    scrollContent: Node = null;
    
    @property(Node)
    rankItemTemplate: Node = null;
    
    // 标签页按钮
    @property(Node)
    tabGold: Node = null;
    
    @property(Node)
    tabMerit: Node = null;
    
    @property(Node)
    tabRepute: Node = null;
    
    @property(Node)
    tabShanYuan: Node = null;
    
    // 当前排行类型: gold, merit, repute, shanyuan
    private _currentRankType: string = 'gold';
    private _rankList: any[] = [];
    
    start() {
        console.log('UIRank start');
        if (this.closeBtn) {
            this.closeBtn.node.on('click', this.hide, this);
        }
        
        // 绑定标签页按钮事件
        if (this.tabGold) {
            this.tabGold.on('click', () => this.switchRankType('gold'), this);
        }
        if (this.tabMerit) {
            this.tabMerit.on('click', () => this.switchRankType('merit'), this);
        }
        if (this.tabRepute) {
            this.tabRepute.on('click', () => this.switchRankType('repute'), this);
        }
        if (this.tabShanYuan) {
            this.tabShanYuan.on('click', () => this.switchRankType('shanyuan'), this);
        }
        
        this.hide();
    }
    
    show() {
        console.log('UIRank show');
        if (this.rankPanel) {
            this.rankPanel.active = true;
            this.requestRankData();
        }
    }
    
    hide() {
        if (this.rankPanel) {
            this.rankPanel.active = false;
        }
    }
    
    switchRankType(type: string) {
        console.log('切换排行类型:', type);
        this._currentRankType = type;
        
        // 更新标题
        const titles: any = {
            'gold': '香火钱排行榜',
            'merit': '功德排行榜',
            'repute': '声望排行榜',
            'shanyuan': '善缘排行榜'
        };
        if (this.titleLabel) {
            this.titleLabel.string = titles[type] || '排行榜';
        }
        
        // 请求对应排行数据
        this.requestRankData();
    }
    
    async requestRankData() {
        console.log('请求排行榜数据, 类型:', this._currentRankType);
        const gm = GameManager.instance;
        if (gm && gm.networkManager) {
            try {
                const result = await gm.networkManager.getRankList();
                console.log('排行榜返回:', result);
                if (result.code === 200) {
                    // 根据类型排序
                    this._rankList = this.sortRankList(result.data || [], this._currentRankType);
                    this.updateRankList();
                }
            } catch(e) {
                console.error('获取排行榜失败:', e);
            }
        }
    }
    
    sortRankList(list: any[], type: string): any[] {
        // 复制数组避免修改原数据
        const sorted = [...list];
        
        switch(type) {
            case 'gold':
                sorted.sort((a, b) => (b.gold || 0) - (a.gold || 0));
                break;
            case 'merit':
                sorted.sort((a, b) => (b.merit || 0) - (a.merit || 0));
                break;
            case 'repute':
                sorted.sort((a, b) => (b.repute || 0) - (a.repute || 0));
                break;
            case 'shanyuan':
                sorted.sort((a, b) => (b.shanyuan || 0) - (a.shanyuan || 0));
                break;
            default:
                sorted.sort((a, b) => (b.gold || 0) - (a.gold || 0));
        }
        
        return sorted;
    }
    
    updateRankList() {
        console.log('排行榜数据:', this._rankList);
        
        // 清除旧的列表项
        if (this.scrollContent) {
            this.scrollContent.removeAllChildren();
        }
        
        if (!this.rankItemTemplate || !this.scrollContent) {
            console.error('缺少模板或容器');
            return;
        }
        
        const itemHeight = 50;
        
        // 设置 Content 高度
        const totalHeight = this._rankList.length * itemHeight;
        const contentTrans = this.scrollContent.getComponent(UITransform);
        if (contentTrans) {
            contentTrans.setContentSize(400, Math.max(totalHeight, 300));
        }
        
        this._rankList.forEach((player, index) => {
            // 克隆模板
            const item = instantiate(this.rankItemTemplate);
            item.setParent(this.scrollContent);
            item.setPosition(0, -index * itemHeight, 0);
            item.active = true;
            
            // 更新显示
            for (let i = 0; i < item.children.length; i++) {
                const child = item.children[i];
                const label = child.getComponent(Label);
                if (label) {
                    if (child.name === 'RankLabel') {
                        label.string = (index + 1).toString();
                    } else if (child.name === 'NameLabel') {
                        label.string = player.nickname || '玩家';
                    } else if (child.name === 'LevelLabel') {
                        label.string = 'Lv.' + (player.level || 1);
                    } else if (child.name === 'GoldLabel') {
                        // 根据当前类型显示对应数值
                        label.string = this.getRankValue(player, this._currentRankType);
                    }
                }
            }
        });
        
        console.log('列表创建完成');
        
        // 等待一帧后滚动到顶部
        this.scheduleOnce(() => {
            const scrollView = this.scrollContent?.parent?.getComponent(ScrollView);
            if (scrollView) {
                scrollView.scrollToTop();
            }
        }, 0.1);
    }
    
    getRankValue(player: any, type: string): string {
        let value = 0;
        switch(type) {
            case 'gold':
                value = player.gold || 0;
                break;
            case 'merit':
                value = player.merit || 0;
                break;
            case 'repute':
                value = player.repute || 0;
                break;
            case 'shanyuan':
                value = player.shanyuan || 0;
                break;
            default:
                value = player.gold || 0;
        }
        return this.formatMoney(value);
    }
    
    formatMoney(value: number): string {
        if (value >= 100000000) {
            return (value / 100000000).toFixed(1) + '亿';
        } else if (value >= 10000) {
            return (value / 10000).toFixed(1) + '万';
        }
        return value.toString();
    }
}