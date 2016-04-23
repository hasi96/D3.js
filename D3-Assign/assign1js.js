
var margin = {top: 50, right: 50, bottom: 150, left: 50},
    width = 800 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var	parseDate = d3.time.format("%d-%m-%Y");

var x = d3.scale.ordinal()
          .rangeRoundBands([0, width], .05);

var y = d3.scale.linear()
          .range([height, 0])
          .domain([0,100]);

var xAxis = d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickFormat(d3.time.format("%d-%m-%Y"));

var yAxis = d3.svg.axis()
              .scale(y)
              .orient("left")
              .ticks(10);


function showBy()
{
  var xShows = null, regionname = null;
  var showing = document.getElementById("showing");
  var region = document.getElementById("region").value;
  regionname = document.getElementById("regionname").value;
  var startdate = parseDate.parse(document.getElementById("startdate").value);
  var enddate = parseDate.parse(document.getElementById("enddate").value);
  var timeSpan = 0;
  if(startdate.getYear() == enddate.getYear())
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()-startdate.getMonth());
  else
    timeSpan = enddate.getDate()+1-startdate.getDate()+30*(enddate.getMonth()+12-startdate.getMonth())+360*(enddate.getYear()-startdate.getYear()-1);
  console.log(timeSpan);

  var displayTime = chooseTime(timeSpan);
  console.log(displayTime);

  d3.json("data.json", function(data)
  {



    var searchValue = searchRegion(region,regionname,data);
    var storeData;
    if(searchValue.length > 1)
      storeData = operation(displayTime+region,searchValue,data,startdate,enddate);
    else
      return 0;
    console.log(storeData);

    x.domain(storeData.map(function(d) { return d.date; }));

    svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
       .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.5em")
        .attr("transform", "rotate(-90)" );

    svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".7em")
       .style("text-anchor", "end")
       .text("Literacy rate");

    svg.selectAll("bar")
        .data(storeData)
        .enter()
          .append("rect")
          .style("fill", "steelblue")
          .attr("x", function(d) { return x(d.date); })
          .attr("width", x.rangeBand())
          .attr("y", function(d) { return y(d.literacy_rate); })
          .attr("height", function(d) { return height - y(d.literacy_rate); });



    if(region != "select")
    {
      showing.innerHTML = searchValue[0];
    }
    else {
      showing.innerHTML = "";
    }

  });
}

  function chooseTime(timeSpan)
  {
    if(timeSpan > 0 && timeSpan <= 900)
      return 'month';
    else if(timeSpan > 900 && timeSpan <= 10600)
      return 'year';
    else if(timeSpan > 10600 && timeSpan <= 106000)
      return 'decade';
    else
      return 'century';
  }

  function operation (value,id,data,startdate,enddate)
  {

    function opCenturyVillage ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/100);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/100)+"   "+year);
          if(Math.floor(date.getYear()/100) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;

    }

    function opDecadeVillage ()
    {
      var storeData=[];
      var year = Math.floor(startdate.getYear()/10);
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {

          console.log(Math.floor(date.getYear()/10)+"   "+year);
          if(Math.floor(date.getYear()/10) == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            console.log("Sum "+sum+" c" +count);
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }

        storeData.push({
          "date": parseDate.parse(value.data[i-count].date),
          "literacy_rate": sum/count
        });
      return storeData;
    }

    function opYearVillage ()
    {
      var storeData=[];
      var year = startdate.getYear();
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      var sum = 0, count = 0;
      for(var i=0;i < value.data.length;i++)
      {
        var date = parseDate.parse(value.data[i].date);

        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {
          if(date.getYear() == year)
          {
            sum+=value.data[i].val;
            count++;
          }
          else
          {
            storeData.push({
              "date": parseDate.parse(value.data[i-count].date),
              "literacy_rate": sum/count
            });
            year++;
            sum=value.data[i].val;
            count=1;
          }
        }
      }
      storeData.push({
        "date": parseDate.parse(value.data[i-count].date),
        "literacy_rate": sum/count
      });
      return storeData;

    }

    function opMonthVillage ()
    {
      var storeData=[];
      console.log(startdate.getYear()+"-"+startdate.getMonth()+"-"+startdate.getDate());
      var value = data.state[id[1]].district[id[2]].block[id[3]].panchayat[id[4]].village[id[5]];
      console.log(value.data.length);
      for(var i=0;i < value.data.length;i++)
      {
        if(parseDate.parse(value.data[i].date) >= startdate && parseDate.parse(value.data[i].date) <= enddate)
        {
          storeData.push({
            "date": parseDate.parse(value.data[i].date),
            "literacy_rate": value.data[i].val
          });
        }
      }
      return storeData;
    }

    var timeIn =
    {
      'centuryvillage': opCenturyVillage,
      'decadevillage': opDecadeVillage,
      'yearvillage': opYearVillage,
      'monthvillage': opMonthVillage,
    };
    return timeIn[value]();
  }

  function searchRegion (name,value,data)
  {
    function searchState ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        if(data.state[i].name == value)
          return ["State "+value+" is found",i];
      }
      return ["State "+value+" is not found"];
    }

    function searchDistrict ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          if(data.state[i].district[j].name == value)
            return ["District "+value+" is found",i,j];
        }
      }
      return ["District "+value+" is not found"];
    }

    function searchBlock ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            if(data.state[i].district[j].block[k].name == value)
              return ["Block "+value+" is found",i,j,k];
          }
        }
      }
      return ["Block "+value+" is not found"];
    }

    function searchPanchayat ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            for(var l=0;l<data.state[i].district[j].block[k].panchayat.length;l++)
            {
              if(data.state[i].district[j].block[k].panchayat[l].name == value)
                return ["Panchayat "+value+" is found",i,j,k,l];
            }
          }
        }
      }
      return ["Panchayat "+value+" is not found"];
    }

    function searchVillage ()
    {
      for(var i=0;i<data.state.length;i++)
      {
        for(var j=0;j<data.state[i].district.length;j++)
        {
          for(var k=0;k<data.state[i].district[j].block.length;k++)
          {
            for(var l=0;l<data.state[i].district[j].block[k].panchayat.length;l++)
            {
              for(var m=0;m<data.state[i].district[j].block[k].panchayat[l].village.length;m++)
              {
                if(data.state[i].district[j].block[k].panchayat[l].village[m].name == value)
                  return ["Village "+value+" is found",i,j,k,l,m];
              }
            }
          }
        }
      }
      return ["Village "+value+" is not found"];
    }

    var regionIn =
    {
      'state': searchState,
      'district': searchDistrict,
      'block': searchBlock,
      'panchayat': searchPanchayat,
      'village': searchVillage
    };
    return regionIn[name]();
  }
