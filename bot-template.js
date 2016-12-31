function post(x, id) {
    document.getElementById('input').value = (id ? ":" + id + " ": "") + x;
    document.getElementById("sayit-button").click()
}
var last_message = "";

function f() {
    for (var i of document.getElementsByClassName("pending"))
        for (var j of i.children)
            for (var k of j.children)
                if (k.innerHTML == "retry") k.click();

    var e = [].slice.call(document.getElementsByClassName("message")).slice(-1)[0];
    console.log(e.children);
    var a = [].slice.call(document.getElementsByClassName("content")).slice(-1)[0].textContent;
    if (a == last_message) return;
    last_message = a;

    var username = "Feeds";
    for (var i of document.getElementsByClassName("username")) username = i.innerHTML;
    var message_id = e.id.match(/\d+/).slice(-1)[0];

    console.log(a);
    if (/@/.test(a) && !/@ETHbot/i.test(a)) return; // Avoid messages that ping other users
    if (username == "ETHbot") return; // Avoid your own messages
 
    var y = "Your message here";
 
    // reply after 3 seconds to avoid rate-limiting
    setTimeout(function(x, id) {
        post(x, id);
    }, 3000, y, message_id);
}

var interval;

function start() {
    post("ETHbot started.");
    interval = setInterval(f, 500);
}

function stop() {
    post("Shutting down temporarily...");
    clearInterval(interval);
}

start();
