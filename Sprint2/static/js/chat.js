(function () {
    var socket=io.connect();
    var message=Vue.extend({
        props: ['message'],
        template:"#message",
        filters:{
            time:function (value) {
                function two(str) {
                    var s;
                    s = "" + str;
                    if (s.length === 1) {
                        s = "0" + s;
                    }
                    return s;
                };
                var time=new Date(value);
                var hour=time.getHours();
                var m=time.getMinutes();
                var s=time.getSeconds();
                return two(hour)+":"+two(m)+":"+two(s);
            }
        },
        methods:{
            filterText:function (text) {
                return this.$replaceFace(text)
            }
        }
    })


function sendLogin(){
			
			var passwordinput= document.getElementById('password');
                        var password=passwordinput.value;
                        
                        
                        
                        
	    
			//TODO: validate the username/password
                        if (password.length<3)
                        {
                          alert('Invalid password');
                          passwordinput.value="";
                          passwordinput.focus();
                          return;
                         }

			//send login information to the server
			socketio.emit("login",username,password);	
			// 2. Hide login screen
			hideLoginScreen();
						
			// 3. Display the message screen
			showChatScreen();
		}

function pressLogin(e){
			alert("keycode =" + e.keyCode);
	    	if(e.keyCode==13){//enter
				sendLogin();
			}
		}
		
    var user=Vue.extend({
        props: ['user',"channel"],
        template:"#user",
        computed:{
            lastMsg:function () {
                var str='';
                var _this=this;
                if(_this.user.messages&&_this.user.messages.length>0){
                    str=_this.user.messages[_this.user.messages.length-1].text;
                }
                return str;
            }
        },
        methods:{
            change:function (id) {
                this.$emit("change-channel",id)
            },
            filterText:function (text) {
                return this.$replaceFace(text)
            }
        }
    })
    var login=Vue.extend({
        template:"#login",
        data:function () {
            var images=['https://udayton.edu/universitymarketing/_resources/img/logo-chapel.jpg'];
            return {
                avatarUrl:images[0],
                imgList:images,
                name:"",
                isShow:false,
                errorMsg:""
            }
        },
        created:function () {
            var _this=this;
            document.addEventListener("click",function (e) {
                _this.isShow=false;
            })
            _this.initSocketEvent();
        },
        methods:{
            userLogin:function () {
            	
			var passwordinput= document.getElementById('password');
                        var password=passwordinput.value;
                        
                        
                        
                        
	    
			//TODO: validate the username/password
                        if (password.length<5)
                        {
                          alert('Invalid password');
                          passwordinput.value="";
                          passwordinput.focus();
                          return;
                         }

                 
                this.name=this.name.replace(/(^\s*)|(\s*$)/g, "");
                if(this.name.length < 5){
                    alert("Please enter a valid username！");
                }else {
                    socket.emit("login",{
                        name:this.name,
                        avatarUrl:this.avatarUrl
                    })
                }
            },
            initSocketEvent:function () {
                var _this=this;
                socket.on("loginSuccess",function (user,users) {
                    _this.$emit("user-login",{
                        user:user,
                        users:users
                    })
                })
                socket.on("loginFail",function (msg) {
                    _this.showError(msg)
                })
            },
            showError:function (err) {
                console.log(err)
                var _this=this;
                if(this.interval){
                    clearTimeout(_this.interval)
                }
                this.errorMsg=err;
                this.interval=setTimeout(function () {
                    _this.errorMsg="";
                },3000)
            }
        }
    })
    new Vue({
        el:"#app",
        template:"#tpl",
        components:{
            "ui-message":message,
            "ui-user":user,
            "ui-login":login
        },
        data:function () {
            return {
                user:{
                    id:"705597001",
                    name:"Wei",
                    avatarUrl:"./images/img.jpg"
                },
                users:[{
                    id:"group",
                    name:"Public",
                    avatarUrl:"./images/group-icon.png",
                    messages:[]
                }],
                channel:"group",
                text:"",
                keywords:"",
                showMenu:false,
                isLogin:false,
                isVoice:true
            }
        },
        created:function () {
            var _this=this;
            document.addEventListener("click",function (e) {
                _this.showMenu=false;
            })
            _this.initBg()
        },
        mounted:function () {
            this.audio=this.$refs.audio;
        },
        computed:{
            messageList:function () {
                var msgList=[];
                var _this=this;
                this.users.forEach(function (item) {
                    if(item.id==_this.channel){
                        msgList=item.messages?item.messages:[]
                    }
                })
                return msgList
            },
            channelUser:function (){
                var _this=this;
                var user={};
                this.users.forEach(function (item) {
                    if(item.id==_this.channel){
                        user={
                            id:item.id,
                            name:item.name,
                            avatarUrl:item.avatarUrl
                        };
                    }
                })
                return user;
            }
        },
        methods:{
            sendMessage:function (channel,text,user,type) {
                var _this=this;
                var message={
                    channel:channel,
                    user:user,
                    type:type,
                    text:text,
                    time:new Date().getTime()
                };
                this.users.forEach(function (item,index) {
                    if(item.id==channel){
                        if(!item.messages){
                            _this.$set(_this.users[index],"messages",[])
                        }
                        if((type!='send'&&channel!=_this.channel)){
                            if(_this.users[index].unRead){
                                _this.users[index].unRead+=1;
                            }else {
                                _this.users[index].unRead=1;
                            }

                        }
                        item.messages.push(message)
                    }
                })
                this.$nextTick(function () {
                    if(_this.channel==channel){
                        _this.scrollFooter();
                    }
                })
                if(channel!="group"&&type!="send"&&_this.isVoice){
                    _this.audio.play();
                }
            },
            send:function () {
                this.text=this.text.replace(/(^\s*)|(\s*$)/g, "");
                if(this.text!=''){
                    this.sendMessage(this.channel,this.text,this.user,'send')
                    this.getMessage(this.channel,this.text,this.user)
                    this.text="";
                }
            },
            scrollFooter:function () {
                var ul = this.$refs.list;
                ul.scrollTop = ul.scrollHeight;
            },
            changeChannel:function (id) {
                var _this=this;
                this.channel=id;
                _this.setMessageReader(id);
                this.$nextTick(function () {
                    _this.scrollFooter();
                })
            },
            selectFace:function (text) {
                this.text+=text.phrase;
            },
            getMessage:function (channel,text,user) {
                var _this=this;
                if(channel=="group"){
                    socket.emit("groupMessage",text)
                }else {
                    socket.emit("message",channel,text)
                }
            },
            filterData:function (data) {
                switch(data.code) {
                    case 100000:
                        return data.text
                        break;
                    case 200000:
                        return data.text+"<a href='"+data.url+"' class='res-link' target='_blank'></a>"
                        break;
                    case 302000:
                        var html=data.text+"<ul class='res-list'>";
                        var len=3;
                        if(data.list.length<3){
                            len=data.list.length
                        }
                        for(var i=0;i<len;i++){
                            var item=data.list[i];
                            html+="<li><a href='"+item.detailurl+"' target='_blank'>"+(i+1)+".&nbsp;"+item.article+"</a></li>"
                        }
                        html+='</li>';
                        return html;
                        break;
                    case 308000:
                        var html=data.text+"<ul class='res-list'>";
                        var len=3;
                        if(data.list.length<3){
                            len=data.list.length
                        }
                        for(var i=0;i<len;i++){
                            var item=data.list[i];
                            html+="<li><a href='"+item.detailurl+"' target='_blank'>"+item.name+"</a></li>"
                        }
                        html+='</li>';
                        return html;
                        break;
                    default:
                        return data.text
                }
            },
            filterName:function () {
                var arr=[];
                var self=this
                this.users.forEach(function (item ){
                    if(item.name.indexOf(self.keywords)!=-1){
                        arr.push(item)
                    }
                })
                return arr;
            },
            initBg:function () {
                this.$http.jsonp("https://api.asilu.com/bg")
                    .then(function (data) {
                        var images=data.body.images;
                        document.body.style.backgroundImage="url('https://cdn3.onlinemba.udayton.edu/content/efa6b95270c045dd896bb4bb2e9ddb62/Hero.jpg')";
                        setInterval(function () {
                           
                            img.addEventListener('load',function () {
                                document.body.style.backgroundImage="url("+images[index].url+")";
                            })
                            img.src=images[index].url;
                        },3000)
                    })
            },
            userLogin:function (params) {
                this.initSocketEvent(params)
                this.isLogin=!this.isLogin;
            },
            initSocketEvent:function (params) {
                var _this=this;
                this.user=params.user;
                params.users.forEach(function (item) {
                    item.messages=[]
                    _this.users.push(item)
                })
                socket.on("message",function (user,text) {
                    _this.sendMessage(user.id,text,user,"user")
                })
                socket.on("groupMessage",function (user,text) {
                    _this.sendMessage("group",text,user,"user")
                })
                socket.on('system',function (user,type) {
                    if(type=="join"){
                        user.messages=[]
                        _this.users.push(user)
                    }
                    if(type=="logout"){
                        _this.channel="group";
                        _this.users.forEach(function (item,index) {
                            if(item.id==user.id){
                                _this.users.splice(index, 1);
                            }
                        })
                    }
                })
            },
            setMessageReader:function (id) {
                var _this=this;
                this.users.forEach(function (item,index) {
                    if(item.id==id){
                        _this.users[index].unRead=0
                    }
                })
            }
        }
    })
})()
