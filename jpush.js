/**
 *
 * 项目名称：caimi-rn
 * 文件描述：
 * 创建人：chengfy@songxiaocai.com
 * 创建时间：17/7/25 16:27
 * 修改人：cfy
 * 修改时间：17/7/25 16:27
 * 修改备注：
 * @version
 */
'use strict';
import JPushModule from 'jpush-react-native';
import {
    Platform
}from 'react-native'
module.exports ={
    jPushInit:()=>{
        console.log('_init')
        if (Platform.OS === 'android') {
            JPushModule.initPush();
        } else {
            JPushModule.setBadge(0, (value) => {
                console.log('_init setBadge value:', value);
            });
        }
    } ,
    setJPushAlias: (alias)=> {
        console.log('_setAlias',alias)
        alias=alias.toString()
        if(typeof alias === 'string' && alias){
            let maxTimes = 2;
            const goSetAlias = () => {
                JPushModule.setAlias(alias, () => {
                    console.log("Set alias succeed");
                    }, () => {
                    console.log("Set alias failed");
                    if (maxTimes) {
                        setTimeout(goSetAlias, 10000);
                        maxTimes --;
                    }
                });
            }
            goSetAlias();
        }
    }
}