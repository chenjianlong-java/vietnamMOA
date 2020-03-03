import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {loadSvgResources} from './svg.util';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {translateModuleConfig} from './HttpLoaderFactory';
import {Platform} from '@ionic/angular';
import {Router} from '@angular/router';
import {UserService} from '../shared/service/user.service';
import {Storage} from '@ionic/storage';
import {HttpInterceptor} from './interceptor/http.interceptor';
import {select, Store, StoreModule} from '@ngrx/store';
import {_userReducer} from './ngrx/reducers/user.reducer';
import {UpgradeModule} from '../application/upgrade/upgrade.module';
import {UpgradeService} from '../application/upgrade/upgrade.service';
import {_downloadApkReducer} from './ngrx/reducers/application.reducer';
import {USER} from '../shared/entity/user.bo';
import {StorageService} from '../shared/service/storage.service';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule.forRoot(translateModuleConfig()),
        StoreModule.forRoot({downloadApk: _downloadApkReducer, user: _userReducer}),
        UpgradeModule
    ],
    exports: [],
    providers: [
        {
            provide: HTTP_INTERCEPTORS,
            useClass: HttpInterceptor,
            multi: true
        }
    ]
    
})
export class CoreModule {
    // 两个注解是防止循环调用和第一次的时候可以调用
    constructor(@Optional() @SkipSelf() parent: CoreModule,
                ir: MatIconRegistry,
                ds: DomSanitizer,
                private translate: TranslateService,
                private platform: Platform,
                private router: Router,
                private userSV: UserService,
                private storageSV: StorageService,
                private storeSV: Store<{ user: 'user' }>,
                private upgradeSV: UpgradeService,
    ) {
        console.log('core模块执行');
        if(parent) throw new Error('模块已经存在，不能再次加载');
        
        loadSvgResources(ir, ds);
        // 语言初始化(若未设置语言, 则取浏览器语言)
        // // 当在assets/i18n中找不到对应的语言翻译时，使用'zh-CN'作为默认语言
        this.translate.setDefaultLang('zh');
        let language = this.translate.getBrowserLang();
        this.translate.use(language.substr(0, 2));
        
        // this.router.navigate(['/application/about']);
        
        // 获取用户信息
        this.userSV.getUserFromStorage().subscribe();
        
        
        this.storeSV.pipe(select('user')).subscribe(r => {
            this.storageSV.storageUserInfo().subscribe();
        });
        
        // this.upgradeSV.checkVersion();
        
    }
}

