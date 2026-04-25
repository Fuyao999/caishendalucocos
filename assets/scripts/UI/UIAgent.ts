import { _decorator, Component, Node, Label, Button, EditBox, Sprite, Color, UITransform, ScrollView, Layout } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIAgent')
export class UIAgent extends Component {
    
    // === 面板节点 ===
    @property(Node)
    agentPanel: Node = null;
    
    // 两种状态容器
    @property(Node)
    nonAgentContainer: Node = null;
    
    @property(Node)
    agentContainer: Node = null;
    
    // 子面板
    @property(Node)
    activatePanel: Node = null;
    
    @property(Node)
    dataPanel: Node = null;
    
    @property(Node)
    teamPanel: Node = null;
    
    @property(Node)
    teamDetailPanel: Node = null;
    
    @property(Node)
    incomePanel: Node = null;
    
    @property(Node)
    withdrawPanel: Node = null;
    
    // === NonAgentContainer 节点 ===
    @property(Button)
    becomeAgentBtn: Button = null;
    
    // === AgentContainer 节点 ===
    @property(Button)
    myDataBtn: Button = null;
    
    @property(Button)
    myTeamBtn: Button = null;
    
    @property(Button)
    myIncomeBtn: Button = null;
    
    // === ActivatePanel 节点 ===
    @property(EditBox)
    codeEditBox: EditBox = null;
    
    @property(EditBox)
    inviteEditBox: EditBox = null;
    
    @property(Button)
    activateBtn: Button = null;
    
    @property(Button)
    activateBackBtn: Button = null;
    
    // === DataPanel 节点 ===
    @property(Button)
    dataBackBtn: Button = null;
    
    @property(Label)
    levelLabel: Label = null;
    
    @property(Label)
    inviteCodeLabel: Label = null;
    
    @property(Button)
    copyCodeBtn: Button = null;
    
    @property(Label)
    agentTimeLabel: Label = null;
    
    @property(Label)
    currentBenefitsLabel: Label = null;
    
    @property(Label)
    nextConditionLabel: Label = null;
    
    @property(Label)
    nextBenefitsLabel: Label = null;
    
    // === TeamPanel 节点 ===
    @property(Button)
    teamBackBtn: Button = null;
    
    @property(Button)
    level1Btn: Button = null;
    
    @property(Label)
    level1CountLabel: Label = null;
    
    @property(Button)
    level2Btn: Button = null;
    
    @property(Label)
    level2CountLabel: Label = null;
    
    @property(Label)
    totalLabel: Label = null;
    
    @property(Node)
    teamCustomerListNode: Node = null;
    
    // === TeamDetailPanel 节点 ===
    @property(Button)
    teamDetailBackBtn: Button = null;
    
    @property(Label)
    teamDetailTitleLabel: Label = null;
    
    @property(Node)
    teamDetailCustomerListNode: Node = null;
    
    // === IncomePanel 节点 ===
    @property(Button)
    incomeBackBtn: Button = null;
    
    @property(Label)
    totalIncomeLabel: Label = null;
    
    @property(Label)
    withdrawnLabel: Label = null;
    
    @property(Label)
    unwithdrawnLabel: Label = null;
    
    @property(Label)
    withDrawingLabel: Label = null;
    
    @property(EditBox)
    startDateEditBox: EditBox = null;
    
    @property(EditBox)
    endDateEditBox: EditBox = null;
    
    @property(Button)
    queryBtn: Button = null;
    
    @property(Label)
    queryResultLabel: Label = null;
    
    @property(Button)
    incomeWithdrawBtn: Button = null;
    
    // === WithdrawPanel 节点 ===
    @property(Button)
    withdrawBackBtn: Button = null;
    
    @property(Label)
    availableLabel: Label = null;
    
    @property(EditBox)
    amountEditBox: EditBox = null;
    
    @property(Button)
    submitBtn: Button = null;
    
    @property(Button)
    recordBtn: Button = null;
    
    @property(Label)
    rulesLabel: Label = null;
    
    @property(Label)
    serviceLabel: Label = null;
    
    // 关闭按钮
    @property(Button)
    closeBtn: Button = null;

    // 提示文字
    @property(Label)
    messageLabel: Label = null;

    // 代理数据
    private _agentData: any = null;
    private _isAgent: boolean = false;
    
    start() {
        console.log('UIAgent start');
        this.initPanels();
        this.hide();
        this.bindEvents();
    }

    // 初始化面板状态
    initPanels() {
        // 默认显示非代理界面
        if (this.nonAgentContainer) this.nonAgentContainer.active = true;
        if (this.agentContainer) this.agentContainer.active = false;
        // 隐藏所有子面板
        this.hideAllSubPanels();
    }
    
    show() {
        if (this.agentPanel) {
            this.agentPanel.active = true;
            this.loadAgentData();
        }
    }
    
    hide() {
        if (this.agentPanel) {
            this.agentPanel.active = false;
        }
    }
    
    // 绑定所有按钮事件
    bindEvents() {
        // 关闭按钮
        if (this.closeBtn) {
            this.closeBtn.node.on(Node.EventType.TOUCH_END, () => this.hide());
        }

        // NonAgentContainer
        if (this.becomeAgentBtn) {
            this.becomeAgentBtn.node.on(Node.EventType.TOUCH_END, () => this.showActivatePanel());
        }
        
        // AgentContainer
        if (this.myDataBtn) {
            this.myDataBtn.node.on(Node.EventType.TOUCH_END, () => this.showDataPanel());
        }
        if (this.myTeamBtn) {
            this.myTeamBtn.node.on(Node.EventType.TOUCH_END, () => this.showTeamPanel());
        }
        if (this.myIncomeBtn) {
            this.myIncomeBtn.node.on(Node.EventType.TOUCH_END, () => this.showIncomePanel());
        }
        
        // ActivatePanel
        if (this.activateBtn) {
            this.activateBtn.node.on(Node.EventType.TOUCH_END, () => this.doActivate());
        }
        if (this.activateBackBtn) {
            this.activateBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showMainPanel());
        }
        
        // DataPanel
        if (this.dataBackBtn) {
            this.dataBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showMainPanel());
        }
        if (this.copyCodeBtn) {
            this.copyCodeBtn.node.on(Node.EventType.TOUCH_END, () => this.copyInviteCode());
        }
        
        // TeamPanel
        if (this.teamBackBtn) {
            this.teamBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showMainPanel());
        }
        if (this.level1Btn) {
            this.level1Btn.node.on(Node.EventType.TOUCH_END, () => this.showTeamDetail(1));
        }
        if (this.level2Btn) {
            this.level2Btn.node.on(Node.EventType.TOUCH_END, () => this.showTeamDetail(2));
        }
        
        // TeamDetailPanel
        if (this.teamDetailBackBtn) {
            this.teamDetailBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showTeamPanel());
        }
        
        // IncomePanel
        if (this.incomeBackBtn) {
            this.incomeBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showMainPanel());
        }
        if (this.queryBtn) {
            this.queryBtn.node.on(Node.EventType.TOUCH_END, () => this.querySales());
        }
        if (this.incomeWithdrawBtn) {
            this.incomeWithdrawBtn.node.on(Node.EventType.TOUCH_END, () => this.showWithdrawPanel());
        }
        
        // WithdrawPanel
        if (this.withdrawBackBtn) {
            this.withdrawBackBtn.node.on(Node.EventType.TOUCH_END, () => this.showIncomePanel());
        }
        if (this.submitBtn) {
            this.submitBtn.node.on(Node.EventType.TOUCH_END, () => this.doWithdraw());
        }
        if (this.recordBtn) {
            this.recordBtn.node.on(Node.EventType.TOUCH_END, () => this.showWithdrawRecords());
        }
    }
    
    // 加载代理数据
    async loadAgentData() {
        try {
            const gm = GameManager.instance;
            const token = gm.networkManager.getToken();
            console.log('loadAgentData token:', token ? '有token' : '无token');
            
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/my-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include'
            });
            const data = await response.json();
            console.log('loadAgentData response:', JSON.stringify(data));
            
            if (data.code === 0) {
                this._agentData = data.data;
                this._isAgent = data.data.is_agent;
                console.log('agent data loaded, is_agent:', this._isAgent);
            } else {
                console.log('API返回错误:', data.message, 'code:', data.code);
                // 默认不是代理
                this._isAgent = false;
            }
            this.updateUI();
        } catch (e) {
            console.error('加载代理数据失败:', e);
        }
    }
    
    // 更新UI显示
    updateUI() {
        console.log('updateUI called, _isAgent:', this._isAgent);
        if (this._isAgent) {
            this.showMainPanel();
        } else {
            this.showNonAgentPanel();
        }
    }
    
    // 显示非代理面板
    showNonAgentPanel() {
        this.hideAllSubPanels();
        if (this.nonAgentContainer) {
            this.nonAgentContainer.active = true;
        }
        if (this.agentContainer) {
            this.agentContainer.active = false;
        }
    }
    
    // 显示代理主面板（三种选择）
    showMainPanel() {
        this.hideAllSubPanels();
        if (this.nonAgentContainer) {
            this.nonAgentContainer.active = false;
        }
        if (this.agentContainer) {
            this.agentContainer.active = true;
        }
    }
    
    // 隐藏所有子面板
    hideAllSubPanels() {
        const panels = [
            this.activatePanel,
            this.dataPanel,
            this.teamPanel,
            this.teamDetailPanel,
            this.incomePanel,
            this.withdrawPanel
        ];
        
        panels.forEach(panel => {
            if (panel) panel.active = false;
        });
    }
    
    // 显示激活面板
    showActivatePanel() {
        this.hideAllSubPanels();
        if (this.activatePanel) {
            this.activatePanel.active = true;
        }
        // 清空输入框
        if (this.codeEditBox) this.codeEditBox.string = '';
        if (this.inviteEditBox) this.inviteEditBox.string = '';
    }
    
    // 执行激活
    async doActivate() {
        const code = this.codeEditBox?.string?.trim() || '';
        const invite = this.inviteEditBox?.string?.trim() || '';
        
        if (!code && !invite) {
            this.showToast('请输入激活码和邀请码');
            return;
        }
        if (!code) {
            this.showToast('请输入激活码');
            return;
        }
        if (!invite) {
            this.showToast('请输入邀请码');
            return;
        }
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/activate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gm.networkManager.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ activation_code: code, invite_code: invite })
            });
            const data = await response.json();
            
            if (data.code === 0) {
                console.log('激活成功');
                this.showToast('激活成功');
                this.loadAgentData();
            } else {
                console.log('激活失败:', data.message);
                const msg = data.message || '';
                // 根据错误信息显示更友好的提示
                if (msg.includes('激活码') || msg.includes('无效') || msg.includes('已使用')) {
                    this.showToast('请输入有效激活码');
                } else if (msg.includes('邀请码') || msg.includes('邀请')) {
                    this.showToast('请输入有效邀请码');
                } else {
                    this.showToast(msg || '激活失败');
                }
            }
        } catch (e) {
            console.error('激活失败:', e);
        }
    }
    
    // 显示我的资料面板
    showDataPanel() {
        this.hideAllSubPanels();
        if (this.dataPanel) {
            this.dataPanel.active = true;
        }
        
        if (this._agentData) {
            const d = this._agentData;
            
            // 等级
            if (this.levelLabel) {
                this.levelLabel.string = `等级 Lv.${d.level || 1}`;
            }
            
            // 邀请码
            if (this.inviteCodeLabel) {
                this.inviteCodeLabel.string = `邀请码：${d.invitation_code || '-'}`;
            }
            
            // 成为代理时间
            if (this.agentTimeLabel) {
                const time = d.agent_activated_at ? new Date(d.agent_activated_at).toLocaleString() : '-';
                this.agentTimeLabel.string = `成为代理时间：${time}`;
            }
            
            // 当前权益
            if (this.currentBenefitsLabel) {
                this.currentBenefitsLabel.string = `当前权益：${d.current_benefits || '-'}`;
            }
            
            // 下一级条件
            if (this.nextConditionLabel) {
                this.nextConditionLabel.string = `下一级还差：${d.next_level_condition || '-'}`;
            }
            
            // 下一级权益
            if (this.nextBenefitsLabel) {
                this.nextBenefitsLabel.string = `下一级权益：${d.next_level_benefits || '-'}`;
            }
        }
    }
    
    // 复制邀请码
    copyInviteCode() {
        const code = this._agentData?.invitation_code || '';
        if (code && navigator.clipboard) {
            navigator.clipboard.writeText(code).then(() => {
                this.showToast('邀请码已复制');
            });
        }
    }
    
    // 显示我的团队面板
    showTeamPanel() {
        this.hideAllSubPanels();
        if (this.teamPanel) {
            this.teamPanel.active = true;
        }
        
        if (this._agentData) {
            const d = this._agentData;
            
            if (this.level1CountLabel) {
                this.level1CountLabel.string = `${d.level1_count || 0}人`;
            }
            if (this.level2CountLabel) {
                this.level2CountLabel.string = `${d.level2_count || 0}人`;
            }
            if (this.totalLabel) {
                this.totalLabel.string = `总客户数：${d.total_customer || 0}`;
            }
        }
    }
    
    // 显示团队详情
    async showTeamDetail(level: number) {
        this.hideAllSubPanels();
        if (this.teamDetailPanel) {
            this.teamDetailPanel.active = true;
        }
        
        if (this.teamDetailTitleLabel) {
            this.teamDetailTitleLabel.string = `${level}级客户列表`;
        }
        
        // 清空列表
        this.clearCustomerList(this.teamDetailCustomerListNode);
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/team-detail?level=${level}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.networkManager.getToken()}`
                }
            });
            const data = await response.json();
            
            if (data.code === 0 && data.data) {
                this.renderCustomerList(this.teamDetailCustomerListNode, data.data);
            }
        } catch (e) {
            console.error('加载团队详情失败:', e);
        }
    }
    
    // 清空客户列表
    clearCustomerList(listNode: Node) {
        if (listNode) {
            listNode.removeAllChildren();
        }
    }
    
    // 渲染客户列表
    renderCustomerList(listNode: Node, customers: any[]) {
        if (!listNode || !customers) return;
        
        customers.forEach(customer => {
            const item = new Node('CustomerItem');
            item.setParent(listNode);
            
            const transform = item.addComponent(UITransform);
            transform.setContentSize(400, 60);
            
            // 头像
            const avatar = new Node('Avatar');
            avatar.setParent(item);
            avatar.setPosition(-170, 0, 0);
            const avatarSprite = avatar.addComponent(Sprite);
            
            // 昵称
            const nickname = new Node('Nickname');
            nickname.setParent(item);
            nickname.setPosition(-120, 0, 0);
            const nicknameLabel = nickname.addComponent(Label);
            nicknameLabel.string = customer.nickname || '-';
            nicknameLabel.fontSize = 14;
            
            // 玩家ID
            const playerId = new Node('PlayerId');
            playerId.setParent(item);
            playerId.setPosition(-50, 0, 0);
            const playerIdLabel = playerId.addComponent(Label);
            playerIdLabel.string = `ID:${customer.player_id || '-'}`;
            playerIdLabel.fontSize = 12;
            
            // 加入时间
            const joinTime = new Node('JoinTime');
            joinTime.setParent(item);
            joinTime.setPosition(40, 0, 0);
            const joinTimeLabel = joinTime.addComponent(Label);
            joinTimeLabel.string = customer.join_time || '-';
            joinTimeLabel.fontSize = 12;
            
            // 订单数
            const orderCount = new Node('OrderCount');
            orderCount.setParent(item);
            orderCount.setPosition(100, 0, 0);
            const orderCountLabel = orderCount.addComponent(Label);
            orderCountLabel.string = `订单:${customer.order_count || 0}`;
            orderCountLabel.fontSize = 12;
            
            // 客户数
            const customerCount = new Node('CustomerCount');
            customerCount.setParent(item);
            customerCount.setPosition(160, 0, 0);
            const customerCountLabel = customerCount.addComponent(Label);
            customerCountLabel.string = `客户:${customer.customer_count || 0}`;
            customerCountLabel.fontSize = 12;
            
            // 订单总额
            const orderTotal = new Node('OrderTotal');
            orderTotal.setParent(item);
            orderTotal.setPosition(220, 0, 0);
            const orderTotalLabel = orderTotal.addComponent(Label);
            orderTotalLabel.string = `总额:${customer.order_total || 0}`;
            orderTotalLabel.fontSize = 12;
        });
    }
    
    // 显示我的收入面板
    showIncomePanel() {
        this.hideAllSubPanels();
        if (this.incomePanel) {
            this.incomePanel.active = true;
        }
        
        if (this._agentData) {
            const d = this._agentData;
            
            if (this.totalIncomeLabel) {
                this.totalIncomeLabel.string = `累计收入：${d.total_income || 0}`;
            }
            if (this.withdrawnLabel) {
                this.withdrawnLabel.string = `已提现：${d.withdrawn || 0}`;
            }
            if (this.unwithdrawnLabel) {
                this.unwithdrawnLabel.string = `未提现：${d.unwithdrawn || 0}`;
            }
            if (this.withDrawingLabel) {
                this.withDrawingLabel.string = `提现中：${d.withdrawing || 0}`;
            }
        }
    }
    
    // 查询销售额
    async querySales() {
        const startDate = this.startDateEditBox?.string?.trim() || '';
        const endDate = this.endDateEditBox?.string?.trim() || '';
        
        if (!startDate || !endDate) {
            this.showToast('请输入起止日期');
            return;
        }
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/sales?start=${startDate}&end=${endDate}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.networkManager.getToken()}`
                }
            });
            const data = await response.json();
            
            if (data.code === 0 && this.queryResultLabel) {
                this.queryResultLabel.string = `查询结果：${data.data.total || 0}`;
            }
        } catch (e) {
            console.error('查询销售额失败:', e);
        }
    }
    
    // 显示提现面板
    showWithdrawPanel() {
        this.hideAllSubPanels();
        if (this.withdrawPanel) {
            this.withdrawPanel.active = true;
        }
        
        if (this.availableLabel) {
            this.availableLabel.string = `可提现金额：${this._agentData?.available_amount || 0}`;
        }
        if (this.rulesLabel) {
            this.rulesLabel.string = '提现规则：满100元可提现，每月限提3次';
        }
        if (this.serviceLabel) {
            this.serviceLabel.string = '联系客服：caishen_admin';
        }
        
        if (this.amountEditBox) {
            this.amountEditBox.string = '';
        }
    }
    
    // 执行提现
    async doWithdraw() {
        const amount = this.amountEditBox?.string?.trim() || '';
        
        if (!amount) {
            this.showToast('请输入提现金额');
            return;
        }
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/withdraw`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${gm.networkManager.getToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: parseFloat(amount) })
            });
            const data = await response.json();
            
            if (data.code === 0) {
                this.showToast('提现申请已提交');
                this.showIncomePanel();
            } else {
                this.showToast(data.message || '提现失败');
            }
        } catch (e) {
            console.error('提现失败:', e);
        }
    }
    
    // 显示提现记录（待实现）
    showWithdrawRecords() {
        console.log('显示提现记录');
        this.showToast('功能开发中');
    }
    
    // 显示提示
    showToast(message: string) {
        if (this.messageLabel) {
            this.messageLabel.string = message;
            this.messageLabel.node.active = true;
            // 确保显示在最上层
            this.messageLabel.node.setSiblingIndex(9999);
            
            // 2秒后自动隐藏
            this.scheduleOnce(() => {
                if (this.messageLabel) {
                    this.messageLabel.node.active = false;
                }
            }, 2);
        } else {
            console.log('Toast:', message);
        }
    }
}
