/**
 * 版本更新
 * @return {[type]}         [description]
 */
import {
  Alert,
  Platform,
  Linking
} from 'react-native';
//更新页面
if(Platform.OS === 'android'){
	var Download = require('../download')
}

module.exports = ()=>{
  let buildNumber = __CACHE.get('deviceInfo').sdk;
  if(!__DEV__){
		if(__ANDROID__){
			try{
			  commonRequest({
			    apiKey: 'checkForNewPurchaseUpdateKey', 
			    objectName: 'systemQueryDO',
			    params: {
			    	appVersionCode: buildNumber
			    }
			  }).then( (res) => {
			    let data = res.data;
			    if(data.versionCode > buildNumber * 1){
			    	Alert.alert('有新版本', `发现新版本v${data.versionName},请下载更新到最新版本`, [
			    	  {text: '确定', onPress: ()=> showModal({
			    	  	component: Download,
			    	  	name:      'Download',
			    	  	url:       data.downloadUrl,
			    	  	type:      'normal'
			    	  })},
			    	  {text: '取消', onPress: ()=>{}},
			    	]);
			    }
			  }).catch( err => {
			  	console.log(err);
			  })
			}
			catch(err){
				console.log(err);
			}
		}
		else{
		  fetch('http://nodemiddleware.songxiaocai.org/caimi', {
		    method : 'get',
		  })
		  .then(response => response.json())
		  .then((res) => {
		    if(res.appBuild * 1 > buildNumber * 1){
		      Alert.alert('有新版本', res.appVersion + '\n' + (res.attention ? res.attention : ''), [
		        {text: '确定', onPress: ()=> Linking.openURL(res.updateUrl ? res.updateUrl: 'https://songxiaocai.com/sxc_apps/index.html?name=caimi')},
		        {text: '取消', onPress: ()=>{}},
		      ]);
		    }
		  }).catch((err) => {
		    console.log(err);
		  });
		}
  }
}
