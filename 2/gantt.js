var Gantt = (function () {

    var canvas;
    var tasks = [];
    var name_group, date_group, arrow_group;
    var gantt = {};
    var view_mode = 'month'; // day, week, month


    function init() {
        canvas = Snap("#gantt");
        name_group = canvas.group();
        date_group = canvas.group();
        arrow_group = canvas.group();
    }

    function render() {

        var tasks_length = tasks.length;
        var x = 40,
            y = 40,
            unit = 40;

        if (view_mode === 'week') {
            unit = 25;
        }
        else if (view_mode === 'month') {
            unit = 5;
        }

        gantt = get_date_extremes();
        var date_array = get_date_array(gantt.from_date, gantt.to_date);


        //arrow dependencies
        for (var i = 0; i < tasks_length; i++) {

            var task = tasks[i];

            // if (task.dependent) {


            //     var dependent = get_task(task.dependent);
            //     var starting_pt = days_diff(gantt.from_date, dependent.start) * unit + 200;
            //     var end_pt = days_diff(dependent.start, dependent.end) * unit;
            //     var mid_pt = starting_pt + end_pt / 2;

            //     var arrow_start_x = mid_pt;

            //     var index = get_index(task.dependent);
            //     var arrow_start_y = 40 + 26 + (24 + 26) * index;

            //     var arrow_end_x = days_diff(gantt.from_date, task.start) * unit + 200;

            //     index = get_index(task.name);
            //     var arrow_end_y = (40 + 13) + (24 + 26) * index;

            //     var t = 5;

            //     var dep_arrow = canvas.path(
            //         Snap.format("M {start_x} {start_y} V {offset} a {t} {t} 0 0 0 {t} {t} L {end_x} {end_y} m -7 -7 l 7 7 l -7 7", {
            //             start_x: arrow_start_x,
            //             start_y: arrow_start_y,
            //             end_x: arrow_end_x,
            //             end_y: arrow_end_y,
            //             offset: arrow_end_y - t,
            //             t: t
            //         })
            //     );



            //     arrow_group.add(dep_arrow);

            // }
        }
        arrow_group.attr({
            "stroke-width": "2",
            "fill": "none",
            "stroke": "black"
        });

        //bar
        for (var i = 0; i < tasks_length; i++) {

            var task = tasks[i];
            var days = days_diff(task.start, task.end);

            var starting_pt = days_diff(gantt.from_date, task.start);

            task_name = canvas.text(x + 150, y + 20, task.name);
            name_group.add(task_name);

            task_bar = canvas.rect(200 + starting_pt * unit, y, 0, 26, 5, 5);
            task_bar.attr({ fill: "rgb(94, 151, 246)" });
            // task_bar.mouseover(show_task_details(task.name));
            task_bar.animate({
                width: unit * days
            }, 1000);

            task_bar_progress = canvas.rect(200 + starting_pt * unit, y, 0, 26, 5, 5);
            task_bar_progress.attr({ fill: "rgb(42, 86, 198)" });
            task_bar_progress.animate({
                width: unit * days * (task.progress / 100)
            }, 1000)
            y += 50;
        }
        name_group.attr({
            "text-anchor": "end"
        });


        x = 200;
        y += 20;

        var isSeen = {};

        //date row
        for (var i = 0; i < date_array.length; i++) {
            var date = date_array[i];

            if (view_mode === 'week') {
                var week_bar = canvas.rect(x, y, unit, 30);
                var color = 30 * date.format("w");
                week_bar.attr({
                    fill: "rgba(" + (color + 20) + ", " + (color - 40) + ", " + color + ", 0.8)"
                })
            }


            switch (view_mode) {
                case 'day':
                    day_text = canvas.text(x, y, date.format("DD"));
                    y += 20;
                    month_text = canvas.text(x, y, date.format("MMM"));

                    break;
                case 'week':
                    var txt = "Week " + date.format("w");
                    if (isSeen[txt] === undefined) {
                        day_text = canvas.text(x + 3.5 * unit, y, txt);
                        isSeen[txt] = true;
                    }
                    else {
                        day_text = canvas.text(x, y, "");
                    }
                    y += 20;
                    month_text = canvas.text(x, y, date.format("dd"));


                    break;
                case 'month':
                    var txt = date.format("MMM");
                    var year = date.format("YYYY");
                    if (isSeen[txt] === undefined) {
                        day_text = canvas.text(x, y, year+' '+txt);
                        isSeen[txt] = true;
                    }
                    else {
                        day_text = canvas.text(x, y, "");
                    }
                    y += 20;
                    //month_text = canvas.text(x, y, date.format("M"));
                    // month_text.attr({
                    //     "font-size": '10'
                    // })


                    break;
                default:
                    day_text = canvas.text(x, y, date.format("DD"));
            }

            // y += 19;
            //month_text = canvas.text(x, y, date.format("MMM"));
            y -= 20;

            date_group.add(day_text);
            // date_group.add(month_text);

            x += unit;

        }

        date_group.attr({
            "text-anchor": "start"
        });


    }

    function days_diff(startDate, endDate) {
        startDate = moment(startDate);
        endDate = moment(endDate);
        return endDate.diff(startDate, 'days');
    }

    function get_date_extremes() {
        var from_date = moment(tasks[0].start);
        var to_date = moment(tasks[0].end);

        for (var i = 0; i < tasks.length; i++) {
            var start = moment(tasks[i].start);
            var end = moment(tasks[i].end);

            if (start.isSameOrBefore(from_date))
                from_date = start;

            if (end.isSameOrAfter(to_date))
                to_date = end;
        }

        return {
            from_date: from_date,
            to_date: to_date
        }
    }

    function show_task_details(task_name) {

        var task = get_task(task_name);
        // console.log(task)
        // var coords = get_coords(task);
    }

    function get_task(name) {

        for (var i = 0; i < tasks.length; i++) {
            if (name === tasks[i].name)
                return tasks[i];
        }
        return null;
    }

    function get_index(name) {
        for (var i = 0; i < tasks.length; i++) {
            if (name === tasks[i].name)
                return i;
        }
        return null;
    }

    function get_coords(task_name) {

        var task = get_task(task_name);

        var x = days_diff(gantt.from_date, task.start) * unit + 200;


    }

    function get_date_array(from_date, to_date) {

        var date_array = [];
        curr_date = from_date.clone();

        while (curr_date.isSameOrBefore(to_date)) {
            // console.log(curr_date.toDate());
            date_array.push(curr_date.clone());
            curr_date.add(1, 'days');
        }

        return date_array;
    }

    function addTask(task) {
        tasks.push(task);
    }

    function setViewMode(mode) {
        view_mode = mode || "day";
    }

    return {
        init: init,
        addTask: addTask,
        render: render,
        setViewMode: setViewMode
    }
})();

var g = Object.create(Gantt);

g.init();
g.addTask({
    name: "Structure",
    start: "Oct 2019",
    end: "March 2020",
    progress: 90,
    dependent: ""
});

g.addTask({
    name: "DSL Design",
    start: "Feb 2020",
    end: "April 2020",
    progress: 20,
    dependent: "Structure"
});

g.addTask({
    name: "Simulation",
    start: "Feb 2020",
    end: "April 2020",
    progress: 30,
    dependent: "Structure"
});

g.addTask({
    name: "Paper",
    start: "Nov 2019",
    end: "April 2020",
    progress: 80,
    dependent: "Structure"
});

g.addTask({
    name: "Research review",
    start: "Oct 2019",
    end: "April 2020",
    progress: 50,
    dependent: ""
});

g.setViewMode('month');

g.render();

