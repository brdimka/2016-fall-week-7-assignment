console.log('7.1');

//First, append <svg> element and implement the margin convention
var m = {t:50,r:200,b:50,l:200};
var outerWidth = document.getElementById('canvas').clientWidth,
    outerHeight = document.getElementById('canvas').clientHeight;
var w = outerWidth - m.l - m.r,
    h = outerHeight - m.t - m.b;

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width',outerWidth)
    .attr('height',outerHeight)
    .append('g')
    .attr('transform','translate(' + m.l + ',' + m.t + ')');

var scaleX, scaleY;

//Step 1: importing multiple datasets - Each defer command has 3 arguements
//it doesn't need to be exactly 3 argumentts.
d3.queue() //HAS TO BE IN CORRECT ORDER!
    .defer(d3.csv,'../data/olympic_medal_count_1900.csv',parse)//d3.csv is 2 arguments
    .defer((d3.csv,'../data/olympic_medal_count_1960.csv',parse))
    .defer((d3.csv,'../data/olympic_medal_count_2012.csv',parse))
    .await(function(err,rows1900,rows1960,rows2012){
      console.log(rows1900);
      console.log(rows1960);
      console.log(rows2012);


        //Draw axis
        scaleY = d3.scaleLinear()
            .domain([0,120])
            .range([h,0]);
        scaleX = d3.scaleLinear()
            .domain([0,4])
            .range([0,w]); //spaces them equally along the width of the screen

        var axisY = d3.axisLeft()
            .scale(scaleY) //left side of screen. ticks & numbers go to left by default.
            //negative tick size reverses tick (right). ticks line entire width of chart.
            .tickSize(-w-200);

        plot.append('g')
            .attr('class','axis axis-y')
            .attr('transform','translate(-100,0)')
            .call(axisY);

        //Step 2: implement the code to switch between three datasets
        d3.select('#year-1900').on('click', function(){ //refers to 1900 button. selets button, listens for click events
            draw(rows1900); //code needs to be re-usable.
        }); //draws 1900 when button is clicked.

        d3.select('#year-1960').on('click', function(){
            draw(rows1960);
        });

        d3.select('#year-2012').on('click', function(){
            draw(rows2012);
        });
    });


//Step 3: implement the enter / exit / update pattern
function draw(rows){ //represents top 5 countries in given row
    var top5 = rows.sort(function(a,b){
        return b.count - a.count;
    }).slice(0,5); //gives you 5 elements

    console.log(top5);
    //Update set
    plot.selectAll('country')
      .data(top5, function(d){ return d.country})//second arguement is the matching criteria (It is the key). One element consistantly representing the same thing.
    //Enter set
    var enter = update.enter()
      .append('g').attr('class','country')
      .attr('transform',function(d,i){//d stands for data, i stands for index. index is order of the element
        return 'translate(' + scaleX(i) + '.0)';
      });
    enter.append('rect')
      .attr('x',0)//doesn't matter
      .attr('y', function(d){//needs to be set by data (d).
        return scaleY(d.count);//60 into scale y gives half height (half of 120).
      })
      .attr('width',8)//doesn't matter
      .attr('height', function(d){//needs to be set by data
        return h - scaleY(d.count); //h over 2. a count of 90 would be 3/4 the height, 1/4 from the top.
      })
    enter.append('text')
      .attr('y',function(d){ return scaleY(d.count)})
      .text(function(d){return d.country})
      .attr('text-anchor','middle');

    //exit
    var exit = update.exit().remove();

    //update
    var update = update.update().exit();

}

function parse(d){
    return {
        country: d.Country,
        count: +d.count
    }
}
