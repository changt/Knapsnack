//item 'class', but is actrually a function, since js don't have classes
//reference: http://www.phpied.com/3-ways-to-define-a-javascript-class/
function item (img, value, weight, name,id){
    //basic attributes. id for easy reference.
    this.img = img;
    this.value = value;
    this.weight = weight;
    this.name = name;
    this.id = id
    this.stolen = false;
    
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
    this.updatesack = function(value, weight){  //updates data function. INCREMENTS by value and weight.
        var $sackdata = $('#sack_data_h');
        var prev_val = $sackdata.data('value');
        var prev_weight = $sackdata.data('weight');
        var val = prev_val + value;
        var weight = prev_weight + weight;
        $sackdata.data('value',val);
        $sackdata.data('weight', weight);
        $sackdata.text('$'+ val + ' ,' + weight + 'kg');
    }
    var self = this             //so that js knows we're talking about the item, instead of whateverelse is passed in.
    this.move = function(){     //move the item, as well as updates data.
        self.remove()
        if (!self.stolen){
            self.stolen = true;
            self.draw($('#bouglar'));
            self.updatesack(self.value, self.weight);
        }
        else
        {
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
        items[i] = new item ($items[i].getAttribute('src'), parseInt($items[i].getAttribute('data-value')), parseInt($items[i].getAttribute('data-weight')), $items[i].getAttribute('data-name'), i);
        items[i].draw($('#house'));    //draw the item
    }
    $('.knapsack').remove();//removes the initial div
    //function to sync what is stored in sackdata onto the screen.

    //to move the items across the screen by id, therefore have to be here. Also keeps track of data.

});