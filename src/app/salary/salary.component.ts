import {Component, OnDestroy, ViewChild} from '@angular/core';
import {datePicker, DatePickerOptions} from '../shared/entity/date-picker-options.vo';
import {PlanA, PlanB, Salary} from '../shared/entity/salary.vo';
import {DateUtil} from '../shared/utils/date.util';
import {SalaryService} from '../shared/service/salary.service';
import {select, Store} from '@ngrx/store';
import {USER} from '../shared/entity/user.bo';
import {TWBase} from '../shared/TWBase.ui';
import {delay} from 'rxjs/operators';
import {Lang} from '../shared/const/language.const';
import {Subscriber} from 'rxjs';


@Component({
    selector: 'app-salary',
    templateUrl: './salary.component.html',
    styleUrls: ['./salary.component.scss'],
})
export class SalaryComponent extends TWBase implements OnDestroy {
    @ViewChild('datePicker', {static: false}) datePicker: any;
    
    customPickerOptions: DatePickerOptions = datePicker.options(this);
    salary: Salary;
    hasGetData: boolean = false;
    subscribers = [];
    
    constructor(
        private salarySV: SalaryService,
        private store: Store<{ user: 'user', newVersion: 'newVersion', userLogout: 'userLogout' }>,
    ) {
        super();
        // 从缓存中获取已保存的数据
        this.salarySV.getDataFromStorage().subscribe(r => {
            // 展示缓存数据
            if(r) this.salary = r;
            // 使用基础模板数据
            else this.salary = PlanB;
            this.salarySV.languageProcessing(this.salary).subscribe(r => {
                this.subscribers[0] = this.store.pipe(select('user'), delay(2000)).subscribe(_ => {
                    // 用户为激活状态，并且还未获取数据
                    if(!this.hasGetData && USER.get().isActive) {
                        this.hasGetData = true;
                        this.salary.date = DateUtil.getYearMonth();
                        this.getSalary(DateUtil.getFullYear(), DateUtil.getCurrentMonth());
                    }
                });
            });
        });
        
        // 退出登录：初始化数据获取标识,初始化salary数据
        this.subscribers[1] = this.store.pipe(select('userLogout')).subscribe(r => {
            if(r) {
                this.hasGetData = false;
                this.salarySV.reinitSalaryData().subscribe(_ => {
                    this.salary = PlanB;
                });
            }
        });
    }
    
    dateHandle(pick) {
        // 判断前后日期是否有变化
        let year = pick.year.text;
        let month = pick.month.text;
        let pickerDate = year + '/' + month;
        // 重新获取数据
        if(this.salary.date != pickerDate) {
            this.salary.date = pickerDate;
            this.getSalary(year, month);
        }
    }
    
    getSalary(year, month) {
        this.loadingShow();
        this.salarySV.getData(year, month).pipe(delay(2000)).subscribe(
            r => {
                if(!r) {
                    this.presentToast(Lang.Lang_711);
                    this.salarySV.reinitSalaryData().subscribe(_ => {
                        PlanB.date = this.salary.date;
                        this.salary = PlanB;
                    });
                } else {
                    PlanA.date = this.salary.date;
                    this.salary = PlanA;
                    this.salarySV.languageProcessing(this.salary).subscribe();
                    this.salarySV.salaryDataProcessing(this.salary, r);
                }
            },
            null,
            () => {
                this.loadingDismiss();
            }
        );
    }
    
    ngOnDestroy(): void {
        this.subscribers.forEach(r => {
            if(r) r.unsubscribe();
        });
    }
    
    
}
