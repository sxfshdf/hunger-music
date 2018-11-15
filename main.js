!function(){
  var EventCenter = {
    on: function(type, handler){
      $(document).on(type,handler)
    },
    fire: function(type, data){
      $(document).trigger(type,data)
    }
  }

  // EventCenter.on('hello', function(e,data){
  //   console.log(data)
  // })

  // EventCenter.fire('hello', '你好')

  var Footer = {
    init: function(){
      this.$footer = $('footer')
      this.$ul = this.$footer.find('ul')
      this.$box =this.$footer.find('.box')
      this.$right_arrow = this.$footer.find('.right_arrow')
      this.$left_arrow = this.$footer.find('.left_arrow')
      this.isToEnd = false
      this.isToStart = true
      this.isAnimate = false
      this.bindEvents()
      this.render()
    },
    bindEvents: function(){
      // let _this = this
      this.$right_arrow.on('click',(e)=>{
        if(this.isAnimate) return
        let itemWidth = this.$box.find('li').outerWidth(true)
        let rowCount = Math.floor(this.$box.width()/itemWidth) // 每一行的完整显示的个数
        if(!this.isToEnd){
          this.isAnimate = true
          this.$ul.animate({
            left: '-=' + itemWidth*rowCount
          },400,()=>{
            this.isAnimate = false
            this.isToStart = false
            this.$left_arrow.removeClass('disable')
            if( parseFloat(this.$box.width()) - parseFloat(this.$ul.css('left')) >= parseFloat(this.$ul.css('width'))){
              this.isToEnd = true
              this.$right_arrow.addClass('disable')
            }
          })
        }
      })
      this.$left_arrow.on('click',(e)=>{
        if(this.isAnimate) return
        let itemWidth = this.$box.find('li').outerWidth(true)
        let rowCount = Math.floor(this.$box.width()/itemWidth)
        if( !this.isToStart){
          this.isAnimate = true
          this.$ul.animate({
            left: '+=' + itemWidth*rowCount
          },400,()=>{
            this.isAnimate = false
            this.isToEnd = false
            this.$right_arrow.removeClass('disable')
            if( parseFloat(this.$ul.css('left')) >= 0){
              this.isToStart = true
              this.$left_arrow.addClass('disable')
            }
          })
        }
      })
      this.$footer.on('click','li',(e)=>{
        $(e.currentTarget).find('.cover').addClass('active').parent().siblings().find('.cover.active').removeClass('active')
        $(e.currentTarget).find('h3').addClass('active').parent().siblings().find('h3.active').removeClass('active')

        EventCenter.fire('select-special',{
          channelId: $(e.currentTarget).attr('data-channel-id'),
          channelName: $(e.currentTarget).attr('data-channel-name')
        })
      })
    },
    render: function(){
      $.getJSON('//api.jirengu.com/fm/getChannels.php')
      .done((ret)=>{
        this.renderFooter(ret.channels)
      }).fail(()=>{
        console.log('error')
      })
    },
    renderFooter: function(channels){
      let html = ''
      channels.forEach((channels)=>{
        html += '<li data-channel-id = ' + channels.channel_id + ' data-channel-name ='+ channels.name+'>'
              + '<div class="cover" style="background-image: url('+ channels.cover_small + ')"></div>'  
              + '<h3>'+ channels.name + '</h3>'
              + ' </li>'
      })
      this.$ul.html(html) 
      this.setStyle() 
    },
    setStyle: function(){
      let count = this.$footer.find('li').length
      let width = this.$footer.find('li').outerWidth(true)
      this.$ul.css({
        width: count*width + 'px'
      })
    }
  }

  var Fm = {
    channelId: null,
    channelName: null,
    container: null,
    song: null,
    audio: null,
    init: function(){
      this.audio = new Audio()
      this.audio.autoplay = true
      this.container = $('#page-music')
      this.bindEvents()
    },
    bindEvents: function(){
      EventCenter.on('select-special',(e,channelObject)=>{
        this.channelId = channelObject.channelId
        this.channelName = channelObject.channelName
        this.loadMusic()
      })
      this.container.find('.button-play').on('click',(e)=>{
        let $button = $(e.currentTarget)
        if( $button.find('use').attr('xlink:href') === '#icon-play' ){
          $button.find('use').attr('xlink:href','#icon-pause')
          this.audio.play()
        }else{
          $button.find('use').attr('xlink:href','#icon-play')
          this.audio.pause()
        }
      })
      this.container.find('.button-next').on('click',(e)=>{
        this.loadMusic()
      })
      this.audio.addEventListener('play',()=>{
        clearInterval(this.id)
        this.id = setInterval(()=>{
          this.updateStatus()
        },1000)
      })
      this.audio.addEventListener('pause',()=>{
        clearInterval(this.id)
      })
    },
    loadMusic: function(){
      $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel: this.channelID})
        .done((ret)=>{
          this.song = ret['song'][0]
          this.setMusic()
          this.loadLyric()
      })
    },
    loadLyric: function(){
      $.getJSON('//jirenguapi.applinzi.com/fm/getLyric.php',{sid: this.song.sid})
        .done((ret)=>{
          let lyric = ret.lyric
          let lyricObject = {}
          lyric.forEach((line)=>{
            //[01:10.25][01:20.25]It a new day
            let time = line.match(/\d{2}:\d{2}/g)
            //time == ['01:10.25', '01:20.25']
            let string = line.replace(/\[.+?\]/g, '')
            // 判断 time 是否为数组
            if( Array.isArray(time)){
              time.forEach((time)=>{
                lyricObject[time] = string
              })
            }
          })
          this.lyricObject = lyricObject
      })
    },
    setMusic: function(){
      console.log(this.song)
      this.audio.src = this.song.url
      console.log(this.audio.src)
      $('.bg').css('background-image','url('+ this.song.picture +')')
      this.container.find('.left figure').css('background','url('+ this.song.picture +')')
      this.container.find('.detail h1').text(this.song.title)
      this.container.find('.detail .auther').text(this.song.artist)
      
      this.container.find('.detail .tag').text(this.channelName)
      this.container.find('.button-play use').attr('xlink:href','#icon-pause')
    },
    updateStatus: function(){
      let minute = Math.floor( this.audio.currentTime/60 )
      let second = Math.floor( this.audio.currentTime%60)+''
      if( second.length === 2){
         second
      }else{
         second = '0' + second
      }
      this.container.find('.currentTime').text(minute + ':' + second)
      this.container.find('.progressBar').css('width', this.audio.currentTime/this.audio.duration*100+'%')
      // let lineLyric = this.lyricObject['0'+minute+':'+second]
      // console.log(lineLyric)
      // if(lineLyric){
      //   this.container.find('lyric p').text(lineLyric).boomText() //可以添加不同的 css 效果，实现歌词不同效果的变化
      // }
    },
    
  }

  Footer.init()
  Fm.init()

  $.fn.boomText = function(type){
    type = type || 'rollIn'
    console.log(type)
    this.html(function(){
      var arr = $(this).text()
      .split('').map(function(word){
          return '<span class="boomText">'+ word + '</span>'
      })
      return arr.join('')
    })
    
    var index = 0
    var $boomTexts = $(this).find('span')
    var clock = setInterval(function(){
      $boomTexts.eq(index).addClass('animated ' + type)
      index++
      if(index >= $boomTexts.length){
        clearInterval(clock)
      }
    }, 300)
  }
}.call()