import { _decorator, Component, Node, Label, Button, Sprite, Color } from 'cc';
import { GameManager } from '../GameManager';

const { ccclass, property } = _decorator;

interface GuideStep {
    title: string;
    content: string;
}

@ccclass('UIGuide')
export class UIGuide extends Component {
    
    @property(Node)
    private nextBtn: Node = null!;
    
    @property(Node)
    private skipBtn: Node = null!;
    
    @property(Label)
    private titleText: Label = null!;
    
    @property(Label)
    private contentText: Label = null!;
    
    private steps: GuideStep[] = [
        {
            title: '欢迎来到财神大陆！🎉',
            content: '这是一款经营庙宇、供奉财神、化缘收集资源的游戏。'
        },
        {
            title: '核心玩法',
            content: '1️⃣ 续香保持庙宇产出\n2️⃣ 收取香火钱到钱兜兜\n3️⃣ 化缘获取资源\n4️⃣ 供奉财神获得BUFF\n5️⃣ 升级解锁更多财神'
        },
        {
            title: '小贴士💡',
            content: '• 线香+2小时，红烛+4小时\n• 每日首次登录送2线香+2红烛\n• 记得领取任务奖励\n• 邀请好友双方都有奖励！'
        }
    ];
    
    private currentStep: number = 0;
    private onComplete: Function | null = null;
    
    start() {
        this.node.on('click', this.onSkip, this);
        
        if (this.nextBtn) {
            const btn = this.nextBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onNext, this);
            }
        }
        
        if (this.skipBtn) {
            const btn = this.skipBtn.getComponent(Button);
            if (btn) {
                btn.node.on('click', this.onSkip, this);
            }
        }
    }
    
    show(onComplete: Function | null = null) {
        this.onComplete = onComplete;
        this.currentStep = 0;
        this.node.active = true;
        this.updateStep();
    }
    
    hide() {
        this.node.active = false;
    }
    
    updateStep() {
        const step = this.steps[this.currentStep];
        if (!step) return;
        
        if (this.titleText) {
            this.titleText.string = step.title;
        }
        
        if (this.contentText) {
            this.contentText.string = step.content;
        }
        
        const isLast = this.currentStep === this.steps.length - 1;
        if (this.nextBtn) {
            const btn = this.nextBtn.getComponent(Button);
            if (btn) {
                const label = this.nextBtn.getChildByName('Label')?.getComponent(Label);
                if (label) {
                    label.string = isLast ? '开始游戏' : '下一步';
                }
            }
        }
    }
    
    onNext() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateStep();
        } else {
            this.finish();
        }
    }
    
    onSkip() {
        this.finish();
    }
    
    finish() {
        this.hide();
        if (this.onComplete) {
            this.onComplete();
        }
        
        // 保存完成状态
        const gm = GameManager.instance;
        if (gm) {
            gm.tutorialCompleted = true;
        }
    }
}
