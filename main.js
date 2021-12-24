const playlist = document.querySelector('.playlist')
const heading = document.querySelector('header h2')
const cdThum = document.querySelector('.cd-thumb')
const audio = document.querySelector('#audio')
const cd = document.querySelector('.cd')
const playBtn = document.querySelector('.btn-toggle-play')
const player = document.querySelector('.player')
const progress = document.querySelector('#progress')
const nextBtn = document.querySelector('.btn-next')
const prevBtn = document.querySelector('.btn-prev')
const randomBtn = document.querySelector('.btn-random ')
const repeatBtn = document.querySelector('.btn-repeat')

const PLAYER_STORAGE_KEY = 'F8_player'


const app = {
    
    currengindex:0,
    isPlaying:false,
    isRandom:false,
    isRepeat:false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY))||{},
    songs : [
        { name: 'unstoppable',
          singer:'Sia',
          path:'Unstoppable.mp3'
    
        },
        { name: 'Shape of you',
        singer:'Es sharen',
        path:'SOY.flac'
      
      },
      { name: 'Bad habits',
        singer:'Es sharen',
        path:'BADHABIT.flac'
      
      },
      { name: 'Old Town Road',
        singer:'Li nas X',
        path:'OTR.flac'
      
      },
      { name: 'Đi về nhà',
        singer:'Đen vâu',
        path:'DVN.mp3'
      
      },
      { name: 'Astronaut in the ocean',
        singer:'Masked Wolf',
        path:'AIT.flac'
      
      },
    ],


    //1:Hàm render lên web
    render:function(){

        // <div class="song ${ index === this.currengindex ? 'active':''}">: chỗ này là active bài 
        //hát chuyển bài nào bài ở dưới sẽ sáng lên logic nếu index nhập vào = currentIndex thì mới sáng lên)
        const htmls = this.songs.map( (song,index) =>{
                return `
                
                <div class="song ${ index === this.currengindex ? 'active':''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('https://i.ytimg.com/vi/jTLhQf5KJSc/maxresdefault.jpg')">
                    </div>
                    <div class="body">
                         <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
              </div>
                `

        })
        playlist.innerHTML = htmls.join('')       
        
    },

    //Định nghĩa các thuộc tính cho Object
    defineProperties:function() {
            //Lấy ra bài hát đầu tiên
            Object.defineProperty(this,'currentSong',{
                get:function() {
                    return this.songs[this.currengindex]
                }
            })

    },
    //2:Hàm xử lý
    handleEvents : function() {
        const _this=this



        //Hàm Tình toán khi cuộn thì cd width sẽ làm nhỏ phần cd hoặc phóng to ra lại nhưng có lỗi 
        const cdWidth = cd.offsetWidth// lấy ra chiều ngang của phần cd
        
        
        document.onscroll = function() {
            const scrollTop = document.documentElement.scrollTop|| window.scrollY//dộ dài scorll theo chiều Y
           
            const newCdWidth = cdWidth - scrollTop
            //nếu kéo nhanh quá phần cd phần còn lại 1 chút nhỏ
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 // toán tử 3 ngôi
            //thêm hiệu ứng opacity mờ dần:
            cd.style.opacity = newCdWidth/cdWidth       

        }

        
        //Xử lý cd quay và dừng: 
        const cdThumAnimate =  cdThum.animate([
            {transform :'rotate(360deg)'} //chọn kiểu hiệu ứng
        ], {
            duration :10000 ,//10s
            iterations:Infinity //lặp lài bao nhiêu lần
        })
        cdThumAnimate.pause()
        
        //Xử lý khi click lại nút phay dể stop bài hát:
        
        playBtn.onclick = function () {
            if(_this.isPlaying){
               
                audio.pause()//dừng bài nhạc
               
            
            }else{
               
                audio.play()//chơi bài nhạc
               
            }
         
        }
        //Xử lý khi click play:
        audio.onplay = function () {
            _this.isPlaying =true
            player.classList.add('playing')
            //Khi play thì cd sẽ quay
            cdThumAnimate.play()
        }
        //Xử lý khi click pause:
     
        audio.onpause = function () {
            _this.isPlaying =false
            player.classList.remove('playing')
            //Khi pause thì cd sẽ dừng ngay điểm quay:
            cdThumAnimate.pause()
        }
        //Khi tiến dộ bài hát thay đổi:nói cách khác chấm đỏ sẽ chạy theo độ dài bài hát
        audio.ontimeupdate = function(){
           //Tính ra tỷ lệ độ dài bài hát
            //currentTime: thời gian hiện tại của bài hát và duration là tổng thời gian bài hát
            if(audio.duration != NaN) {
                //audio.duration có giá trị NaN là dùng if để tránh
                const progressPercent = Math.floor(audio.currentTime/audio.duration *100)
                progress.value=progressPercent
                
            }
        
        }
        

        //Xử lý khi tua bài hát: nhấn vào chỗ nào trên progress  thì thời gian hiện tại của bài hát ở vị trí đó
        progress.oninput=function(e){  //có thể dùng onchange nhưng khi tua ngược sẽ bị giựt
           const seekTime = audio.duration / 100 * e.target.value  //số giây khi tua tới vị trí đó
           //e.target.value là vị trí của cái chấm đỏ trên thanh progress ( giá trị %)
           //Gắn vào currentTime của thằng audio:
           audio.currentTime = seekTime
           
        }
        
        //Xử lý khi next bài hát: 
        nextBtn.onclick = function() {
            //Nếu có nhấn nút random thì sẽ chạy ngẫu nhên ko thì chạy tuần tự
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.nextSong()
            }

           
            audio.play()
            //_this.render()//render lại để làm sáng lên bài ở dưới ứng với render ở trên           
            _this.activeSong()//cách 2 là dùng thằng activeSong đầu tiên sẽ xóa tất cả active
            //trong song sau đó tìm tới thằng hiện tại và  thêm active vào
            _this.scrollToActiveSong()
        }
        
        
        //Xử lý khi prev bài hát: 
        prevBtn.onclick = function() {
            //Nếu có nhấn nút random thì sẽ chạy ngẫu nhên ko thì chạy tuần tự
            if(_this.isRandom){
                _this.playRandomSong()
            }else{
                _this.prevSong()
            }
            
            audio.play()
            _this.activeSong()//thẹm cả nút prev như nút next
            _this.scrollToActiveSong()
        }
        //Xử lý khi random bài hát: 
        randomBtn.onclick = function() {
            if(_this.isRandom){
                _this.isRandom=false
                randomBtn.classList.remove('active')
            }else{
                _this.isRandom=true
                randomBtn.classList.add('active')
            }
            

            /*
            c2: 
            _this.isRandom = ! _this.isRandom
            randomBtn.classList.toggle('active',_this.isRandom) //trong toggle có 2 tham số
            1 là giá trị 2 là boolean nếu sai thì xóa đúng thì thêm
            */               
        }


        
        
        //XỬ lý nextsong khi bài hát kết thức audio.ended:
            audio.onended = function(){
            //    _this.nextSong()
            //    audio.play()
            //hoạc:  
            if(_this.isRepeat){ //Nếu có repeat thì load lại bài đó rồi phát luôn ko thì chuyển sang bài tiếp theo
                audio.load()
                audio.play()
            }else{

                nextBtn.click()
                
                }
            }
        //xử LÝ lặp lại 1 bài hát:
            repeatBtn.onclick = function() {
                if(_this.isRepeat){
                    _this.isRepeat=false
                    repeatBtn.classList.remove('active')
                }else{
                    _this.isRepeat=true
                    repeatBtn.classList.add('active')
                }
            }
    
            //Lắng nghe hành vi click vào playlist(chức năng nhấn bài nào phát bài đó)
            playlist.onclick = function(e) {
                const songNode = e.target.closest('.song:not(.active)')
                //XỬ lý ki click vào song thhi2 chuyển sang bài đó
                    if(songNode || e.target.closest('.option')){//closet trả về element hoặc là chính nó hoặc là cha của nó nếu ko có thì là null
                        //tìm ra những bài hát chưa active và ko có thằng option(dấu ... trên song)
                        if(songNode){//XỬ ly  ki click vào song
                                const songIndex= songNode.getAttribute('data-index') //hoặc songNode.dateset.index
                                _this.currengindex=parseInt(songIndex) //đặt index lấy ra bằng index bài hát hiện tại
                                _this.loadcurrentSong()//load lại bài hát sau khi set index
                                _this.activeSong()//active lại song (thêm màu cho phần bài hát)
                                audio.play()//chơi bài hát
                        }
                    }
            }
            
    },
    
   

    //XỬ lý khi nhấn next or prev ở cd thì ở dưới sẽ đi chuyển tới vị trị bài hát đó
    //không cần người dùng kéo ở đây là hiển thị tại vị trí bài hát đó trên màn hình
    scrollToActiveSong: function() {
            setTimeout( () => {
                if(this.currengindex < 3){ //nếu currengindex < 3 thì cho nó block:end ngược lại thì block:nearest (ý là nếu các 
                    //bài nhạc ở đầu khi view di chuyển ngược lại sẽ bị che thì ta block nó sau hơn thằng nearest)
                    document.querySelector('.song.active').scrollIntoView({
                        behavior:'smooth',//hành vi: làm cho mềm mại
                        block:'end',//di chuyển theo chiều dọc: tới vị trí cuối

                    });
                }else{
                    document.querySelector('.song.active').scrollIntoView({
                        behavior:'smooth',//hành vi: làm cho mềm mại
                        block:'nearest',//di chuyển theo chiều dọc: tới vị trí gần đó

                    });
                }
                   


            },500)
    },


    //Load bài hát hiện tại lên ui phần cd
    loadcurrentSong: function() {
        
        heading.textContent = this.currentSong.name
        //cdThum.style.backgroundImage = `url('${this.currentSong.image}')`
        heading.textContent = this.currentSong.name
        audio.src = `${this.currentSong.path}`
        
    },
    //Xử lý active song:
    activeSong: function(){
        const loopSongs = document.querySelectorAll('.song');
        for (song of loopSongs){
               
                song.classList.remove('active')
               
        }
        loopSongs[this.currengindex].classList.add('active')
        
    },
    //Next bài tiếp theo:
    nextSong: function () {
        
        this.currengindex++
        if(this.currengindex >= this.songs.length ) {
            this.currengindex = 0
        }
    
        this.loadcurrentSong()
    },
    //Prev về bài trước:
    prevSong: function() {
        this.currengindex--
        if(this.currengindex < 0) {
            this.currengindex = this.songs.length-1
        }
        this.loadcurrentSong()
    },
    //Random bài hát:
    playRandomSong: function() {
        let newIndex
        do { 
            newIndex = Math.floor(Math.random() * this.songs.length)//random ra 1 số nguẫ nhei65n trong tổng số bài hát
        }while( newIndex === this.currengindex){
                this.currengindex = newIndex
                this.loadcurrentSong()
        }
    },
    
    loadConfig:function() {
        this.isRandom=this.config.isRandom
        this.isRepeat=this.config.isRepeat
    },

   

    //Hàm chạy
    start:function() {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //Định nghĩa các thuộc tính cho Object
        this.defineProperties()

        //Lắng nghe và xử lý các event
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy úng dụng
        this.loadcurrentSong()
        
        //render lên playlist
        this.render()
        //Hiển thị trang thái ban đầu của nút random và repeat nghĩa là có reset trinyh2 duyệt
        // thì các nút đó vẫn giữ ngang trang thái như trước khi reset:
        //randomBtn.classList.toggle('active',this.isRandom)
       // repeatBtn.classList.toggle('active',this.isRepeat)

        
    },
    
}

app.start()
