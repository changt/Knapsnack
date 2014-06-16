
//item 'class' constructor, but is actrually a function, since js don't have classes
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
    this.$img = $('<img class = "item_img" onclick = "move('+ this.id +')" src="' + img + '" />');   //use item class to modify css
    this.$txt = $('<div class = "item_txt"> $' + value + ' ,' + weight + ' kg </div>');
    this.$container.append(this.$img);
    this.$container.append(this.$txt);
    //draws the item or removes it
    this.draw = function($div){
        $div.append(this.$container);
    }
    this.remove = function(){
        this.$container.remove()
    }
}
//move function to move the img

//executes after browser loads
$(function() {
    console.log('got here')
//makes a list of items
    var $items  = $('.knapsack *');
    var items = [];
    var $sackdata = $('#sack_data_h');
    var sackdata ={
        value: 0,
        weight: 0,
    }
    for (i=0; i<$items.length; i++){
        items[i] = new item ($items[i].getAttribute('src'), parseInt($items[i].getAttribute('data-value')), parseInt($items[i].getAttribute('data-weight')), $items[i].getAttribute('data-name'), i);
    //draw the item
        items[i].draw($('#house'));
    }
//removes the initial div
    $('.knapsack').remove();
    console.log('got here')
//to move the items across the screen by id, therefore have to be here. Also keeps track of data.
    function update_sack(){
        $sackdata.text('$'+ sackdata.value + ' ,' + sackdata.weight + 'kg')
    }
    function move(id)
        {
            items[id].remove();
            if (items[id].stolen == false){
                items[id].stolen = true
                items[id].draw($('#bouglar'))
                sackdata.value += items[id].value
                sackdata.weight += items[id].weight
                update_sack()
            }else{
                items[id].stolen = false
                items[id].draw($('#house'))
                sackdata.value -= items[id].value
                sackdata.weight -= items[id].weight
                update_sack()
            }
        }
    window.move= move       //make the move function global so it can be called from a item.
    

});