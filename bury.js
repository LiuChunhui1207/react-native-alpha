/**
 *
 * 项目名称：captain-rn
 * 文件描述：埋点初始化
 * 使用 规则

 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/6/22 10:51
 * 修改人：cfy
 * 修改时间：17/6/22 10:51
 * 修改备注：
 * @version
 */

'use strict'

import {
    InteractionManager,
} from 'react-native';
import {Bury} from 'bury';
import LogStorage from '../bury/logStorage';
import DeviceInfo from 'react-native-device-info';
import DoctorstrangeUpdater from 'react-native-doctorstrange-updater';

    setTimeout(()=>{
        let actionId=__STORE.getState().userState.sessionId?__STORE.getState().userState.sessionId:DeviceInfo.getUniqueID();
        Bury.init({
            actionId:actionId+'$'+new Date().getTime(),
            uuid:DeviceInfo.getUniqueID(),
            os:DeviceInfo.getSystemName(),
            brand:DeviceInfo.getModel(),
            sysVersion:DeviceInfo.getSystemVersion(),
            userId:__STORE.getState().userState.userId?__STORE.getState().userState.userId:undefined,
            userName:__STORE.getState().userState.userName?__STORE.getState().userState.userName:undefined,
            appId:3,
            appName:'采秘',
            appVersion: DoctorstrangeUpdater.getDoctorStrangeUpdater().JSCODE_VERSION?DoctorstrangeUpdater.getDoctorStrangeUpdater().JSCODE_VERSION:undefined,
        });

        Bury.uploadCache();
        // BuryVO.viewShowName='测试页面';
        // BuryVO.entryTime=new Date().getTime();
        // Bury.stop(BuryVO);
        // Bury.stop();
        // LogStorage.load(data=>{},err=>{});
        // LogStorage.getIds();
        // LogStorage.remove(1498211082122)
        // LogStorage.getIds();
        // console.log('__STORE.getState().userReducer',__STORE.getState().userState)
    },1000)



    global['_Bury'] = Bury;
    global['_LogStorage'] = LogStorage;
