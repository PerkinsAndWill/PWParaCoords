function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

var parcoords = d3.parcoords()("#pwgraph")
  .alpha(0.4)
  .mode("queue") // progressive rendering
  //.height(d3.max([document.body.clientHeight-326, 220]))
  .margin({
    top: 36,
    left: 0,
    right: 0,
    bottom: 16
  });

// create chart from loaded data
function parallelCoordinates(data) {
  // slickgrid needs each data element to have an id
  data.forEach(function(d,i) { d.id = d.id || i; });

  parcoords
    .data(data)
	.color("#67d5fd")
    .render()
    .reorderable()
    .brushMode("1D-axes");

  // setting up grid
  var column_keys = [
	'Domestic Hot Water',
	'Lighting',
	'Glazing',
	'Wall',
	'Roof'
  ];
  // var column_keys = d3.keys(data[0]);
  var columns = column_keys.map(function(key,i) {
	return {
	  id: key,
	  name: key,
	  field: key,
	  sortable: true
	}
  });

  var options = {
    enableCellNavigation: true,
    enableColumnReorder: false,
    multiColumnSort: false
  };

  var dataView = new Slick.Data.DataView();
  var grid = new Slick.Grid("#grid", dataView, columns, options);
  grid.autosizeColumns();
  var pager = new Slick.Controls.Pager(dataView, grid, $("#pager"));

  // wire up model events to drive the grid
  dataView.onRowCountChanged.subscribe(function (e, args) {
    grid.updateRowCount();
    grid.render();
  });

  dataView.onRowsChanged.subscribe(function (e, args) {
    grid.invalidateRows(args.rows);
    grid.render();
  });

  // column sorting
  var sortcol = column_keys[0];
  var sortdir = 1;

  function comparer(a, b) {
    var x = a[sortcol], y = b[sortcol];
    return (x == y ? 0 : (x > y ? 1 : -1));
  }
  
  // click header to sort grid column
  grid.onSort.subscribe(function (e, args) {
    sortdir = args.sortAsc ? 1 : -1;
    sortcol = args.sortCol.field;

    if ($.browser.msie && $.browser.version <= 8) {
      dataView.fastSort(sortcol, args.sortAsc);
    } else {
      dataView.sort(comparer, args.sortAsc);
    }
  });

  // highlight row in chart
  grid.onMouseEnter.subscribe(function(e,args) {
    var i = grid.getCellFromEvent(e).row;
	// console.log(i);
    var d = parcoords.brushed() || data;
	// console.log(d);
	var payback = Math.round(d[i]['Payback years'])+' years';
	var saving = Math.round(d[i]['Additional saving %']) + '%';
	var premium = '$'+numberWithCommas(Math.round(d[i]['Premium Cost']));
	// console.log(saving);
	// console.log(payback);
	$("#saving").html(saving);
	$("#payback").html(payback);
	$("#premium").html(premium);
	// console.log(data[i]);
    parcoords.highlight([d[i]]);
  });
  grid.onMouseLeave.subscribe(function(e,args) {
    parcoords.unhighlight();
  });

  // fill grid with data
  gridUpdate(data);

  // update grid on brush
  parcoords.on("brush", function(d) {
    gridUpdate(d);
  });

  function gridUpdate(data) {
    dataView.beginUpdate();
    dataView.setItems(data);
    dataView.endUpdate();
  };
  d3.select("svg").selectAll("text")
	.attr("font-family","arial")
	.attr("fill","#DDD");

};

var file = './data/Results_40percentsS.csv';

$.ajax({
	url:file,
	success:function(message){
		var data = d3.csv.parse(message);
		parallelCoordinates(data);
	}
});
