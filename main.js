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
    song: null,
    audio: null,
    init: function(){
      this.audio = new Audio()
      // this.audio.autoplay = true
      this.container = $('#page-music')
      this.bindEvents()
    },
    bindEvents: function(){
      EventCenter.on('select-special',(e,channelObject)=>{
        this.channelId = channelObject.channelId
        this.channelName = channelObject.channelName
        this.loadMusic(function(){
          this.setMusic()
        }.bind(this))
      })
    },
    loadMusic: function(callback){
      $.getJSON('//jirenguapi.applinzi.com/fm/getSong.php',{channel: this.channelID})
        .done((ret)=>{
          this.song = ret['song'][0]
          callback()
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
      this.container.find('.detail .special').text(this.song.lrc)
      this.container.find('.detail .tag').text(this.channelName)
    }
  }

  Footer.init()
  Fm.init()

}.call()