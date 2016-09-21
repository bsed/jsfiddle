/**
 * jquery.suggestion.js 1.0
 * http://passer-by.com
 */
;(function($, window, document, undefined) {
    $.fn.suggestion = function(parameter) {
        parameter = parameter || {};
        var defaults = {
            url:'',                          //����Ľӿڵ�ַ
            suggestionCls:'suggestion',      //��ʾ�������class
            activeCls:'active',              //�б���ѡ��class
            FieldName:'word',                //��ǰinput����������ӿ�ʱ���ֶ���
            dataFormat:'jsonp',              //����ĸ�ʽ
            parameter:{},                    //������ӿ��йز���
            jsonpCallback:'',                //�Զ���ص�����
            get:function(){},                //�����������:����һ������target��ʾ�������б����,data��ʾ���󵽵�����
            select: function(item) {         //ѡ�����������б������һ������target��ʾ��ǰѡ���б���,input��ʾ��ǰinput����
                item.input.val(item.target.text());
            }            
        }
        var options = $.extend({}, defaults, parameter);
        var $window = $(window);
        var $document = $(document);
        return this.each(function() {
            //������
            var $this = $(this);
            var $form = $this.parents('form');
            var $box = $this.parent();
            var $suggestion = $form.find('.'+options.suggestionCls);
            if(!$suggestion.length){
                $suggestion = $("<div class='"+options.suggestionCls+"'><ul></ul></div>").appendTo($box);
            }
            var $list = $suggestion.find('ul');
            var $item = $list.find('li');
            var _height = $this.outerHeight(true);
            var _width = $this.outerWidth(true);
            var _text = '';
            var _hander = 0;
            var _index = -1;
            var isShow = false;
            var hasData = false;
            //�ڵ���ʽ
            $form.css({
                'position':'relative'
            });
            var _top = $this.position().top;
            var _left = $this.position().left;
            $this.prop({
                'autocomplete':'off',
                'disableautocomplete':true
            });
            $suggestion.css({
                'position':'absolute',
                'top':_top+_height+'px',
                'left':_left+'px',
                'display':'none',
                'width':_width+'px'
            });
            //��������
            //�����ɿ�
            var up = function(e){
                e.isPropagationStopped();
                e.preventDefault();
                switch(e.keyCode){
                    case 13:
                    case 38:
                    case 40:
                    break;
                    default:
                        show();
                }
            };
            //��������
            var down = function(e){
                e.isPropagationStopped();
                switch(e.keyCode){
                    case 13:
                        hide();
                    break;
                    case 38:
                        if(isShow){
                            if(_index>0){
                                _index--;
                                $items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
                                select();
                            }else{
                                _index = -1;
                                $items.removeClass(options.activeCls);
                                $this.val(_text);
                            }
                            e.preventDefault();                                    
                        }
                    break;
                    case 40:
                        if(isShow){
                            if(_index<$items.length-1){
                                _index++;
                                $items.eq(_index).addClass(options.activeCls).siblings().removeClass(options.activeCls);
                                select();
                            }
                            e.preventDefault();
                        }
                    break;
                    default:
                        hide();
                }
            };
            //��꾭��
            var hover = function(e){
                e.isPropagationStopped();
                var $target = $(this);
                _index = $target.index();
                $target.addClass(options.activeCls).siblings().removeClass(options.activeCls);
            };
            //ѡ�б���
            var select = function(){
                var $target = $list.find('li.'+options.activeCls);
                var status = {
                    'target':$target,
                    'input':$this
                }
                options.select(status);
            };
            //�ɹ���Ļص�����
            var success = function(data){
                var status = {
                    'target':$list,
                    'data':data
                };
                options.get(status);
                $items = $suggestion.find('li');
                hasData = $items.length>0;        //�����б����ж���û��ֵ
                if(hasData){
                    $suggestion.show();
                }
            }
            //��ʾ����
            var show = function(){
                isShow = true;
                _hander = setTimeout(function(){
                    if(isShow){
                        var value = $.trim($this.val());
                        if(value==''){
                            hide();
                        }else{
                            if(value != _text){ //�����ϴ�����
                                _index = -1;
                                options.parameter[options.FieldName] = _text = value;
                                $.ajax({
                                    type:'get',  
                                    async: false,  
                                    url :options.url,
                                    data:options.parameter,
                                    dataType:options.dataFormat,
                                    jsonp:options.jsonp,
                                    success:success
                                });          
                            }else{
                                if(hasData){
                                    $suggestion.show();
                                }
                            }                            
                        }
                    }
                },'500');  
            }
            //���ر���                 
            var hide = function(){
                isShow = false;
                _hander&&clearTimeout(_hander);
                $suggestion.hide(); 
            };
            //�¼���
            $this.on({
                'keyup':up,
                'keydown':down
            });
            $list.on('click','li',function(){
                select();
                $form.submit();
            }).on('mouseenter','li',hover);
            $document.on({
                'click':hide
            });
            $window.resize(function(){
                _height = $this.outerHeight(true);
                _width = $this.outerWidth(true); 
                _top = $this.position().top;
                _left = $this.position().left;
                $suggestion.css({
                    'top':_top+_height+'px',
                    'left':_left+'px',
                    'width':_width+'px'
                });
            });
        });
    };
})(jQuery, window, document);