//  scene 1
async function firstChart() {
    const margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = 1100 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("data/life-expectancy-vs-gdp-per-capita.csv");
    const year = 2015
    const filteredData = data.filter(function (d) {
        return d.year == year && d.population != "" && d.period_life_expectancy != "" && d.gdp_per_capita != "";
    });

    const continents = getContinent(); 
    continents.unshift("All");

    d3.select("#select-continent")
    .selectAll('continent-options')
    .data(continents)
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    })
    .attr("value", function (d) {
        return d;
    }) 

    function update(selectedGroup) {
        svg.selectAll(".bubbles")
            .style("opacity", function (d) {
                return selectedGroup === "All" || d.continent === selectedGroup ? 1 : 0;
            });
        
        d3.selectAll(".annotation-group").remove();

        if (selectedGroup === "All") {
            countryCodesAnnotations1().forEach(function (countryCode) {
                for (let i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].code === countryCode) {
                        const countryData = filteredData[i];
                        firstChartAnnotations(countryData, x(Number(countryData.gdp_per_capita)), y(Number(countryData.period_life_expectancy)), margin);
                    }
                }
            });
        }
    }

    d3.select("#select-continent").on("change", function (d) {
        const selectedCountry = d3.select(this).property("value")
        update(selectedCountry)

    })

    let svg = d3.select("#scene1_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis
    const x = d3.scaleLog()
        //.base(10)
        .domain([550, 160000])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([1000, 2000, 5000, 10000, 20000, 50000, 100000, 160000])
            .tickFormat(d => "$" + d));
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 5)
        .text("GDP Per Capita (dollars)");
    

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([40, 90])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d => d + " years"));

    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", 5)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Life Expectancy (years) at birth");

    
    const z = getBubbleSizeScale()

    const myColor = d3.scaleOrdinal()
        .domain(getContinent())
        .range(d3.schemeCategory10);

    const tooltip = d3.select("#scene1_chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "60px")


    svg.append('g')
        .selectAll("scatterplot-dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("cx", function (d) {return x(Number(d.gdp_per_capita));})
        .attr("cy", function (d) {return y(Number(d.period_life_expectancy));})
        .attr("id", function (d) {return "bubble-" + d.code;})
        .attr("r", function (d) { return z(Number(d.population));})
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .8);
            tooltip.html(firstTooltip(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        .style("opacity", "0.85")
        .style("stroke-width", "1px");
    setLegend(svg, getContinent(), width, myColor);
    countryCodesAnnotations1().forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                firstChartAnnotations(countryData, x(Number(countryData.gdp_per_capita)), y(Number(countryData.period_life_expectancy)), margin);
            }
        }
    })
}

function firstChartAnnotations(d, x, y, margin) {
    const computedDX = d.entity == "Japan" ? -50 : 20;
    const computedDY = d.entity == "Japan" ? -10 : 60;
    const annotations = [
        {
            note: {
                label: Math.round(d.period_life_expectancy) + " years",
                lineType: "none",
                title: d.entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCalloutElbow,
            connector: { end: "arrow" },
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}




function firstTooltip(object) {
    return "<div>" + object.entity + "</div><div>GDP $" + Math.round(object.gdp_per_capita) + " per capita</div><div>Life expectancy " + Math.round(object.period_life_expectancy) + " years</div>"
    + "</div><div>Population " + Math.round(object.population);
}

function countryCodesAnnotations1() {
    return ["LSO", "JPN", "USA"]
}

function countryCodesAnnotations2() {
    return ["TCD", "JPN", "USA"]
}




// scene 2
async function secondChart() {
    const margin = {top: 10, right: 20, bottom: 30, left: 50},
        width = 1100 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    const data = await d3.csv("data/life-expectancy-vs-healthcare-expenditure.csv");
    const year = 2015
    const filteredData = data.filter(function (d) {
        return d.year == year && d.population != "" && d.period_life_expectancy != "" && d.health_expenditure_per_capita != "";
    });


    const continents = getContinent(); 
    continents.unshift("All");

    d3.select("#select-continent")
    .selectAll('continent-options')
    .data(continents)
    .enter()
    .append('option')
    .text(function (d) {
        return d;
    })
    .attr("value", function (d) {
        return d;
    }) 

    function update(selectedGroup) {
        svg.selectAll(".bubbles")
            .style("opacity", function (d) {
                return selectedGroup === "All" || d.continent === selectedGroup ? 1 : 0;
            });
        
        d3.selectAll(".annotation-group").remove();

        if (selectedGroup === "All") {
            countryCodesAnnotations2().forEach(function (countryCode) {
                for (let i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].code === countryCode) {
                        const countryData = filteredData[i];
                        secondChartAnnotations(countryData, x(Number(countryData.health_expenditure_per_capita)), y(Number(countryData.period_life_expectancy)), margin);
                    }
                }
            });
        }
    }

    d3.select("#select-continent").on("change", function (d) {
        const selectedCountry = d3.select(this).property("value")
        update(selectedCountry)

    })


    let svg = d3.select("#scene2_chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    
    // Add X axis
    const x = d3.scaleLog()
        .domain([30, 15000])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickValues([50, 100, 200, 500, 1000, 2000, 5000, 10000])
            .tickFormat(d => "$" + d));
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 5)
        .text("Health Expenditure Per Capita (dollars)");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([40, 90])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y)
        .tickFormat(d => d + " years"));
    const z = getBubbleSizeScale();
    svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", 5)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Life Expectancy (years) at birth");

    const myColor = d3.scaleOrdinal()
        .domain(getContinent())
        .range(d3.schemeCategory10);

    const tooltip = d3.select("#scene2_chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "60px")

    svg.append('g')
        .selectAll("dot")
        .data(filteredData)
        .enter()
        .append("circle")
        .attr("class", "bubbles")
        .attr("id", function (d) {
            return "bubble-" + d.code;
        })
        .attr("cx", function (d) {
            return x(Number(d.health_expenditure_per_capita));
        })
        .attr("cy", function (d) {
            return y(Number(d.period_life_expectancy));
        })
        .attr("r", function (d) {
            return z(Number(d.population));
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .8);
            tooltip.html(secondTooltip(d));
            tooltip.style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .style("fill", function (d) {
            return myColor(d.continent);
        })
        .style("opacity", "0.85")
        .style("stroke-width", "1px");
    setLegend(svg, getContinent(), width-26, myColor);
    countryCodesAnnotations2().forEach(function (countryCode) {
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i].code === countryCode) {
                const countryData = filteredData[i];
                secondChartAnnotations(countryData, x(Number(countryData.health_expenditure_per_capita)), y(Number(countryData.period_life_expectancy)), margin);
            }
        }
    })
}


function secondTooltip(object) {
    return "<div>" + object.entity + "</div><div>Health expenditure $" + Math.round(object.health_expenditure_per_capita) + "</div><div>Life expectancy " + Math.round(object.period_life_expectancy) + " years</div>"
    + "</div><div>Population " + Math.round(object.population);
}

function secondChartAnnotations(d, x, y, margin) {
    const computedDX = d.entity == "Japan" ? -50 : 20;
    const computedDY = d.entity == "Japan" ? -30 : 50;
    const annotations = [
        {
            note: {
                label: Math.round(d.period_life_expectancy) + " years",
                lineType: "none",
                title: d.entity,
                orientation: "leftRight",
                "align": "middle"
            },
            type: d3.annotationCalloutElbow,           
            connector: { end: "arrow" },
            x: x,
            y: y,
            dx: computedDX,
            dy: computedDY
        },
    ];
    const makeAnnotations = d3.annotation().annotations(annotations);

    d3.select("svg")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "annotation-group")
        .call(makeAnnotations)
}

    

// scene 3
function thirdChart() {
    const svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");
    
    const projection = d3.geoMercator()
        .scale(100)
        .center([0, -10])
        .translate([width / 2, height / 2]);

    const tooltip = d3.select("#scene3_chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "black")
        .style("border-radius", "5px")
        .style("padding", "10")
        .style("color", "white")
        .style("width", "150px")
        .style("height", "50px")

    let data = new Map()
    const colorScale = d3.scaleOrdinal()
        .domain(getContinent())
        .range(d3.schemeCategory10);

    Promise.all([
        d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.csv("data/life-expectancy-vs-healthcare-expenditure.csv", function (d) {
            if (d.year == 2015) {
                data.set(d.code,
                    {
                        year: d.year,
                        period_life_expectancy: Number(d.period_life_expectancy),
                        name: d.entity,
                        population: d.population,
                        continent: d.continent
                    });
            }
        })
    ]).then(function (loadData) {
        let map = loadData[0]

        svg.append("g")
            .selectAll("path")
            .data(map.features)
            .join("path")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .attr("fill", function (d) {
                if (!data.has(d.id)) {
                    return 0;
                } else {
                    return colorScale(data.get(d.id).continent);
                }
            })
            .on("mouseover", function (event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(thirdTooltip(data.get(d.id)));
                tooltip.style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px")
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);               
            })
    })  
    renderLegend(d3.select("#scene3_chart"), getContinent(), width, colorScale);
}


function thirdTooltip(object) {
    return object.name + "<br>" + object.population + " people<br>" + Math.round(object.period_life_expectancy) + " years";
}


// Other functions
function getBubbleSizeScale() {
    const z = d3.scaleLog()
        .domain([200000, 1310000000])
        .range([1, 30]);
    return z;
}

function setLegend(svg, continentKeys, width, myColor) {
    svg.selectAll("legend-labels")
        .data(continentKeys)
        .enter()
        .append("text")
        .attr("x", width-85)
        .attr("y", function (d, i) {
            return i * 25+5
        }) 
        .style("fill", function (d) {
            return myColor(d)
        })
        .text(function (d) {
            return d
        })
        .attr("text-anchor", "left")
        .style("alignment-baseline", "bottom")
}

function getContinent() {
    return ["Asia", "Europe", "North America", "South America", "Africa", "Oceania"];
}
