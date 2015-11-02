window.addEventListener("load",run,false);

var GLOBAL = {
	data:[],
	activeData:[],
	activeCountry:'USA'
};



//US favor Q9A
//China Q9C
//Iran Q9D
//Russia Q9E
//EU Q9F
var favorToValue = {
	"Very favorable":2,
	"Somewhat favorable":1,
	"Very unfavorable":-2,
	"Somewhat unfavorable":-1,
	"Don't know":0,
	"Refused":0
};

var allowedEconomics = ["Very good", "Somewhat good", "Don't know",
	"Refused", "Very bad", "Somewhat bad"];

function sentimentData() {
	this.USA = 0;
	this.China = 0;
	this.Iran = 0;
	this.Russia = 0;
	this.EU = 0;
	this.Count = 0;

	this.normalize = function() {
		this.USA = this.USA / this.Count;
		this.China = this.China / this.Count;
		this.Iran = this.Iran / this.Count;
		this.Russia = this.Russia / this.Count;
		this.EU = this.EU / this.Count;
	}
}

function determineFill(data) {
	var score = data[GLOBAL.activeCountry];
	var red = 127 + Math.round(-parseFloat(score) * 63);
	var green = 127 + Math.round(parseFloat(score) * 63);
	return "rgb(" + red.toString() + "," + green.toString() + ",0)";

}


var countryList = {
	"United States": new sentimentData(),
	"Canada":new sentimentData(),
	"Mexico": new sentimentData(),
	"Chile": new sentimentData(),
	"Brazil": new sentimentData(),
	"Argentina": new sentimentData(),
	"Bolivia": new sentimentData(),
	"Venezuela": new sentimentData(),
	"El Salvador": new sentimentData(),
	"Egypt": new sentimentData(),
	"Senegal": new sentimentData(),
	"Nigeria": new sentimentData(),
	"Kenya": new sentimentData(),
	"Uganda": new sentimentData(),
	"Tunisia": new sentimentData(),
	"Ghana": new sentimentData(),
	"South Africa": new sentimentData(),
	"Czech Republic": new sentimentData(),
	"France": new sentimentData(),
	"Germany": new sentimentData(),
	"Spain": new sentimentData(),
	"Russia": new sentimentData(),
	"Britain": new sentimentData(),
	"Turkey": new sentimentData(),
	"Greece": new sentimentData(),
	"Poland": new sentimentData(),
	"Italy": new sentimentData(),
	"Lebanon": new sentimentData(),
	"Jordan": new sentimentData(),
	"Palestinian territories": new sentimentData(),
	"Israel": new sentimentData(),
	"South Korea": new sentimentData(),
	"Australia": new sentimentData(),
	"Japan": new sentimentData(),
	"Malaysia": new sentimentData(),
	"Indonesia": new sentimentData(),
	"Philippines": new sentimentData(),
	"China": new sentimentData(),
	"Pakistan": new sentimentData()

};

var countryToClass = {
	"United States": ".USA",
	"Canada":".CAN",
	"Mexico":".MEX",
	"Chile":".CHL",
	"Brazil": ".BRA",
	"Argentina":".ARG",
	"Bolivia":".BOL",
	"Venezuela":".VEN",
	"El Salvador":".SLV",
	"Egypt": ".EGY",
	"Senegal": ".SEN",
	"Nigeria": ".NGA",
	"Kenya": ".KEN",
	"Uganda": ".UGA",
	"Tunisia": ".TUN",
	"Ghana": ".GHA",
	"South Africa": ".ZAF",
	"Czech Republic": ".CZE",
	"France": ".FRA",
	"Germany": ".DEU",
	"Spain": '.ESP',
	"Russia": '.RUS',
	"Britain": '.GBR',
	"Turkey": '.TUR',
	"Greece": '.GRC',
	"Poland": '.POL',
	"Italy": '.ITA',
	"Lebanon": ".LBN",
	"Jordan": ".JOR",
	"Palestinian territories": ".PSE",
	"Israel": ".ISR",
	"South Korea":".KOR",
	"Australia": ".AUS",
	"Japan": ".JPN",
	"Malaysia": ".MYS",
	"Indonesia": ".IDN",
	"Philippines": ".PHL",
	"China": ".CHN",
	"Pakistan": ".PAK"
}



function run() {
	var dataSetsLoaded = 0;
	var dataToLoad = 5;
	var map = new Datamap({
		element: document.getElementById('container'),
		fills: {
			defaultFill: "#D3D3D3"
		}
		});

	d3.csv("/america1.csv", function(data) {
        GLOBAL.data = GLOBAL.data.concat(data)
        dataSetsLoaded += 1;
        if (dataSetsLoaded == dataToLoad) {
        	setData();
        }
        });

	d3.csv("/africa1.csv", function(data) {
        GLOBAL.data = GLOBAL.data.concat(data)
        dataSetsLoaded += 1;
        if (dataSetsLoaded == dataToLoad) {
        	setData();
        }
        });

        d3.csv("/europe1.csv", function(data) {
        GLOBAL.data = GLOBAL.data.concat(data)
        dataSetsLoaded += 1;
        if (dataSetsLoaded == dataToLoad) {
        	setData();
        }
        });
        d3.csv("/middle1.csv", function(data) {
        GLOBAL.data = GLOBAL.data.concat(data)
        dataSetsLoaded += 1;
        if (dataSetsLoaded == dataToLoad) {
        	setData();
        }
        });
        d3.csv("/apac1.csv", function(data) {
        GLOBAL.data = GLOBAL.data.concat(data)
        dataSetsLoaded += 1;
        if (dataSetsLoaded == dataToLoad) {
        	setData();
        }
        });

    d3.select('#opts')
  		.on('change', function() {
    	var newData = d3.select(this).property('value');
    	GLOBAL.activeCountry = newData;
    	display();   
});

  		$(function() {
    $('#fruits').change(function(e) {
        var selected = $(e.target).val();
        allowedEconomics = selected;
        setData();
    }); 
});
	//datamaps-subunit AFG

}

	function setData() {
		filter();
		GLOBAL.activeData.forEach(function(response) {
				countryList[response.COUNTRY]["USA"] += favorToValue[response["Q9A"]];
				countryList[response.COUNTRY]["China"] += favorToValue[response["Q9C"]];
				countryList[response.COUNTRY]["Iran"] += favorToValue[response["Q9D"]];
				countryList[response.COUNTRY]["Russia"] += favorToValue[response["Q9E"]];
				countryList[response.COUNTRY]["EU"] += favorToValue[response["Q9F"]];
				countryList[response.COUNTRY]["Count"] += 1;
				
		});
		for (key in countryList) {
			countryList[key].normalize();
		}
		display();
	}

	function filter() {
		console.dir(allowedEconomics);
		GLOBAL.activeData = [];
		GLOBAL.data.forEach(function(response) {
			if (allowedEconomics.indexOf(response["Q4"]) > -1) {
				GLOBAL.activeData.push(response);
			}
		});
		console.log(GLOBAL.activeData.length);
		console.dir("WE HAVE FILTERED");
		for (key in countryList) {
			countryList[key]["USA"] = 0;
			countryList[key]["China"] = 0;
			countryList[key]["Iran"] = 0;
			countryList[key]["Russia"] = 0;
			countryList[key]["EU"] = 0;
			countryList[key]["Count"] = 0;

		}
	}

	function display() {
		for (key in countryList) {
			var country = d3.select(countryToClass[key]);
			country.data([countryList[key]]
				);
			country.attr("style",function(d) {
					return "fill:" +determineFill(d);
				});
		}
	}
	//d3.select(".CAN").attr("style","fill: #050505");


