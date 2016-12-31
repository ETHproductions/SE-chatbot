function post(x, id) {
    document.getElementById('input').value = (id ? ":" + id + " ": "") + x;
    document.getElementById("sayit-button").click()
}
var last_message = NaN;

function f() {
    // If any messages failed to send, resend them
    for (var i of document.getElementsByClassName("pending"))
        for (var j of i.children)
            for (var k of j.children)
                if (k.innerHTML == "retry") k.click();
    
    var e = [].slice.call(document.getElementsByClassName("content"), -1)[0]; // message element
    var a = e.textContent; // text of the message
    var message_id = e.parentElement.id.slice(8); // id of the message
    var username = e.parentElement.parentElement.parentElement.querySelector(".signature .username").textContent; // user who posted
    
    // We don't want to do anything if no new messages have been posted
    if (e === last_message) return;
    last_message = e;

    if (/@/.test(a) && !/@ETHbot/i.test(a)) return; // Avoid messages directed at other users
    if (username === "ETHbot") return; // Avoid your own messages
 
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
