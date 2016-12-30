function post(x, id) {
    if (!x) x = "ERROR";
    document.getElementById('input').value = (id ? ":" + id + " ": "") + x;
    document.getElementById("sayit-button").click()
}

var firsts, nexts;

var last_message = "";
var commands = {};
var math = Math,
    infinity = Infinity;
var knowledge;

function stringify(x) {
    return x && x.slice && x.slice(0, 8) == "DEFINED-" ? x.slice(8) : (typeof(x) == "string" ? "'" : typeof(x) == "object" ? "[" : "") + x + (typeof(x) == "string" ? "'" : typeof(x) == "object" ? "]" : "")
}

function denumber(x) {
    var strings = [],
        i = 0;
    x = x.replace(/"(\\.|[^"\\])+"/g, function(x) {
        strings[i] = x;
        return '"' + i++ + '"'
    });

    function simplify() {
        x = x.replace(/([\d.]+)[- ]([\d.]+)/g, function(_, x, y) {
            return /\./.test(x) ? x + y : +x + +y
        });
    }

    var signs = {
        "plus": "+",
        "minus": "-",
        "negative": "-",
        "times": "*",
        "divided by": "/",
        "mod": "%",
        " point ": ".",
        "to the power of": "**"
    };
    for (i of Object.keys(signs)) x = x.replace(RegExp(i + "\\b", "gi"), signs[i]);

    var tens = ["zero", "ten", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
    for (i in tens) x = x.replace(RegExp(tens[i] + "\\b", "gi"), +i * 10);

    var teens = ["ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    for (i in teens) x = x.replace(RegExp(teens[i] + "\\b", "gi"), +i + 10);

    var digits = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
    for (i in digits) x = x.replace(RegExp(digits[i] + "\\b", "gi"), +i);
    simplify();

    x = x.replace(/([\de+.-]+) ?hundred\b/gi, function(_, i) {
        return i * 1e2
    });
    simplify();

    x = x.replace(/([\de+.-]+) ?thousand\b/gi, function(_, i) {
        return i * 1e3
    });
    simplify();

    var illions = ["m", "b", "tr", "quadr", "quint", "sext", "sept", "oct", "non", "dec"];
    for (i in illions) x = x.replace(RegExp("([\\de+.-]+) ?" + illions[i] + "illio(n\\b|n$)", "gi"), function(_, j) {
        return +j * Math.pow(10, i * 3 + 6)
    });
    simplify();

    var funcs = {
        
    };
    for (i of Object.keys(funcs)) x = x.replace(RegExp(i + "\\b", "gi"), funcs[i]);

    x = x.replace(/"(\d+)"/g, function(x, y) {
        return strings[+y]
    });
    return x;
}

function safeeval(code) {
    if (/[A-Za-z$_]/.test(code.replace(/infinity|(['"`])(\\.|(?!\1).)+\1/gi, "")))
        throw "I don't know what " + code + " means";
    return eval(code);
}

function saferegex(str) {
    return str.replace(/[\[\](){}\\.?*+\-^$|]/g, "\\$&");
}

function f() {
    for (var i of document.getElementsByClassName("pending"))
        for (var j of i.children)
            for (var k of j.children)
                if (k.innerHTML == "retry") k.click();

    var e = [].slice.call(document.getElementsByClassName("message")).slice(-1)[0];
    var a = [].slice.call(document.getElementsByClassName("content")).slice(-1)[0].textContent;
    if (a == last_message) return;
    last_message = a;

    var username = "Feeds";
    for (var i of document.getElementsByClassName("username")) username = i.innerHTML;
    var message_id = e.id.match(/\d+/).slice(-1)[0];

    console.log(a);
    if (/@/i.test(a) && !/@ETH(b(ot?)?)?\b/.test(a)) return;
    if (username == "ETHbot") return;
    if (a.match(/http/) && !a.match(/ETH/i)) return;
    
    var isbot = /zalgo|sock|sanbot/i.test(username);

    // Handle questions such as "What is your name?" "What is five times seven?" "Who is George Washington?"
    if (a.match(/ (i|come)s[ ?]/i) && !isbot) {
        var text = "",
            result = 0;
        a = denumber(a);
        a = a.replace(/@\S+/g, "");
        if (a.match(/what|who|how much/i)) {
            a.replace(/(?:what|who|how much) is ([^?]+)/i, function(_, x) {
                result = x
            });
            a.replace(/(?:what|who|how much) ((?:[^?](?!\Wis\W))+.) is/i, function(_, x) {
                result = x
            });
            a.replace(/(.+) is (?:what|who|how much)/i, function(_, x) {
                result = x
            });
            a.replace(/what comes (?:next in|after) ([^?]+)/i, function(_, x) {
                result = x
            });
            if (!result) {
                post("Error processing question.", message_id);
                return;
            }
            result = result.toLowerCase().replace(/your/g, "my");
            text = "I've never heard of " + result;
            if (/the next term (?:in|of)/i.test(a) || /\d,?\.\.\./.test(a) || /comes (?:next in|after)/i.test(a)) {
                var seq = [];
                a.replace(/the next term (?:in|of) (?:the )?(?:sequence )?((?:[^?](?!\Wis\W))+[^?])/i, function(_, x) {
                    try {
                        seq = eval(x[0] == "[" ? x : "[" + x + "]")
                    } catch (e) {
                        seq = 0;
                        text = "Invalid sequence"
                    }
                });
                a.replace(/\[?((?:[\d.-]+,? ?)+)/i, function(_, x) {
                    try {
                        seq = eval(x[0] == "[" ? x : "[" + x + "]")
                    } catch (e) {
                        seq = 0;
                        text = "Invalid sequence"
                    }
                });
                a.replace(/is (\[?(?:[\d.-]+,? ?)+).\.\.\]?/i, function(_, x) {
                    x = x.replace(/,$/, "");
                    try {
                        seq = eval(x[0] == "[" ? x : "[" + x + "]")
                    } catch (e) {
                        seq = 0;
                        text = "Invalid sequence"
                    }
                });
                if (!seq) return;
                var all = [seq.slice(0)];
                var curr = [];
                for (var i = 10; i--; all.push(seq = curr.slice(0)), curr = []) {
                    for (var j = 1; j < seq.length; j++) curr.push(seq[j] - seq[j - 1]);
                    if (curr.length == 1) break;
                    if (curr.every(function(z) {
                            return z == curr[0]
                        })) break;
                }
                var total = curr[0];
                for (i = all.length; i--;) total += all[i][all[i].length - 1];
                text = (
                    curr.length == 1 ? "My calculations are inconclusive, but it may be " + total :
                    curr.length == 2 ? "It's a little hard to tell, but I believe it is " + total :
                    curr.length == 3 ? "The sequence is a little vague, but it's probably " + total :
                    "The next term is " + total);
            } else {
                var strings = [],
                    i = 0,
                    failed = "",
                    original = result,
                    remove = [];
                result = result.replace(/(["'`])(\\.|(?!\1)[^\\])+\1/g, function(x) {
                    strings[i] = x;
                    return '"' + i++ + '"'
                });
                for (var j of Object.keys(knowledge).sort(function(a, b) { return b.length - a.length; })) {
                    result = result.replace(RegExp("\\b" + saferegex(j) + "\\b", "gi"), stringify(knowledge[j]))
                    result = result.replace(/(['`])(\\.|(?!\1)[^\\])+\1/g, function(x) {
                        strings[i] = x;
                        return '"' + i++ + '"';
                    });
                    result = denumber(result);
                }
                for (var j of remove) result = result.replace(j, "");
                result = result.replace(/"(\d+)"/g, function(x, y) {
                    return strings[+y]
                });
                var evaled = 0;
                try {
                    evaled = safeeval(result);
                } catch (e) {
                    if (/^I don't know/.test(e)) 
                        failed = e;
                    else
                        failed = "I got this error while evaluating " + result + ": '" + e + "'";
                }
                if (failed) text = failed;
                else text = original[0].toUpperCase() + original.slice(1) + " is " + stringify(evaled);
            }
            text += ".";
        } else {
            var learned = [];
            var missed = [];
            a.replace(/((?:[^?](?! is ))*.) is (.+?)(?:\.|$)(?!\w)\s*/gi, function(_, x, y) {
                if (/[<>:,()[\]?!;]/.test(x)) return;
                result = x.toLowerCase().replace(/your/g, "my");
                var strings = [],
                    i = 0,
                    failed = "";
                y = y.toLowerCase().replace(/your/g, "my");
                y = y.replace(/"(\\.|[^"\\])+"/g, function(z) {
                    strings[i] = z;
                    return '"' + i++ + '"'
                });
                y = y.replace(/(\w+[ -])*\w+/gi, function(z) {
                    if (knowledge.hasOwnProperty(z)) return "knowledge['" + z + "']";
                    failed = x;
                    return z
                });
                y = y.replace(/"(\d+)"/g, function(_, z) {
                    return strings[+z]
                });
                if (failed) {
					knowledge[result] = y;
                    learned.push([x, knowledge[result]]);
				}
                else try {
                    knowledge[result] = eval(y);
                    learned.push([x, knowledge[result]]);
                } catch (e) {
                    knowledge[result] = y;
                    learned.push([x, knowledge[result]]);
                }
            });

            function mappy(x) {
                return x[0] + " (" + stringify(x[1]) + ")"
            }
            if (learned.length > 0) {
                text = "Learned these words: " + learned.map(mappy).join(", ");
                if (missed.length > 0) {
                    text += "\nBut I didn't understand these: " + missed.map(mappy).join(", ");
                }
            } else if (missed.length > 0) {
                text += "I didn't understand these words: " + missed.map(mappy).join(", ");
            }
        }
        post(text, message_id);
    }
    
    // List everything you know
    else if (/what do you know/i.test(a)) {
        post("I know " + Object.keys(knowledge).join(", ") + ", plus basic math and arithmetic sequences.", message_id);
    }
    
    // Handle forgetting things
    else if (/forget ([^?]+?)(\.(?!\w)|$)/gi.test(a) && !isbot) {
        var items = [];
        a.replace(/forget ([^?]+?)(?:\.(?!\w)|$)/gi, function(_, x) {
            for (var y of x.split(/,\s?(?:and)?\s?|\s+and\s+/)) if (knowledge.hasOwnProperty(y)) {
                items.push(y);
                delete knowledge[y];
            }
        });
        post("Forgot these things: " + items.join(", "), message_id);
    }

    // Handle definitions, such as "Pi is 3.14159265."
    else if (a.match(/ means[ ?]/i) && !isbot) {
        var text = "",
            result = 0,
            words = [];
        a.replace(/((?:(?! means )[^.?])+) means (.+?)(?:\.|$)/i, function(_, x, y) {
            result = x.toLowerCase();
            var strings = [],
                i = 0,
                failed = "";
            y = y.toLowerCase();
            knowledge[result] = "DEFINED-" + y;
            words.push([result, y])
        });
        post("Learned these words: " + words.map(function(x) {
            return x[0] + " (" + x[1] + ")"
        }).join(", "), message_id);
    }
    
    // Post directions for defining an operator
    else if (/operator/i.test(a) && !isbot) {
        post("To define an operator, use 'means': 'concat means +.'", message_id);
    }
    
    else if (/Save\.|Load\./.test(a) && !isbot) {
        if (/^ETHp/.test(username)) {
            if (/Save\./.test(a)) save();
            if (/Load\./.test(a)) load();
            post("Sure thing, master!", message_id);
        } else {
            post("You're not my master...", message_id);
        }
    }

    // Generate a random sentence
    else {
        firsts = [];
        nexts = {"because":["the","I"]};
        [].forEach.call(document.getElementsByClassName("message"), function(x) {
            var username = x.parentElement.parentElement.querySelector(".signature .username").textContent;
            if (username === "ETHbot") return;
            var text = x.querySelector(".content");
            if (!text) return;
            text = text.textContent;
            var y = text;
            y = y.replace(/https?\:\S+/g, "")
                .replace(/\,/g, " punc-comma")
                .replace(/\?/g, " punc-question")
                .replace(/\!/g, " punc-exclamation")
                .replace(/\:/g, " punc-colon")
                .replace(/\;/g, " punc-semicolon")
                .replace(/\./g, " punc-period")
                .replace(/<\S+?>\s+/gi, "")
                .replace(/^[@/<]\S+/g, "")
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
}


var interval;

function start() {
    load();
    post("ETHbot started.");
    interval = setInterval(f, 500);
}

function stop() {
    post("Shutting down temporarily...");
    clearInterval(interval);
    save();
}

function save() {
    localStorage.setItem("knowledge", JSON.stringify(knowledge));
}

function load() {
    knowledge = localStorage.hasOwnProperty("knowledge") ? JSON.parse(localStorage.getItem("knowledge")) : {
        "my name": "ETHbot",
        "the meaning of life": 42,
        "george washington": "the first president of the United States",
        "pi": Math.PI,
        "e": Math.E,
        "my browser": "Chrome 55",
        "ethbot": "the best bot ever",
        "infinity": 1/0
    };
}

start();
