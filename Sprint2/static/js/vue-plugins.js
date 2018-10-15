(function () {
    var vueFace= {
        install:function (Vue, options) {
            var baseUrl="http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal";
            var faceJson = [
               {"phrase": "[style]", "url": baseUrl + "/67/gangnamstyle_org.gif"}, {
                    "phrase": "[laughing]",
                    "url": baseUrl + "/32/lxhwahaha_org.gif"
                }].splice(0,98);
          
            Vue.component('ui-face',{
                template:'<a class="web_wechat_face" href="javascript:void (0)" title="emojie" @click.stop="flag=!flag"> <transition name="custom-classes-transition" enter-active-class="animate scaleFadeIn" leave-active-class="animate scaleFadeOut"> <div class="warpBox" v-show="flag"> <div class="face-warp"> <template v-for="item in faceJson"> <a href="javascript:void(0)" v-bind:title="item.phrase" @click.stop="clickFace(item)"><img :src="item.url" width="22" height="22"></a> </template> </div></div></transition></a>',
                data:function () {
                    return {
                        faceJson:faceJson,
                        flag:false
                    }
                },
                created:function () {
                    var _this=this;
                    document.addEventListener('click',function (e) {
                        _this.flag=false;
                    })
                },
                methods:{
                    clickFace:function (face) {
                        this.$emit('select-face',face)
                    }
                }
            })
            function getIndex(str) {
                var index=-1;
                faceJson.forEach(function (item,i) {
                    if(item.phrase==str){
                        index=i;
                    }
                })
                return index
            }
            
            Vue.prototype.$replaceFace = function (text) {
                if(typeof (text) != "undefined") {
                    var sArr = text.match(/\[.*?\]/g);
                    if(sArr&&sArr.length>0){
                        for(var i = 0; i < sArr.length; i++){
                            if(getIndex(sArr[i])!=-1) {
                                var reStr = "<img src=\"" +faceJson[getIndex(sArr[i])].url  + "\" height=\"20\" width=\"20\" />";
                                text = text.replace(sArr[i], reStr);
                            }
                        }
                    }
                }
                return text;
            }
        }
    }
    var Toast={};
    Toast.install=function (Vue,options) {
        var opt={
            type:"top",
            duration:2500
        }
        for (var key in options){
            opt[key]=options[key];
        }
        Vue.prototype.$message=function (tips,type) {
            if(type){
                opt.type=type
            }
            var toastTpl=Vue.extend({
                template:'<div class="animate fadeIn ui-toast ui-toast-'+opt.type+'">'+tips+'</div>'
            })
            var tpl=new toastTpl().$mount().$el;
            document.body.appendChild(tpl)
            setTimeout(function () {
                document.body.removeChild(tpl)
            },opt.duration)
        }
        var arr=['top','bottom','center'];
        arr.forEach(function (type) {
            Vue.prototype.$message[type]=function (tips) {
                return Vue.prototype.$message(tips,type)
            }
        })
    }
    if (window.Vue) {
        Vue.use(vueFace)
        Vue.use(Toast)
    }else {
        window.vueFace=vueFace;
    }
})()
