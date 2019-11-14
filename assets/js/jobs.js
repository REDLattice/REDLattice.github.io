/* jshint es3: false */
/* jshint esversion: 6 */
let default_location = "Virginia";
let locations = new Set([default_location]);
let jobs = [];
let job_tab_template = "";
let job_tab_div_template = "";
let job_list_template = "";

function iconForTitle(title) {
    title = title.toLowerCase();

    if (title.includes('android'))
        return 'fab fa-android';
    else if (title.includes('windows'))
        return 'fab fa-windows';
    else if (title.includes('engineer') || title.includes('developer'))
        return 'fas fa-code-branch';
    else
        return 'fas fa-user';
}

function abbrState(state) {
    var states = [
        ["Alabama", "AL"], ["Alaska", "AK"], ["American Samoa", "AS"], ["Arizona", "AZ"], ["Arkansas", "AR"],
        ["Armed Forces Americas", "AA"], ["Armed Forces Europe", "AE"], ["Armed Forces Pacific", "AP"],
        ["California", "CA"], ["Colorado", "CO"], ["Connecticut", "CT"], ["Delaware", "DE"],
        ["District Of Columbia", "DC"], ["Florida", "FL"], ["Georgia", "GA"], ["Guam", "GU"], ["Hawaii", "HI"],
        ["Idaho", "ID"], ["Illinois", "IL"], ["Indiana", "IN"], ["Iowa", "IA"], ["Kansas", "KS"], ["Kentucky", "KY"],
        ["Louisiana", "LA"], ["Maine", "ME"], ["Marshall Islands", "MH"], ["Maryland", "MD"], ["Massachusetts", "MA"],
        ["Michigan", "MI"], ["Minnesota", "MN"], ["Mississippi", "MS"], ["Missouri", "MO"], ["Montana", "MT"],
        ["Nebraska", "NE"], ["Nevada", "NV"], ["New Hampshire", "NH"], ["New Jersey", "NJ"], ["New Mexico", "NM"],
        ["New York", "NY"], ["North Carolina", "NC"], ["North Dakota", "ND"], ["Northern Mariana Islands", "NP"],
        ["Ohio", "OH"], ["Oklahoma", "OK"], ["Oregon", "OR"], ["Pennsylvania", "PA"], ["Puerto Rico", "PR"],
        ["Rhode Island", "RI"], ["South Carolina", "SC"], ["South Dakota", "SD"], ["Tennessee", "TN"],
        ["Texas", "TX"], ["US Virgin Islands", "VI"], ["Utah", "UT"], ["Vermont", "VT"], ["Virginia", "VA"],
        ["Washington", "WA"], ["West Virginia", "WV"], ["Wisconsin", "WI"], ["Wyoming", "WY"],
    ];
    const selectedState = states.find(s => s.find(x => x.toLowerCase() === state.toLowerCase()));
    if (!selectedState) { return null; }
    return selectedState
        .filter(s => s.toLowerCase() !== state.toLowerCase())
        .join("");
}

function renderJobs() {
    locations.forEach(function (location) {
        $("#jobs > .nav").append(Mustache.render(job_tab_template, {location: location}));
        $("#job-tabs").append(Mustache.render(job_tab_div_template, {location: location}));
    });
    $("#jobs > .nav > .nav-item > .nav-link").first().addClass('show active');
    $("#job-tabs > .tab-pane").first().addClass('show active');

    jobs.forEach(function(job){
        let loc = abbrState(job.state);
        $("#jobs-" + loc).append(Mustache.render(job_list_template, job));
    });

    // initialization of tabs
    $.HSCore.components.HSTabs.init('[role="tablist"]');
}

let job_params = [
    "id", "title", "status", "department", "url", "city", "state", "country",
    "postalcode", "description", "type", "experience", "buttons"
];

function refreshJobs(url) {
    $.ajax({
        type: "GET",
        url: url,
        dataType: "xml",
        success: function(response) {
            $(response).find("job").each(function() {
                let obj = this;
                let job = {};
                job_params.forEach(function(param) {
                    job[param] = $(obj).find(param).text();
                });
                job.icon = iconForTitle(job.title);
                jobs.push(job);

                locations.add(abbrState(job.state));
            });

            // make sure the default location is the first tab
            locations.delete(default_location);
            locations = Array.from(locations).sort();
            locations.unshift(default_location);

            renderJobs();
        }
    });
}

$(document).on('ready', function () {
    let obj = $("#jobs > .nav > .nav-item").first();
    job_tab_template = obj.prop("outerHTML");
    obj.remove();

    obj = $("#job-tabs > .tab-pane").first();
    let list = $(obj).find("a").first();
    job_list_template = list.prop("outerHTML");
    list.remove();
    job_tab_div_template = obj.prop("outerHTML");
    obj.remove();

    Mustache.parse(job_tab_template);
    Mustache.parse(job_list_template);
    Mustache.parse(job_tab_template);

    refreshJobs("./jobs.xml");
});