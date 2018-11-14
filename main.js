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
      this.bindEvents()
      this.render()
    },
    bindEvents: function(){
      // let _this = this
      this.$right_arrow.on('click',(e)=>{
        let itemWidth = this.$box.find('li').outerWidth(true)
        let rowCount = Math.floor(this.$box.width()/itemWidth) // 每一行的完整显示的个数
        if(!this.isToEnd){
          this.$ul.animate({
            left: '-=' + itemWidth*rowCount
          },300,()=>{
            this.isToStart = false
            if( parseFloat(this.$box.width()) - parseFloat(this.$ul.css('left')) >= parseFloat(this.$ul.css('width'))){
              this.isToEnd = true
              this.$right_arrow.addClass('disable')
            }
          })
        }
      })
      this.$left_arrow.on('click',(e)=>{
        let itemWidth = this.$box.find('li').outerWidth(true)
        let rowCount = Math.floor(this.$box.width()/itemWidth)
        if( !this.isToStart){
          this.$ul.animate({
            left: '+=' + itemWidth*rowCount
          },300,()=>{
            this.isToEnd = false
            if( parseFloat(this.$ul.css('left')) >= 0){
              this.isToStart = true
              this.$right_arrow.addClass('disable')
            }
          })
        }
      })
      this.$footer.on('click','li',(e)=>{
        $(e.currentTarget).find('.cover').addClass('active').parent().siblings().find('.cover.active').removeClass('active')
        $(e.currentTarget).find('h3').addClass('active').parent().siblings().find('h3.active').removeClass('active')

        EventCenter.fire('select-special',$(e.currentTarget).attr('data-channel-id'))
      })
    },
    render: function(){
      $.getJSON('http://api.jirengu.com/fm/getChannels.php')
      .done((ret)=>{
        this.renderFooter(ret.channels)
      }).fail(()=>{
        console.log('error')
      })
    },
    renderFooter: function(channels){
      let html = ''
      console.log(channels)
      channels.forEach((channels)=>{
        html += '<li data-channel-id = ' + channels.channel_id + '>'
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

  var App = {
    init: function(){
      this.bindEvents()
    },
    bindEvents: function(){
      EventCenter.on('select-special',function(e,data){
        console.log('select',data)
      })
    }
  }

  Footer.init()
  App.init()
}.call()