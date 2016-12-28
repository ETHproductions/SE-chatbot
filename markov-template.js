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
    if (/@(?!ETH)/i.test(a)) return;
    if (username == "ETHbot") return;

    var firsts = [],
        nexts = {};
    [].forEach.call(document.getElementsByClassName("message"), function(x) {
        var text = x.querySelector(".content");
        if (!text) return;
        text = text.textContent;
        var y = text;
        y = y.replace(/https?:S+/g, "")
            .replace(/,/g, " punc-comma")
            .replace(/\?/g, " punc-question")
            .replace(/!/g, " punc-exclamation")
            .replace(/:/g, " punc-colon")
            .replace(/;/g, " punc-semicolon")
            .replace(/\./g, " punc-period")
            .replace(/<ETHbot>/gi, "")
            .replace(/^[@/<]S+/g, "")
            .replace(/@/g, "");
        y = y.split(" ")
            .map(function(w, i) {
                if (i === 0 && w.length > 0 && w.slice(1) === w.slice(1).toLowerCase()) {
                    return w.toLowerCase();
                } else {
                    return w;
                }
            }).join(" ");
        var words = y.split(" ").filter(function(x) {
            return x.length > 0;
        });
        if (words.length < 2) return;
        firsts.push(words[0]);
        for (var i in words) {
            if (!nexts[words[i]]) nexts[words[i]] = [];
            try {
                nexts[words[i]].push(words[+i + 1] || "end-sentence");
            } catch (e) {}
        }
    });
    var prevword = "";
    if (/why/i.test(a)) prevword = "because";
    else if (/^(are(n't| )|is(n't| )|do )/i.test(a)) prevword = ["yes", "no", "maybe", "i"][Math.random() * 4 | 0]
    else prevword = firsts[Math.random() * firsts.length | 0];
    var nextword = "ERROR";
    var sentence = [prevword];
    for (var i = 100; i-- && prevword != "end-sentence";) {
        nextword = nexts[prevword];
        if (nextword) {
            nextword = nextword[nextword.length * Math.random() | 0];
            sentence.push(nextword);
            prevword = nextword;
        } else break;
    };
    var y = sentence.slice(0, -1).join(" ");
    y = y.replace(/(^| )punc-period/gi, ".")
        .replace(/(^| )punc-comma/gi, ",")
        .replace(/(^| )punc-question/gi, "?")
        .replace(/(^| )punc-exclamation/gi, "!")
        .replace(/(^| )punc-colon/gi, ":")
        .replace(/(^| )punc-semicolon/gi, ";");
    if (!y[0]) y = "sentence generation failed."
    y = y[0].toUpperCase() + y.slice(1);
    y = y.replace(/ i /g, " I ")
         .replace(/ i'/g, " I'");
    setTimeout(function(x) {
        post(x, message_id)
    }, 3000, y);
}

post("ETHbot started.");

setInterval(f, 500);
