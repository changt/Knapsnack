//sound sources.
    var failsnd = new Audio("fail.wav")
    var getsnd = new Audio("get.wav")
//global parameters to be set by user



//item 'class', but is actrually a function
//reference: http://www.phpied.com/3-ways-to-define-a-javascript-class/
function item (img, value, weight, name){
    this.value = value;
    this.weight = weight;
    this.name = name;
    this.stolen = false;
    var $sackdata = $('#sack_data_h');
    //makes some containers and txt for the item
    var $container = $('<div class = "item"/div>')
    var $img = $('<img class = "item_img"  src="' + img + '" />');   //use item class to modify css
    var $txt_v = $('<div class = "item_txt_v">');
    var $txt_n = $('<div class = "item_txt_n">');
    $txt_n.text(name)
    $txt_v.text('$' + value + ' ,' + weight + ' kg')
    $container.append($img);
    $container.append($txt_n);
    $container.append($txt_v);
    var maxweight = $sackdata.data('maxweight')
    //draws the item or removes it
    this.draw = function($div){
        $div.append($container);
        $($img).click(this.move)           
    }
    this.remove = function(){
        $container.remove()
    }
    this.animate_horizontal = function(len){            //calls an animation that moves to the right by len px. Doesn't work yet.
        console.log($container)
        $($container).css("position", "fixed")
        $($img).animate({marginLeft: len});
    }
    this.updatesack = function(value, weight){  //updates data function. INCREMENTS by value and weight.
        var val = $sackdata.data('value') + value;
        var weight = $sackdata.data('weight') + weight;
        $sackdata.data('value',val);
        $sackdata.data('weight', weight);
        $sackdata.text('$'+ val + ' ,' + weight + 'kg');
    }
    var self = this ;            //so that js knows we're talking about the item, instead of whateverelse is passed in.
    this.move = function(){     //move the item, as well as updates data. also checks for overweight

        if (!self.stolen){
            if(($sackdata.data('weight')+self.weight)<=maxweight){
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
                $('.message').slideDown(400, function(){
                    setTimeout(function(){$('.message').slideUp(500)}, 1000)}); //300ms: appearing animation; 500ms: hiding animation; 1000ms: time displayed.
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
    var numitems = $('.knapsack').data('numitems')  //user specified number of items to show.
    console.log(numitems)
    //makes a list of items
    var $items  = [];   //jquery selection of items
    var items = [];     //all availble actrual item objects
    var selected_items = [];    //items to be presented on screen
    
    //Ajax code. Currently loads a local static page. In the future, hopefully use a server to load data from the interweb. 
    $.ajax({
        url: 'items.html',
        success: update_s,
        error:update_f
        //dataType: dataType
    });
    function update_s(data){
        //parse the html page for pictures, weights, names and value.
        var $data = $(data)
        var $items_data = $data.find('#mw-content-text .wikitable')    //the items' data are in the wikitable under the #mw-content-text div.
        $items = $items_data.next().find(".thumbimage")  //  the item pics are stored inside the div immediately following the table.
        $items.each(function(index,element){
            //set weight, value and name onto the html.
            $(element).data('value',$($items_data[index]).find("td:contains('Value')").next().text()) //the actrual value is contained in the td immedeately following the one that contains the text "value". same goes for weight.
            $(element).data('weight', $($items_data[index]).find("td:contains('Weight')").next().text())   
            $(element).data('name',$(element).parent().parent().find(".thumbcaption").text().split("\n")[2])    //the name comes with two "newlines"
        });
        draw_items()       //need to be called after external page loads.

    }
    function update_f(jqXHR,textStatus,errorThrown){
        $items  = $('.knapsack *'); //use local data if load fails. 
        draw_items()
    }
    function draw_items(){
        for (i=0; i<$items.length; i++){
            items[i] = new item ($($items[i]).attr('src'), parseInt($($items[i]).data('value')), parseInt($($items[i]).data('weight')), $($items[i]).data('name'));
        }
        if (numitems > $items.length){
            numitems = $items.length        //when we don't have that many items, we show all we have
        }
        items.sort(function() {return (Math.round(Math.random())-0.5)})    //randomly sort the array. imperfect, but works.
        for (i=0; i<numitems; i++){
            items[i].draw($('#house'));
        }
        
    }
    $('.knapsack').remove();//removes the initial div
});