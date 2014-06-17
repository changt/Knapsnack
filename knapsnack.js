//sound sources.
    var failsnd = new Audio("fail.wav")
    var getsnd = new Audio("get.wav")


//item 'class', but is actrually a function, since js don't have classes
//reference: http://www.phpied.com/3-ways-to-define-a-javascript-class/
function item (img, value, weight, name){
    this.img = img;
    this.value = value;
    this.weight = weight;
    this.name = name;
    this.stolen = false;
    var $sackdata = $('#sack_data_h');
    //makes some containers and txt for the item
    this.$container = $('<div class = "item"/div>')
    this.$img = $('<img class = "item_img"  src="' + img + '" />');   //use item class to modify css; passing id to identify object when we want to move it.
    this.$txt = $('<div class = "item_txt"> $' + value + ' ,' + weight + ' kg </div>');
    this.$container.append(this.$img);
    this.$container.append(this.$txt);
    //draws the item or removes it
    this.draw = function($div){
        $div.append(this.$container);
        $(this.$img).click(this.move)           
    }
    this.remove = function(){
        this.$container.remove()
    }
    this.animate_horizontal = function(len){            //calls an animation that moves to the right by len px. Doesn't work yet.
        console.log(this.$container)
        $(this.$container).css("position", "fixed")
        $(this.$img).animate({marginLeft: len});
            }
    this.updatesack = function(value, weight){  //updates data function. INCREMENTS by value and weight.
        var prev_val = $sackdata.data('value');
        var prev_weight = $sackdata.data('weight');
        var val = prev_val + value;
        var weight = prev_weight + weight;
        $sackdata.data('value',val);
        $sackdata.data('weight', weight);
        $sackdata.text('$'+ val + ' ,' + weight + 'kg');
    }
    var self = this             //so that js knows we're talking about the item, instead of whateverelse is passed in.
    this.move = function(){     //move the item, as well as updates data. also checks for overweight

        if (!self.stolen){
            if(($sackdata.data('weight')+self.weight)<=$sackdata.data('maxweight')){
                getsnd.play();
 //             self.animate_horizontal(600);
                self.remove();
                self.stolen = true;
                self.draw($('#bouglar'));
                self.updatesack(self.value, self.weight);
            }
            else
            {
                failsnd.play();
                $('.message').slideDown(400, function()
                                   {setTimeout(function(){
                                       $('.message').slideUp(500)}, 1000)}); //300ms: appearing animation; 500ms: hiding animation; 1000ms: time displayed.
            }
        }
        else
        {
//          self.animate_horizontal(-600);
            getsnd.play();
            self.remove()
            self.updatesack(self.value*-1, self.weight*-1);
            self.stolen = false;
            self.draw($('#house'));
        }
    }
}

//executes after browser loads
$(function() {
//makes a list of items
    var $items  = $('.knapsack *');
    var items = [];
    var sackdata ={
        value: 0,
        weight: 0,
    }
    for (i=0; i<$items.length; i++){
        items[i] = new item ($($items[i]).attr('src'), parseInt($($items[i]).data('value')), parseInt($($items[i]).data('weight')), $($items[i]).data('name'));
        items[i].draw($('#house'));    //draw the item
    }
    $('.knapsack').remove();//removes the initial div
    //function to sync what is stored in sackdata onto the screen.


});