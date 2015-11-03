window.addEventListener("load",run);
      
function run () {
    initializeView();
    setupOverview();
    // get data, call f when done
    getDataRows(function(data) {
        populateSelectors(data);
	setupEventListeners();
	GLOBAL.data = data;
	updateOverview() });
}


// global variables 

var GLOBAL = { data: [],
	       Topic: ["Contraceptives",
		       "Divorce",
		       "Abortion",
		       "Homosexuality",
		       "Alcohol"],
	       segments: ["Gender",
			  "Age",
			  "Marriage status"],
	       update: updateOverview
	     }


function setupEventListeners () { 
    d3.select(".filter")
	.on("change",function() { 
		GLOBAL.update(); })   
        // nice use of higher-order functions
}


function populateSelectors (data) { 
    var Q164s = d3.set();
    var Q165s = d3.set();
    var Q187s = d3.set();

    data.forEach(function(r) {
	Q164s.add(r.Q164);
	Q165s.add(r.Q165);
	Q187s.add(r.Q187);
    });
    d3.select("#select-Q164")
	.selectAll("option")
	.data(Q164s.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});

    d3.select("#select-Q165")
	.selectAll("option")
	.data(Q165s.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});

    d3.select("#select-Q187")
	.selectAll("option")
	.data(Q187s.values().sort())
	.enter()
	.append("option")
	.attr("value",function(d) { return d; })
        .property("selected",true)
	.text(function(d) { return d;});
}


function isSelected (selectorId,val) {
    return d3.select("#"+selectorId+" > option[value='"+val+"']")
	.property("selected");
}


function keepSelectorsRow (r) { 
    return (isSelected("select-Q164",r.Q164) &&
	    isSelected("select-Q165",r.Q165) &&
	    isSelected("select-Q187",r.Q187));
}



// split data into groups based on 'col' values
// (only process rows satisfying 'pred')

function countSplitByColumn (data,pred,col) { 
    var counts = { };
    var all = 0;
    data.forEach(function(r) {
	if (pred(r)) { 
	    all += 1;
	    c = r[col];
	    if (c in counts) {
		counts[c] += 1;
	    } else {
		counts[c] = 1;
	    }
	}
    });
    return {all:all,counts:counts};
}




function computeSizes (svg) { 
    
    // get the size of the SVG element
    var height = svg.attr("height");
    var width = svg.attr("width");
    var margin = 100;

    // the chart lives in the svg surrounded by a margin of 100px

    return {height:height,
	    width: width,
	    margin: margin,
	    chartHeight: height-2*margin,
	    chartWidth: width-2*margin}
}    



function initializeView () { 

    var svg = d3.select("#viz");

    var s = computeSizes(svg);

    svg.append("text")
	.attr("id","title")
	.attr("x",s.width/2)
 	.attr("y",s.margin/3)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
}


function setupOverview () { 

    var svg = d3.select("#viz");
    var s = computeSizes(svg);
    var barWidth = s.chartWidth/(2*GLOBAL.Topic.length-1);

    // get rid of old view
    svg.selectAll("g").remove();

    svg.select("#title")
	.text("Morality")
	.on("click",null);

    sel = svg.selectAll("g")
	.data(GLOBAL.Topic)
	.enter().append("g")

    sel.append("rect")
	.attr("class","bar")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth; })
	.attr("y",s.height-s.margin)
	.attr("width",barWidth)
	.attr("height",0)
        // tricky tricky!!
	.on("click",function(d,i) { 
            hideToolTip();
            switchToMorality(GLOBAL.Topic[i]); 
        })
	.on("mouseover", function(d,i) { 
	    this.style.fill = "#772310"; 
	    var bar = d3.select(this);
	    showToolTip(+bar.attr("x")+bar.attr("width")/2,
			+bar.attr("y")-TOOLTIP.height/2-5,
			GLOBAL.Topic[i],
			d);
	})
	.on("mouseout", function() { 
	    this.style.fill = "#003b5c"; 
	    hideToolTip();
	}) 

    sel.append("text")
	.attr("class","value")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
 	.attr("y",s.height-s.margin-20)
	.attr("dy","0.3em")
	.style("text-anchor","middle");

    sel.append("text")
	.attr("class","label")
	.attr("x",function(d,i) { return s.margin+(i*2)*barWidth+barWidth/2; })
	.attr("y",s.margin+s.chartHeight+50)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
	.text(function(d) { return d; });
}


function updateOverview () {

    console.log("UPDATING OVERVIEW");

    var svg = d3.select("#viz");
    var s = computeSizes(svg);

    // aggregate data for every social Topic site 
    // (count # of 'Yes')

    var COLUMN = 
	{"Contraceptives": "Q84A",
	 "Divorce": "Q84B",
	 "Abortion": "Q84C",
	 "Homosexuality": "Q84D",
	 "Alcohol": "Q84E"}
    var counts = [0,0,0,0,0];
    var total_count = 0;


    // alternative way of computing counts

    GLOBAL.Topic.forEach(function(m,i) { 
	var c = countSplitByColumn(GLOBAL.data,keepSelectorsRow, COLUMN[m]); 
	total_count = c.all; 
	console.log(total_count)
        // tricky -- if there are no "Yes", 
        //   there will be no "Yes" field in the counts
	counts[i] = "Yes" in c.counts ? c.counts.Yes : 0;
    });


    d3.select("#span-base") 
	.text(total_count);

    var yPos = d3.scale.linear() 
	.domain([0,total_count])
	.range([s.height-s.margin,s.margin]);

    var height = d3.scale.linear() 
	.domain([0,total_count])
	.range([0,s.chartHeight]);

    sel = svg.selectAll("g") 
	.data(counts);

    sel.select(".bar") 
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d); }) 
	.attr("height",function(d) { return height(d); });

    sel.select(".value") 
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d) - 20; }) 
	.text(function(d) { return total_count > 0 ? Math.round(100*d/total_count)+"%" : null; });
}


function switchToMorality (m) { 
    console.log("Switching to topic ",m);
    setupMorality(m);
    GLOBAL.update = function() { updateMorality(m); };
    updateMorality(m)
}


function switchToOverview () { 
    console.log("Switching to overview");
    setupOverview();
    GLOBAL.update = updateOverview;
    updateOverview(); 
}


function setupMorality (m) {

    var svg = d3.select("#viz");
    var s = computeSizes(svg);
    var barWidth = s.chartWidth/(2*GLOBAL.segments.length-1);

    // get rid of old view
    svg.selectAll("g").remove();

    svg.select("#title")
	.text(m)
	.on("click",switchToOverview);

    sel = svg.selectAll("g")
	.data(GLOBAL.segments)
	.enter().append("g")
        // alternate way to position bars
        // instead of placing each individually with x/y attributes
        // place them with a "translate" transform
	.attr("transform",
	      function(d,i) { return "translate("+(s.margin+(i*2)*barWidth)+",0)"; });

/*  GETTING RID OF THESE SO THAT WE ONLY NEED TO
    PUT CODE FOR THE TOOLTIPS ONCE
    ALSO, THESE ARE NOT STRICTLY NECESSARY FOR STACKED BARS
    WE COULD HAVE REMOVED THEM EARLIER
 
    sel.append("rect")
	.attr("class","bar")
        .attr("x",0)
	.attr("y",s.height-s.margin)
	.attr("width",barWidth)
	.attr("height",0);

    sel.append("text")
	.attr("class","value")
	.attr("x",barWidth/2)
 	.attr("y",s.height-s.margin-20)
	.attr("dy","0.3em")
	.style("text-anchor","middle");
*/


    sel.append("text")
	.attr("class","label")
	.attr("x",barWidth/2)
	.attr("y",s.margin+s.chartHeight+50)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
	.text(function(d) { return d; });
}


// given an array of objects (each with a 'value' field)
// add a 'cumulate' field to each object holding the
// sum of all the values before that object

function cumulate (arr) {
    var cumulative = 0;
    for (var i=0; i<arr.length; i++) {
	arr[i].cumulative = cumulative;
	cumulative += arr[i].value;
    }
}


function updateMorality (m) {

    console.log("UPDATING Topic");


    var svg = d3.select("#viz");
    var s = computeSizes(svg);

    var barWidth = s.chartWidth/(2*GLOBAL.segments.length-1);

    // group data by values of Q164/Q165/Q187 columns
    // independently, and accumulate the various counts
    // in the 'counts' array

    var Topic_COLUMN = 
	{"Contraceptives": "Q84A",
	 "Divorce": "Q84B",
	 "Abortion": "Q84C",
	 "Homosexuality": "Q84D",
	 "Alcohol": "Q84E"}
    var SEGMENT_COLUMN = 
	{"Gender":"Q164",
	 "Age":"Q165",
	 "Marriage status":"Q187"};

    var counts = [{},{},{}];
    var total_count = 0;
    
    GLOBAL.segments.forEach(function(seg,i) { 
	var c = countSplitByColumn(GLOBAL.data,
				   function(r) { return keepSelectorsRow(r) && r[Topic_COLUMN[m]]==="Yes"; },
				   SEGMENT_COLUMN[seg]); 
	total_count = c.all; 
	counts[i] = c.counts;
    });


    d3.select("#span-base") 
	.text(total_count);


    // convert the counts dictionaries into arrays
    // easier to work with in d3
    // 
    // Exercise: figure out what this does

    counts.forEach(function(c,i) { 
	// first convert to an array of entries
	var d = d3.entries(c);  
        // sort them
	d.sort(function(a,b) { return d3.ascending(a.key,b.key); });
	// then cumulate them
	cumulate(d);
	counts[i] = d;
    })


    // colors for the groups

    var colorsRng = ["#003b5c","#227fb6","#67bbe2","#9bddf8"];

    var colors = {
	"Female": colorsRng[0],
	"Male": colorsRng[1],

	"0": colorsRng[0],
	"10": colorsRng[1],
	"20": colorsRng[2],
	"30": colorsRng[3],
	"40": colorsRng[0],
	"50": colorsRng[1],
	"60": colorsRng[2],
	"70": colorsRng[3],
	"80": colorsRng[0],
	"90": colorsRng[1],

	"Divorced": colorsRng[0],
	"Living with a partner": colorsRng[1],
	"Married": colorsRng[2],
	"Never been married": colorsRng[3],
	"No": colorsRng[0],
	"Refused": colorsRng[1],
	"Separated": colorsRng[2],
	"Widowed": colorsRng[3]
    };

    var yPos = d3.scale.linear() 
	.domain([0,total_count])
	.range([s.height-s.margin,s.margin]);

    var height = d3.scale.linear() 
	.domain([0,total_count])
	.range([0,s.chartHeight]);

    sel = svg.selectAll("g") 
	.data(counts);

    var bars = sel.selectAll(".bar")
	.data(function(d) { return d;});

    bars.enter().append("rect")
	.attr("class","bar")
	.style("fill",function(d,i) { return colors[d.key]; })
	.attr("y",yPos(0))
	.attr("height",0)
	.attr("width",barWidth)
	.on("mouseover",function(d,i) { 
	    this.style.fill = "#772310"; 
	    var bar = d3.select(this);
	    showToolTip(+bar.attr("x")+bar.attr("width")/2,
			+bar.attr("y")-TOOLTIP.height/2-5,
			m+" ("+d.key+")",
			d.value);
	    // dirty hack!
	    d3.selectAll(".tooltip")
		.attr("transform",
		      d3.select(this.parentNode).attr("transform"));
	})
	.on("mouseout",function(d,i) { 
	    this.style.fill = colors[d.key]; 
	    hideToolTip();
	});
    bars.exit().remove()

    sel.selectAll(".bar")
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d.cumulative+d.value); })
	.attr("height",function(d) { return height(d.value); })
	.style("fill",function(d,i) { return colors[d.key]; })

    var values = sel.selectAll(".value")
	.data(function(d) { return d;});

    values.enter().append("text")
	.attr("class","value")
	.attr("x",barWidth/2)
	.attr("y",s.height-s.margin)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
    values.exit().remove();

    sel.selectAll(".value")
	.style("fill","white")
	.transition()
	.duration(1000)
	.attr("y",function(d) { return yPos(d.cumulative+d.value/2); })
	.text(function(d) { return Math.round(100*d.value/total_count)+"%"; });
}


//
//   Tooltips
// 

var TOOLTIP = {width:250, height:70}

function showToolTip (cx,cy,text1,text2) {

    var svg = d3.select("#viz");

    svg.append("rect")
	.attr("class","tooltip")
	.attr("x",cx-TOOLTIP.width/2)
	.attr("y",cy-TOOLTIP.height/2)
	.attr("width",TOOLTIP.width)
	.attr("height",TOOLTIP.height)
	.style("fill","#dd6112")
	.style("stroke","#772310")
	.style("stroke-width","3px");

    svg.append("text")
	.attr("class","tooltip")
	.attr("x",cx)
	.attr("y",cy-15)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
	.text(text1);

    svg.append("text")
	.attr("class","tooltip")
	.attr("x",cx)
	.attr("y",cy+15)
	.attr("dy","0.3em")
	.style("text-anchor","middle")
	.text(text2);

}


function hideToolTip () {
    d3.selectAll(".tooltip").remove();
}


/* depending on your browser and your local configuration,
   you may need to have a web server deliver the file data.csv
   just use the default python web server */

function getDataRows (f) {
    d3.csv("america.csv",
	   function(error,data) {
	       f(data);
	   });
}
