import {NgModule, Optional, SkipSelf} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialog, MatIconRegistry} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {loadSvgResources} from './svg.util';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {translateModuleConfig} from './HttpLoaderFactory';
import {Platform} from '@ionic/angular';
import {Router} from '@angular/router';
import {UserService} from '../shared/service/user.service';
import {HttpInterceptor} from './interceptor/http.interceptor';
import {select, Store, StoreModule} from '@ngrx/store';
import {_userReducer} from './ngrx/reducers/user.reducer';
import {UpgradeModule} from '../application/upgrade/upgrade.module';
import {UpgradeService} from '../application/upgrade/upgrade.service';
import {_downloadApkReducer, _newVersion} from './ngrx/reducers/application.reducer';
import {StorageService} from '../shared/service/storage.service';
import {LanguageService} from '../shared/service/language.service';
import {RouterService} from '../shared/service/router.service';
import {WHERE} from '../shared/entity/where.enum';
import {DeviceService} from '../shared/service/device.service';
import {newVersion} from './ngrx/actions/application.actions';
import {ApplicationService} from '../shared/service/application.service';
import {TWBase} from '../shared/TWBase.ui';
import {StatusBar} from '@ionic-native/status-bar/ngx';


@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        HttpClientModule,
        TranslateModule.forRoot(translateModuleConfig()),
        StoreModule.forRoot({
            downloadApk: _downloadApkReducer,
            user: _userReducer,
            newVersion: _newVersion
        }),
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
export class CoreModule extends TWBase {
    // 两个注解是防止循环调用和第一次的时候可以调用
    constructor(@Optional() @SkipSelf() parent: CoreModule,
                ir: MatIconRegistry,
                ds: DomSanitizer,
                private translate: TranslateService,
                private platform: Platform,
                private router: Router,
                private userSV: UserService,
                private storageSV: StorageService,
                private store: Store<{ user: 'user', newVersion: 'newVersion' }>,
                private upgradeSV: UpgradeService,
                private languageSV: LanguageService,
                private routerSV: RouterService,
                private deviceSV: DeviceService,
                private appSV: ApplicationService,
                private dialog: MatDialog,
                private statusBar: StatusBar,
    ) {
        super();
        if(parent) throw new Error('模块已经存在，不能再次加载');
        
        // 注入svg图片
        loadSvgResources(ir, ds);
        
        // 语言设置
        this.languageSV.languageSettings();
        
        // 设置系统需要的语言常量
        this.languageSV.initStaticLanguage();
        
        // 获取用户信息
        this.userSV.getUserFromStorage().subscribe(r => {
            if(r)// 通过token查询用户信息,此步骤也作为token验证是否过期的目的
                this.userSV.getUserInfoByToken().subscribe();
            else this.routerSV.to(WHERE.login);
        });
        
        // 设置user信息变化的监听,如果有变化就更新缓存里的值
        this.store.pipe(select('user')).subscribe(_ => {
            console.log('jianigndjdkfjkj');
            this.storageSV.storageUserInfo().subscribe();
        });
        
        // 开启路由检测
        this.routerSV.routeDetection();
        
        // 注册物理返回键
        this.deviceSV.androidBackButtonRegister();
        
        // 检查版本有没有更新,并做强制升级处理
        this.appSV.checkNewVersionOnLoad();
        
        this.platform.ready().then(() => {
            // this.statusBar.overlaysWebView(true);
            // this.statusBar.backgroundColorByHexString('#3dc2ff');
            // this.splashScreen.hide();
        });
        
    }
}

