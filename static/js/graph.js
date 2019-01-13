RENDER_SMA = false
RENDER_EMA = false
RENDER_MACD = false
RENDER_VOLUME = false
RENDER_PREDICTIONS = false



// TODO MIHAI: Add pretrained model names here. Also add a folder /static/datasample/<model_name> containing the combined history+prediction for that particular model
PRETRAINED_MODELS = ['Linear-Regression', 'Long-Short-Term-Memory']

// TODO MIHAI: Optional Add company names here. Also add a dataset file "<company_name>.us.txt" in each model folder resulting in /static/datasample/<model_name>/<company_name>.us.txt
COMPANY_NAMES = ['AAPL', 'GOOGL', 'AMZN', 'ARCO', 'ARAY', 'AN', 'ANH', 'PRK', 'QCOM']



var PRETRAINED_MODEL = "Linear-Regression";
var COMPANY_NAME = "AAPL";
var history_feed, predicted_feed;


PREDICTION_STEPS = 30
INITIAL_STEPS = 150

var started = false;

var margin = {top: 20, right: 200, bottom: 30, left: 200},
    width = d3.select("#graph-container").node().getBoundingClientRect().width - margin.left - margin.right,
    height = d3.select("#graph-container").node().getBoundingClientRect().height + 300 - margin.top - margin.bottom;
    //    width = 600,
    //    height = 800;
var svg = d3.select("#graph-container").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

// init buttons
function checkSMA() {
        RENDER_SMA = document.getElementById('fancy-checkbox-success').checked
        console.log('render sma: ' + RENDER_SMA)
}

function checkEMA() {
        RENDER_EMA = document.getElementById('fancy-checkbox-primary').checked
        console.log('render ema: ' + RENDER_EMA)
}

function checkMACD() {
        RENDER_MACD = document.getElementById('fancy-checkbox-default').checked
        console.log('render macd: ' + RENDER_MACD)
}

function checkVolume() {
        RENDER_VOLUME = document.getElementById('fancy-checkbox-warning').checked
        console.log('render volume: ' + RENDER_VOLUME)
}

function checkPredictions() {
        RENDER_PREDICTIONS = document.getElementById('fancy-checkbox-danger').checked
        console.log('render predictions: ' + RENDER_PREDICTIONS)

        if (RENDER_PREDICTIONS) {            
                svg.append("line")
                .attr("x1", width - PREDICTION_STEPS)  //<<== change your code here
                .attr("y1", 0)
                .attr("x2", width - PREDICTION_STEPS)  //<<== and here
                .attr("y2", height)
                .style("stroke-width", 3)
                .style("stroke", "black")
                .style("stroke-dasharray", ("3, 3"))
                .style("fill", "none");
        }
        else {
                svg.selectAll("line").remove()
        }
}

function changeModel(name) {
        for (var i = 0; i < PRETRAINED_MODELS.length; i++) {
                document.getElementById(PRETRAINED_MODELS[i]).classList.remove('active')
        }
        PRETRAINED_MODEL = name
        document.getElementById(name).classList.add('active')
        console.log('pretrained model: ' + PRETRAINED_MODEL)

        changeDataFeed(COMPANY_NAME, PRETRAINED_MODEL)
}

function changeCompany(name) {
        for (var i = 0; i < COMPANY_NAMES.length; i++) {
                document.getElementById(COMPANY_NAMES[i]).classList.remove('active')
        }
        COMPANY_NAME = name
        document.getElementById(name).classList.add('active')
        console.log('pretrained model: ' + COMPANY_NAME)

        changeDataFeed(COMPANY_NAME, PRETRAINED_MODEL)
}


function changeDataFeed(companyName, modelName) {
                
        var feed_url = "static/datasample/" + modelName.toLowerCase() + "/" + companyName.toLowerCase() + ".us.txt"
 
        d3.csv(feed_url, function(error, csv) {
            var accessor = ohlc.accessor();
            history_feed = csv.map(function(d) {
                return {
                    date: parseDate(d.Date),
                    open: +d.Open,
                    high: +d.High,
                    low: +d.Low,
                    close: +d.Close,
                    volume: +d.Volume,

                };
           
            }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
                
            predicted_feed = csv.map(function(d) {
                return {
                    date: parseDate(d.Date),
                    
                    // TODO mihai: comment this and uncomment the other block (this changes predicted values to be extracted from Popen, Phigh, Plow, Pclose,Pvolume columns)
                    open: +d.Open,
                    high: +d.High,
                    low: +d.Low,
                    close: +d.Close,
                    volume: +d.Volume,
                    
                //     open: +d.Popen,
                //     high: +d.Phigh,
                //     low: +d.Plow,
                //     close: +d.Pclose,
                //     volume: +d.Pvolume,

                };
           
            }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
           
            if (!started) {
                redraw(history_feed.slice(0, INITIAL_STEPS));
            }
        });
}


function appendModel(name) {
        var list = document.getElementById('model-list')
        var button = document.createElement('button');
        button.classList.add('list-group-item')
        button.classList.add('list-group-item-action')
        button.addEventListener('click', function(){
                changeModel(name);
            });
        button.appendChild(document.createTextNode(name));
        button.setAttribute("id", name); // added line
        list.appendChild(button);
        
}

function appendCompany(name) {
        var list = document.getElementById('company-list')
        var button = document.createElement('button');
        button.classList.add('list-group-item')
        button.classList.add('list-group-item-action')
        button.addEventListener('click', function(){
                changeCompany(name);
        });
        button.appendChild(document.createTextNode(name));
        button.setAttribute("id", name); // added line
        list.appendChild(button);
}


// Populate models
for (var i = 0; i < PRETRAINED_MODELS.length; i++) {
        appendModel(PRETRAINED_MODELS[i])
}

// Populate companies
for (var i = 0; i < COMPANY_NAMES.length; i++) {
        appendCompany(COMPANY_NAMES[i])
}


var parseDate = d3.timeParse("%Y-%m-%d");
var x = techan.scale.financetime()
        .range([0, width]);
var y = d3.scaleLinear()
        .range([height, 0]);
var yVolume = d3.scaleLinear()
        .range([y(0), y(0.2)]);
var ohlc = techan.plot.ohlc()
        .xScale(x)
        .yScale(y);

var sma0 = techan.plot.sma()
        .xScale(x)
        .yScale(y);
var sma0Calculator = techan.indicator.sma()
        .period(10);

var ema1 = techan.plot.ema()
        .xScale(x)
        .yScale(y);
var ema1Calculator = techan.indicator.ema()
        .period(20);

var macd0 = techan.plot.macd()
        .xScale(x)
        .yScale(y);

var volume = techan.plot.volume()
        .accessor(ohlc.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
        .xScale(x)
        .yScale(yVolume);
var xAxis = d3.axisBottom(x);
var yAxis = d3.axisLeft(y);
var volumeAxis = d3.axisRight(yVolume)
        .ticks(3)
        .tickFormat(d3.format(",.3s"));
var timeAnnotation = techan.plot.axisannotation()
        .axis(xAxis)
        .orient('bottom')
        .format(d3.timeFormat('%Y-%m-%d'))
        .width(65)
        .translate([0, height]);
var ohlcAnnotation = techan.plot.axisannotation()
        .axis(yAxis)
        .orient('left')
        .format(d3.format(',.2f'));
var volumeAnnotation = techan.plot.axisannotation()
        .axis(volumeAxis)
        .orient('right')
        .width(35);
var crosshair = techan.plot.crosshair()
        .xScale(x)
        .yScale(y)
        .xAnnotation(timeAnnotation)
        .yAnnotation([ohlcAnnotation, volumeAnnotation])
        .on("move", move);

var defs = svg.append("defs");

defs.append("clipPath")
        .attr("id", "ohlcClip")
    .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);
svg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
var ohlcSelection = svg.append("g")
        .attr("class", "ohlc")
        .attr("transform", "translate(0,0)");
ohlcSelection.append("g")
        .attr("class", "volume")
        .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
        .attr("class", "candlestick")
        .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
        .attr("class", "indicator sma ma-0")
        .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
        .attr("class", "indicator ema ma-1")
        .attr("clip-path", "url(#ohlcClip)");
ohlcSelection.append("g")
        .attr("class", "indicator macd ma-0")
        .attr("clip-path", "url(#ohlcClip)");
svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")");
svg.append("g")
        .attr("class", "y axis")
    .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Price ($)");
svg.append("g")
        .attr("class", "volume axis");
svg.append('g')
        .attr("class", "crosshair ohlc");
svg.append("g")
        .attr()


var coordsText = svg.append('text')
        .style("text-anchor", "end")
        .attr("class", "coords")
        .attr("x", width - 5)
        .attr("y", 15);

function redraw(data) {
    started = true;
    var accessor = ohlc.accessor();
    x.domain(data.map(accessor.d));
    // Show only 150 points on the plot
    x.zoomable().domain([data.length-130, data.length]);
    // Update y scale min max, only on viewable zoomable.domain()
    y.domain(techan.scale.plot.ohlc(data.slice(data.length-130, data.length)).domain());
    yVolume.domain(techan.scale.plot.volume(data.slice(data.length-130, data.length)).domain());
    // Setup a transition for all that support
    svg.each(function() {
                var selection = d3.select(this);
                selection.select('g.x.axis').call(xAxis);
                selection.select('g.y.axis').call(yAxis);
                selection.select("g.volume.axis").call(volumeAxis);

                selection.select("g.candlestick").datum(data).call(ohlc);
                if (RENDER_SMA) selection.select("g.sma.ma-0").datum(sma0Calculator(data)).call(sma0);
                else selection.select("g.sma.ma-0").datum(sma0Calculator([])).call(sma0);

                if (RENDER_EMA) selection.select("g.ema.ma-1").datum(ema1Calculator(data)).call(ema1);
                else selection.select("g.ema.ma-1").datum(ema1Calculator([])).call(ema1);

                if (RENDER_MACD) selection.select("g.macd.ma-0").datum(techan.indicator.macd()(data)).call(macd0);
                else selection.select("g.macd.ma-0").datum(techan.indicator.macd()(data)).call(macd0);

                if (RENDER_VOLUME) selection.select("g.volume").datum(data).call(volume);
                else selection.select("g.volume").datum([]).call(volume);
                
                svg.select("g.crosshair.ohlc").call(crosshair);
        });

    // Set next timer expiry
    setTimeout(function() {
        var newData;
        if(data.length < history_feed.length) {

            if (RENDER_PREDICTIONS) {
                    history_data = history_feed.slice(0, data.length - PREDICTION_STEPS + 1)
                    prediction_data = predicted_feed.slice(data.length - PREDICTION_STEPS + 1, data.length + 1)

                    newData = history_data.concat(prediction_data)
            }
            else {
                    newData = history_feed.slice(0, data.length + 1)
            }
        }
        redraw(newData);
    }, 1000); // Randomly pick an interval to update the chart
}







function move(coords) {
    coordsText.text(
            timeAnnotation.format()(coords.x) + ", " + ohlcAnnotation.format()(coords.y)
    );
}

changeCompany('AAPL');
changeModel("Linear-Regression")
