//sound sources.
    var failsnd = new Audio("fail.wav")
    var getsnd = new Audio("get.wav")
    var maxweight = 20  //default value. updated later if we use remote data.


//item 'class', but is actrually a function
//reference: http://www.phpied.com/3-ways-to-define-a-javascript-class/
function item (img, value, weight, name){
    //basic data. these are external.
    this.value = value;
    this.weight = weight;
    this.name = name;
    this.stolen = false;
    
    
    var self = this ;           //so that js knows we're talking about the item, instead of whateverelse is passed in.
    var $sackdata = $('#sack_data_h');
    //makes some containers and txt for the item. These are internal.
    var $container = $('<div class = "item"/div>')
    var $img = $('<img class = "item_img"  src="' + img + '" />');   //use item class to modify css
    var $txt_v = $('<div class = "item_txt_v">');
    var $txt_n = $('<div class = "item_txt_n">')

    $txt_n.text(name)
    $txt_v.text('$' + value + ' ,' + weight + ' kg')
    $container.append($img);
    $container.append($txt_n);
    $container.append($txt_v);
    //draws the item or removes it
    this.draw = function($div){
        $div.append($container);
        $container.css('display', 'inline-block');
        $($img).click(this.move)           
    }
    this.remove = function(){
        $container.remove()
    }
    this.animate = function(){            //a small animation that controls fading
        $container.hide()
        $container.fadeIn()
    }
    this.updatesack = function(value, weight){  //updates data function. INCREMENTS by value and weight.
        var val = $sackdata.data('value') + value;
        var weight = $sackdata.data('weight') + weight;
        $sackdata.data('value',val);
        $sackdata.data('weight', weight);
        $sackdata.text('$'+ val + ', Carry Weight: ' + weight + '/' + maxweight);
    }
    this.move = function(){     //move the item, as well as updates data. also checks for overweight
        if (!self.stolen){
            if(($sackdata.data('weight')+self.weight)<=maxweight){
                getsnd.play();
                self.remove()
                self.animate();
                self.stolen = true;
                self.draw($('#bouglar'));
                self.updatesack(self.value, self.weight);
            }
            else
            {
                failsnd.play();
                $('.message').fadeIn(400, function(){
                    setTimeout(function(){$('.message').fadeOut(500)}, 1000)}); //300ms: appearing animation; 500ms: hiding animation; 1000ms: time displayed.
            }
        }
        else
        {
            getsnd.play();
            self.remove();
            self.animate();
            self.updatesack(self.value*-1, self.weight*-1);
            self.stolen = false;
            self.draw($('#house'));
        }
    }
}

//executes after browser loads
$(function() {
    var numitems = $('.knapsack').data('numitems')  //user specified number of items to show.
    //makes a list of items
    var $items  = [];           //jquery selection of items
    var items = [];             //all availble actrual item objects, as defined by constructor above.
    var selected_items = [];    //items to be presented on 
    var uselocal                //whether we end up using local data or not.
    //yahoo yql service. Allows for AJAX cross-domain xml reference.
    site = 'uesp.net/wiki/Skyrim:Leveled_Items'
    var yql = "https://query.yahooapis.com/v1/public/yql?q=" + encodeURIComponent("select * from html where url='" + site+ "'");
    $.ajax({
        url: yql,
        success: update_s,
        error:update_f
    });
    function update_s(data){
        //parse the html page for pictures, weights, names and value.
        var $data = $(data)
        var $items_data = $data.find('#mw-content-text .wikitable')    //the items' data are in the wikitable under the #mw-content-text div.
        $items = $items_data.next().find(".thumbimage")  // the item pics are stored inside the div immediately following the table.
        $items.each(function(index,element){
            //set weight, value and name onto the html.
            var value = $items_data.eq(index).find("td:contains('Value')").next().text()
            var weight = $items_data.eq(index).find("td:contains('Weight')").next().text()
            var name = $(element).parent().parent().find(".thumbcaption").text() //the name comes with two "newline" characters
            var img_src = $(element).attr('src')
            items[index] = new item(img_src,parseInt(value),parseInt(weight),name)
        });
        uselocal = false;
        maxweight = 0;       //set our own maxweight if load is successful.
        draw_items();       //need to be called after external page loads.
    }
    function update_f(jqXHR,textStatus,errorThrown){   //use local data if load fails. Three paramenters are required by ajax and are not used.
        uselocal = true;
        $items  = $('.knapsack *'); 
        for (i=0; i<$items.length; i++){
            items[i] = new item ($items.eq(i).attr('src'), parseInt(items.eq(i).data('value')), parseInt($items.eq(i).data('weight')), $items.eq(i).data('name'));
        draw_items();
    }
    }
    
    function draw_items(){
        if (numitems > $items.length){
            numitems = $items.length        //when we don't have that many items, we show all we have
        }
        items.sort(function() {return (Math.round(Math.random())-0.5)})    //randomly sort the array. imperfect, but works.
        for (i=0; i<numitems; i++){
            selected_items[i] = items[i]
            items[i].draw($('#house'));
            if(!uselocal){
            maxweight += Math.floor(items[i].weight/2)         //keep carry weight an integer.
            }
        }
        items[i].updatesack(0,0)                               //initializes sack display.
    }
    $('.knapsack').remove();//removes the initial div
    adjust_size()
    
    $('.auto').click(Auto_Steal)
    
    function Auto_Steal(event){
        var sort_type = $(event.currentTarget).attr('id')
        selected_items.sort(function(a,b){
            if (sort_type == 'ratio'){
                return (b.value/b.weight - a.value/a.weight)
            }
            else if (sort_type == 'value'){
                return (b.value - a.value)
            }
            else{
                return (a.weight - b.weight)
            }
        })
        var counter = 0;
        //move everything to house first
        selected_items.forEach(function(item){
            if (item.stolen == true){
                item.move();
            }
        });
        //then move the first few items to the right.
        Place_interval = setInterval(Auto_Place, 300);
        function Auto_Place(){
            if (counter<numitems && $('#sack_data_h').data('weight')+selected_items[counter].weight<=maxweight){
                selected_items[counter].move();
                counter+= 1;
            }
            else
            {
                clearInterval(Place_interval);
            }
    }
    }

    
});
function adjust_size(){     //adjusts some css dynamically to counter browser window changes
    height = $('html').css('height');
    $('#main').css('height', height);
         }
$(window).resize(adjust_size);