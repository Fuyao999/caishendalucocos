import { _decorator, Component, Node, Label, Button, Sprite, Color, UITransform, Prefab, instantiate } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('UIAgent')
export class UIAgent extends Component {
    
    @property(Node)
    agentPanel: Node = null;
    
    @property(Node)
    activateBtn: Node = null;
    
    @property(Node)
    myDataBtn: Node = null;
    
    @property(Node)
    myTeamBtn: Node = null;
    
    @property(Node)
    commissionBtn: Node = null;
    
    @property(Node)
    withdrawBtn: Node = null;
    
    @property(Node)
    contentNode: Node = null;
    
    @property(Prefab)
    agentDataItemPrefab: Node = null;
    
    private _isAgent: boolean = false;
    private _agentData: any = null;
    
    start() {
        console.log('UIAgent start');
        this.hide();
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
        this.clearContent();
    }
    
    clearContent() {
        if (this.contentNode) {
            this.contentNode.removeAllChildren();
        }
    }
    
    async loadAgentData() {
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/my-data`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.dataManager.get('token')}`
                },
                credentials: 'include'
            });
            const data = await response.json();
            
            if (data.code === 0) {
                this._agentData = data.data;
                this._isAgent = data.data.is_agent;
                this.updateUI();
            }
        } catch (e) {
            console.error('加载代理数据失败:', e);
        }
    }
    
    updateUI() {
        if (!this._isAgent) {
            this.showActivatePanel();
        } else {
            this.showMyDataPanel();
        }
    }
    
    // 显示激活面板
    showActivatePanel() {
        this.clearContent();
        
        // 创建激活表单
        const panel = new Node('ActivatePanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(500, 400);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        title.setPosition(0, 150, 0);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '激活代理功能';
        titleLabel.fontSize = 28;
        titleLabel.color = new Color(245, 166, 35);
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        // 说明
        const desc = new Node('Desc');
        desc.setParent(panel);
        desc.setPosition(0, 80, 0);
        const descLabel = desc.addComponent(Label);
        descLabel.string = '购买激活码后，输入激活码和推荐人邀请码即可解锁代理功能';
        descLabel.fontSize = 16;
        descLabel.color = new Color(170, 170, 170);
        descLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        descLabel.verticalAlign = Label.VerticalAlign.CENTER;
        const descTransform = desc.addComponent(UITransform);
        descTransform.setContentSize(450, 60);
        
        // 激活码输入提示
        const codeHint = new Node('CodeHint');
        codeHint.setParent(panel);
        codeHint.setPosition(-180, 10, 0);
        const codeHintLabel = codeHint.addComponent(Label);
        codeHintLabel.string = '激活码:';
        codeHintLabel.fontSize = 18;
        codeHintLabel.color = new Color(255, 255, 255);
        
        // 激活码输入框背景
        const codeInputBg = new Node('CodeInputBg');
        codeInputBg.setParent(panel);
        codeInputBg.setPosition(50, 10, 0);
        const codeInputBgSprite = codeInputBg.addComponent(Sprite);
        codeInputBgSprite.color = new Color(30, 30, 50);
        const codeInputBgTransform = codeInputBg.addComponent(UITransform);
        codeInputBgTransform.setContentSize(300, 40);
        
        // 激活码文字
        const codeText = new Node('CodeText');
        codeText.setParent(codeInputBg);
        codeText.setPosition(0, 0, 0);
        const codeTextLabel = codeText.addComponent(Label);
        codeTextLabel.string = 'XXXX-XXXX-XXXX-XXXX';
        codeTextLabel.fontSize = 16;
        codeTextLabel.color = new Color(100, 100, 100);
        
        // 推荐码输入提示
        const inviteHint = new Node('InviteHint');
        inviteHint.setParent(panel);
        inviteHint.setPosition(-180, -50, 0);
        const inviteHintLabel = inviteHint.addComponent(Label);
        inviteHintLabel.string = '推荐码:';
        inviteHintLabel.fontSize = 18;
        inviteHintLabel.color = new Color(255, 255, 255);
        
        // 推荐码输入框背景
        const inviteInputBg = new Node('InviteInputBg');
        inviteInputBg.setParent(panel);
        inviteInputBg.setPosition(50, -50, 0);
        const inviteInputBgSprite = inviteInputBg.addComponent(Sprite);
        inviteInputBgSprite.color = new Color(30, 30, 50);
        const inviteInputBgTransform = inviteInputBg.addComponent(UITransform);
        inviteInputBgTransform.setContentSize(300, 40);
        
        // 推荐码文字
        const inviteText = new Node('InviteText');
        inviteText.setParent(inviteInputBg);
        inviteText.setPosition(0, 0, 0);
        const inviteTextLabel = inviteText.addComponent(Label);
        inviteTextLabel.string = '5位邀请码（向代理索取）';
        inviteTextLabel.fontSize = 16;
        inviteTextLabel.color = new Color(100, 100, 100);
        
        // 激活按钮
        const activateBtn = new Node('ActivateBtn');
        activateBtn.setParent(panel);
        activateBtn.setPosition(0, -130, 0);
        const activateBtnSprite = activateBtn.addComponent(Sprite);
        activateBtnSprite.color = new Color(233, 69, 96);
        const activateBtnTransform = activateBtn.addComponent(UITransform);
        activateBtnTransform.setContentSize(200, 50);
        const activateBtnLabel = activateBtn.addComponent(Label);
        activateBtnLabel.string = '立即激活';
        activateBtnLabel.fontSize = 20;
        activateBtnLabel.color = new Color(255, 255, 255);
        activateBtnLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        const activateBtnComp = activateBtn.addComponent(Button);
        activateBtnComp.interactable = true;
        activateBtnComp.node.on('click', () => {
            // TODO: 弹出输入框让用户输入激活码和推荐码
            this.showToast('请在游戏内输入激活码和推荐码');
        }, this);
        
        // 返回按钮
        const backBtn = new Node('BackBtn');
        backBtn.setParent(panel);
        backBtn.setPosition(0, -200, 0);
        const backBtnSprite = backBtn.addComponent(Sprite);
        backBtnSprite.color = new Color(60, 60, 80);
        const backBtnTransform = backBtn.addComponent(UITransform);
        backBtnTransform.setContentSize(120, 40);
        const backBtnLabel = backBtn.addComponent(Label);
        backBtnLabel.string = '返回';
        backBtnLabel.fontSize = 16;
        backBtnLabel.color = new Color(200, 200, 200);
        backBtnLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        const backBtnComp = backBtn.addComponent(Button);
        backBtnComp.interactable = true;
        backBtnComp.node.on('click', () => this.hide(), this);
    }
    
    // 显示我的数据面板
    showMyDataPanel() {
        this.clearContent();
        
        if (!this._agentData) return;
        
        const data = this._agentData;
        
        // 创建我的数据面板
        const panel = new Node('MyDataPanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(600, 500);
        
        // 我的邀请码
        const inviteTitle = new Node('InviteTitle');
        inviteTitle.setParent(panel);
        inviteTitle.setPosition(-200, 220, 0);
        const inviteTitleLabel = inviteTitle.addComponent(Label);
        inviteTitleLabel.string = '我的邀请码:';
        inviteTitleLabel.fontSize = 18;
        inviteTitleLabel.color = new Color(255, 255, 255);
        
        const inviteCode = new Node('InviteCode');
        inviteCode.setParent(panel);
        inviteCode.setPosition(50, 220, 0);
        const inviteCodeLabel = inviteCode.addComponent(Label);
        inviteCodeLabel.string = data.invitation_code || '-';
        inviteCodeLabel.fontSize = 24;
        inviteCodeLabel.color = new Color(245, 166, 35);
        
        // 等级
        const levelTitle = new Node('LevelTitle');
        levelTitle.setParent(panel);
        levelTitle.setPosition(-200, 170, 0);
        const levelTitleLabel = levelTitle.addComponent(Label);
        levelTitleLabel.string = '代理等级:';
        levelTitleLabel.fontSize = 18;
        levelTitleLabel.color = new Color(255, 255, 255);
        
        const levelValue = new Node('LevelValue');
        levelValue.setParent(panel);
        levelValue.setPosition(50, 170, 0);
        const levelValueLabel = levelValue.addComponent(Label);
        levelValueLabel.string = `Lv.${data.level}`;
        levelValueLabel.fontSize = 24;
        levelValueLabel.color = new Color(245, 166, 35);
        
        // 直推单数
        const directTitle = new Node('DirectTitle');
        directTitle.setParent(panel);
        directTitle.setPosition(-200, 120, 0);
        const directTitleLabel = directTitle.addComponent(Label);
        directTitleLabel.string = '直推单数:';
        directTitleLabel.fontSize = 18;
        directTitleLabel.color = new Color(255, 255, 255);
        
        const directValue = new Node('DirectValue');
        directValue.setParent(panel);
        directValue.setPosition(50, 120, 0);
        const directValueLabel = directValue.addComponent(Label);
        directValueLabel.string = `${data.direct_orders} 单`;
        directValueLabel.fontSize = 20;
        directValueLabel.color = new Color(100, 200, 100);
        
        // 团队单数
        const teamTitle = new Node('TeamTitle');
        teamTitle.setParent(panel);
        teamTitle.setPosition(-200, 70, 0);
        const teamTitleLabel = teamTitle.addComponent(Label);
        teamTitleLabel.string = '团队单数:';
        teamTitleLabel.fontSize = 18;
        teamTitleLabel.color = new Color(255, 255, 255);
        
        const teamValue = new Node('TeamValue');
        teamValue.setParent(panel);
        teamValue.setPosition(50, 70, 0);
        const teamValueLabel = teamValue.addComponent(Label);
        teamValueLabel.string = `${data.team_orders} 单`;
        teamValueLabel.fontSize = 20;
        teamValueLabel.color = new Color(100, 200, 100);
        
        // 佣金统计
        const commissionTitle = new Node('CommissionTitle');
        commissionTitle.setParent(panel);
        commissionTitle.setPosition(-200, 10, 0);
        const commissionTitleLabel = commissionTitle.addComponent(Label);
        commissionTitleLabel.string = '佣金统计:';
        commissionTitleLabel.fontSize = 18;
        commissionTitleLabel.color = new Color(255, 255, 255);
        
        const commissionY = -40;
        
        const pendingTitle = new Node('PendingTitle');
        pendingTitle.setParent(panel);
        pendingTitle.setPosition(-180, commissionY, 0);
        const pendingTitleLabel = pendingTitle.addComponent(Label);
        pendingTitleLabel.string = '待发放:';
        pendingTitleLabel.fontSize = 14;
        pendingTitleLabel.color = new Color(180, 180, 180);
        
        const pendingValue = new Node('PendingValue');
        pendingValue.setParent(panel);
        pendingValue.setPosition(0, commissionY, 0);
        const pendingValueLabel = pendingValue.addComponent(Label);
        pendingValueLabel.string = `¥${(data.commission?.pending || 0).toFixed(2)}`;
        pendingValueLabel.fontSize = 16;
        pendingValueLabel.color = new Color(245, 166, 35);
        
        const settledTitle = new Node('SettledTitle');
        settledTitle.setParent(panel);
        settledTitle.setPosition(-180, commissionY - 30, 0);
        const settledTitleLabel = settledTitle.addComponent(Label);
        settledTitleLabel.string = '已结算:';
        settledTitleLabel.fontSize = 14;
        settledTitleLabel.color = new Color(180, 180, 180);
        
        const settledValue = new Node('SettledValue');
        settledValue.setParent(panel);
        settledValue.setPosition(0, commissionY - 30, 0);
        const settledValueLabel = settledValue.addComponent(Label);
        settledValueLabel.string = `¥${(data.commission?.settled || 0).toFixed(2)}`;
        settledValueLabel.fontSize = 16;
        settledValueLabel.color = new Color(100, 200, 100);
        
        // 升级进度
        if (data.upgrade_progress) {
            const progress = data.upgrade_progress;
            
            const progressTitle = new Node('ProgressTitle');
            progressTitle.setParent(panel);
            progressTitle.setPosition(-200, -120, 0);
            const progressTitleLabel = progressTitle.addComponent(Label);
            progressTitleLabel.string = `升级进度 (Lv.${progress.current_level} → Lv.${progress.next_level || '满级'}):`;
            progressTitleLabel.fontSize = 16;
            progressTitleLabel.color = new Color(245, 166, 35);
            
            let yPos = -160;
            for (const cond of progress.conditions || []) {
                const condText = new Node('CondText');
                condText.setParent(panel);
                condText.setPosition(-180, yPos, 0);
                const condLabel = condText.addComponent(Label);
                condLabel.string = `${cond.name}: ${cond.current}/${cond.required} ${cond.met ? '✅' : '❌'}`;
                condLabel.fontSize = 14;
                condLabel.color = cond.met ? new Color(100, 200, 100) : new Color(200, 100, 100);
                yPos -= 30;
            }
        }
        
        // 按钮区域
        const btnY = -280;
        
        // 我的团队按钮
        const teamBtn = this.createButton('我的团队', 0, btnY);
        teamBtn.setParent(panel);
        teamBtn.on('click', () => this.showMyTeamPanel(), this);
        
        // 佣金记录按钮
        const commBtn = this.createButton('佣金记录', 0, btnY - 60);
        commBtn.setParent(panel);
        commBtn.on('click', () => this.showCommissionPanel(), this);
        
        // 提现按钮
        const wdBtn = this.createButton('申请提现', 0, btnY - 120);
        wdBtn.setParent(panel);
        wdBtn.on('click', () => this.showWithdrawPanel(), this);
    }
    
    // 创建按钮辅助方法
    createButton(text: string, x: number, y: number): Node {
        const btn = new Node('Btn');
        btn.setParent(this.contentNode);
        btn.setPosition(x, y, 0);
        
        const sprite = btn.addComponent(Sprite);
        sprite.color = new Color(233, 69, 96);
        
        const transform = btn.addComponent(UITransform);
        transform.setContentSize(160, 45);
        
        const label = btn.addComponent(Label);
        label.string = text;
        label.fontSize = 18;
        label.color = new Color(255, 255, 255);
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        const button = btn.addComponent(Button);
        button.interactable = true;
        
        return btn;
    }
    
    // 显示我的团队面板
    async showMyTeamPanel() {
        this.clearContent();
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/my-team`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.dataManager.get('token')}`
                },
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.code === 0) {
                this.renderTeamPanel(result.data);
            }
        } catch (e) {
            console.error('加载团队数据失败:', e);
        }
    }
    
    renderTeamPanel(data: any) {
        const panel = new Node('TeamPanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(600, 500);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        title.setPosition(0, 220, 0);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '我的团队';
        titleLabel.fontSize = 24;
        titleLabel.color = new Color(245, 166, 35);
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        // 团队总订单
        const totalTitle = new Node('TotalTitle');
        totalTitle.setParent(panel);
        totalTitle.setPosition(-150, 170, 0);
        const totalTitleLabel = totalTitle.addComponent(Label);
        totalTitleLabel.string = '团队总订单:';
        totalTitleLabel.fontSize = 18;
        totalTitleLabel.color = new Color(255, 255, 255);
        
        const totalValue = new Node('TotalValue');
        totalValue.setParent(panel);
        totalValue.setPosition(80, 170, 0);
        const totalValueLabel = totalValue.addComponent(Label);
        totalValueLabel.string = `${data.team_total_orders} 单`;
        totalValueLabel.fontSize = 22;
        totalValueLabel.color = new Color(100, 200, 100);
        
        // 月度统计
        const monthTitle = new Node('MonthTitle');
        monthTitle.setParent(panel);
        monthTitle.setPosition(-150, 120, 0);
        const monthTitleLabel = monthTitle.addComponent(Label);
        monthTitleLabel.string = '月度统计:';
        monthTitleLabel.fontSize = 18;
        monthTitleLabel.color = new Color(255, 255, 255);
        
        let yPos = 80;
        for (const m of data.monthly_stats || []) {
            const monthText = new Node('MonthText');
            monthText.setParent(panel);
            monthText.setPosition(-150, yPos, 0);
            const monthLabel = monthText.addComponent(Label);
            monthLabel.string = `${m.month}: ${m.order_count}单 / ¥${m.total_amount.toFixed(2)}`;
            monthLabel.fontSize = 16;
            monthLabel.color = new Color(200, 200, 200);
            yPos -= 30;
        }
        
        // 返回按钮
        const backBtn = this.createButton('返回', 0, -200);
        backBtn.setParent(panel);
        backBtn.on('click', () => this.showMyDataPanel(), this);
    }
    
    // 显示佣金记录面板
    async showCommissionPanel() {
        this.clearContent();
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/commission-records?limit=50`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.dataManager.get('token')}`
                },
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.code === 0) {
                this.renderCommissionPanel(result.data);
            }
        } catch (e) {
            console.error('加载佣金记录失败:', e);
        }
    }
    
    renderCommissionPanel(records: any[]) {
        const panel = new Node('CommissionPanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(600, 500);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        title.setPosition(0, 220, 0);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '佣金记录';
        titleLabel.fontSize = 24;
        titleLabel.color = new Color(245, 166, 35);
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        let yPos = 170;
        for (const r of records || []) {
            const typeStr = r.type === 'base' ? (r.level === 1 ? '直推' : '间推') : '团队奖金';
            const statusStr = r.status === 'pending' ? '待发放' : r.status === 'settled' ? '已结算' : '已提现';
            
            const recordText = new Node('RecordText');
            recordText.setParent(panel);
            recordText.setPosition(0, yPos, 0);
            const recordLabel = recordText.addComponent(Label);
            recordLabel.string = `${typeStr} | ¥${parseFloat(r.amount).toFixed(2)} | ${statusStr} | ${r.created_at?.substring(0, 10) || '-'}`;
            recordLabel.fontSize = 14;
            recordLabel.color = new Color(200, 200, 200);
            yPos -= 30;
            
            if (yPos < -200) break;
        }
        
        // 返回按钮
        const backBtn = this.createButton('返回', 0, -220);
        backBtn.setParent(panel);
        backBtn.on('click', () => this.showMyDataPanel(), this);
    }
    
    // 显示提现面板
    async showWithdrawPanel() {
        this.clearContent();
        
        const panel = new Node('WithdrawPanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(600, 500);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        title.setPosition(0, 200, 0);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '申请提现';
        titleLabel.fontSize = 24;
        titleLabel.color = new Color(245, 166, 35);
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        // 提现说明
        const desc = new Node('Desc');
        desc.setParent(panel);
        desc.setPosition(0, 150, 0);
        const descLabel = desc.addComponent(Label);
        descLabel.string = '请联系客服申请提现\n客服将打款至您的账户';
        descLabel.fontSize = 16;
        descLabel.color = new Color(170, 170, 170);
        descLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        descLabel.verticalAlign = Label.VerticalAlign.CENTER;
        const descTransform = desc.addComponent(UITransform);
        descTransform.setContentSize(400, 60);
        
        // 申请按钮
        const applyBtn = this.createButton('联系客服', 0, 50);
        applyBtn.setParent(panel);
        applyBtn.on('click', () => {
            this.showToast('请联系客服微信: caishen_admin');
        }, this);
        
        // 提现记录按钮
        const recordsBtn = this.createButton('提现记录', 0, -10);
        recordsBtn.setParent(panel);
        recordsBtn.on('click', () => this.showWithdrawRecordsPanel(), this);
        
        // 返回按钮
        const backBtn = this.createButton('返回', 0, -100);
        backBtn.setParent(panel);
        backBtn.on('click', () => this.showMyDataPanel(), this);
    }
    
    // 显示提现记录面板
    async showWithdrawRecordsPanel() {
        this.clearContent();
        
        try {
            const gm = GameManager.instance;
            const response = await fetch(`${gm.networkManager._baseUrl}/agent/withdraw-records`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${gm.dataManager.get('token')}`
                },
                credentials: 'include'
            });
            const result = await response.json();
            
            if (result.code === 0) {
                this.renderWithdrawRecordsPanel(result.data);
            }
        } catch (e) {
            console.error('加载提现记录失败:', e);
        }
    }
    
    renderWithdrawRecordsPanel(records: any[]) {
        const panel = new Node('WithdrawRecordsPanel');
        panel.setParent(this.contentNode);
        panel.setPosition(0, 0, 0);
        
        const transform = panel.addComponent(UITransform);
        transform.setContentSize(600, 500);
        
        // 标题
        const title = new Node('Title');
        title.setParent(panel);
        title.setPosition(0, 220, 0);
        const titleLabel = title.addComponent(Label);
        titleLabel.string = '提现记录';
        titleLabel.fontSize = 24;
        titleLabel.color = new Color(245, 166, 35);
        titleLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
        
        let yPos = 170;
        for (const r of records || []) {
            let statusStr = '';
            if (r.status === 'pending') statusStr = '申请中';
            else if (r.status === 'paid') statusStr = '已打款';
            else if (r.status === 'rejected') statusStr = '已拒绝';
            
            const recordText = new Node('RecordText');
            recordText.setParent(panel);
            recordText.setPosition(0, yPos, 0);
            const recordLabel = recordText.addComponent(Label);
            recordLabel.string = `¥${parseFloat(r.amount).toFixed(2)} | ${statusStr} | ${r.apply_at?.substring(0, 10) || '-'}`;
            recordLabel.fontSize = 14;
            recordLabel.color = new Color(200, 200, 200);
            yPos -= 30;
            
            if (yPos < -200) break;
        }
        
        // 返回按钮
        const backBtn = this.createButton('返回', 0, -220);
        backBtn.setParent(panel);
        backBtn.on('click', () => this.showWithdrawPanel(), this);
    }
    
    showToast(message: string) {
        // 简单的toast提示
        console.log('[Toast]', message);
    }
}
