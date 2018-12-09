import { ExtensionModule } from "./ExtensionModule";
import { ConfigOptions } from "../Configuration/ConfigOptions";
import { SettingType } from "../Configuration/SettingType";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";
import { PostInfo } from "../Utility/PostInfo";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { PageContext } from "../Context/PageContext";

/**
 * EM_UserFilter - Extension module for RBKweb.
 */

// FIXME: common preprocessing step with UsernameTracker, SignatureFilter (marking userid
// on username DOM objects)

export class UserFilter implements ExtensionModule {
    readonly name : string = "UserFilter";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTLIST // FIXME: only post views
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .EnabledByDefault()
            .WithExtensionModuleName("UserFilter")
            .WithDescription("Denne modulen filtrerer forumbrukere")
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("forumTrolls")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('[]')
            )
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("threadTrolls")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('{}')
            )
            .Build();

    posts: Array<PostInfo> = new Array<PostInfo>();
    trolls: Set<number> = new Set<number>();
    threadTrolls: Map<number, Set<number>> = new Map<number, Set<number>>();

    init = (config: ModuleConfiguration) => {
        try {
            this.cfg = config;
            this.trolls = this.getTrollConfig();
            //this.threadTrolls = this.getThreadTrollConfig();
            // BEGIN DEBUG
            //this.trolls.add(7212); // SHJINNJWÆST
            //this.trolls.add(1978); // Konesseur
            // END DEBUG
        } catch (e) {
            console.log("init exception: " + e.message);
        }
    }

    private getThreadTrollConfig(): Map<number, Set<number>> {
        var threadtrollstr = this.getConfigItem("threadTrolls");
        var threadtrolls = new Map<number, Set<number>>();
        //var config = JSON.parse(threadtrollstr);
        // for (var threadid in config) {
        // }
        return threadtrolls;
    }

    preprocess = () => {
        try {
            this.posts = PostInfo.GetPostsFromDocument(document);
        } catch (e) {
            console.error("UserFilter.preprocess: " + e.message);
        }
    }

    execute = (context: PageContext) => {
        // mark each username with red/orange/green
        this.posts.forEach(function(post, idx, posts) {
            try {
                var row = post.rowElement;
                var nameelt = row.querySelector("span.name") as Element;
                nameelt.insertAdjacentHTML('afterend',
                    ' ' +
                    '<a class="nav" id="' + post.posterid + 'green" title="Unblock">' +
                    '<img src="' + chrome.runtime.getURL('/img/green.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>' +
                    ' ' +
                    '<a class="nav" id="' + post.posterid + 'orange" title="Thread Block">' +
                    '<img src="' + chrome.runtime.getURL('/img/orange.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>' +
                    ' ' +
                    '<a class="nav" id="' + post.posterid + 'red" title="Block">' +
                    '<img src="' + chrome.runtime.getURL('/img/red.png') + '" valign="middle" width="12" height="12" border="0"/>' +
                    '</a>');
                var green = row.querySelector('a[id="'+post.posterid+'green"]') as HTMLAnchorElement;
                var orange = row.querySelector('a[id="'+post.posterid+'orange"]') as HTMLAnchorElement;
                var red = row.querySelector('a[id="'+post.posterid+'red"]') as HTMLAnchorElement;
                if (this.trolls.has(post.posterid)) {
                    orange.style.display = "none";
                    red.style.display = "none";
                    green.addEventListener("click", function() {
                        console.log("Unblocking " + post.posterNickname);
                        this.trolls.delete(post.posterid);
                        this.storeTrolls();
                    }.bind(this));
                }
                else {
                    green.style.display = "none";
                    orange.addEventListener("click", function() {
                        console.log("Thread-blocking " + post.posterNickname);
                    }.bind(this));
                    red.addEventListener("click", function() {
                        console.log("Blocking " + post.posterNickname);
                        this.trolls.add(post.posterid);
                        this.storeTrolls();
                    }.bind(this));
                }
            } catch (e) {
                console.error("exception: " + e.message);
            }
        }.bind(this));

        // hide all troll posts, and insert troll buttons
        this.posts.forEach(function(post, idx, posts) {
            try {
                //console.log("poster id: '" + post.posterid + "'");
                var posterid = post.posterid;
                if (this.trolls.has(posterid)) {
                    //console.log("hiding user " + post.posterNickname);
                    var row = post.rowElement;
                    var buttons = post.buttonRowElement as HTMLTableRowElement;
                    row.style.display = buttons.style.display = "none";
                    buttons.insertAdjacentHTML('afterend', '<tr>' +
                        '<td class="row2" colspan="2">' +
                        '<a class="nav trollbutton" name="showpost-'+post.postId+'">' + post.posterNickname + '</a>' +
                        '</td></tr>');
                    var addition = buttons.nextElementSibling as HTMLTableRowElement;
                    var button = addition.querySelector("a") as HTMLAnchorElement;
                    button.addEventListener("click", function(ev) {
                        row.style.display = "";
                        buttons.style.display = "";
                        addition.style.display = "none";
                    }.bind(this));
                }
                else {
                    var buttons = post.buttonRowElement as HTMLTableRowElement;
                    buttons.insertAdjacentHTML('afterend', '<tr class="trollbutton'+posterid+'">' +
                        '<td class="row2" colspan="2">' +
                        '<a class="nav trollbutton" name="showpost-'+post.postId+'">' + post.posterNickname + '</a>' +
                        '</td></tr>');
                    var addition = buttons.nextElementSibling as HTMLTableRowElement;
                    addition.style.display = "none";
                }
            } catch (e) {
                console.log("UserFilter: " + e.message);
            }

        }.bind(this));

    }

    private getConfigItem(setting: string): string {
        try {
            for (let i = 0; i < this.cfg.settings.length; i++) {
                if (this.cfg.settings[i].setting == setting) {
                    console.log("found setting '" + setting);
                    return this.cfg.settings[i].value as string;
                }
            }
            console.log("did not find setting '" + setting);
        } catch (e) {
            console.error("getConfigItem exception: " + e.message);
        }
    }

    private getTrollConfig(): Set<number> {
        var trolls = new Set<number>();
        try {
            var settings = this.getConfigItem("forumTrolls");
            console.log("loaded forumTrolls: " + settings);
            var trollids = JSON.parse(settings || "[]");
            trollids.forEach(function(troll, idx, trollids) {
                trolls.add(+troll);
            }.bind(this));
        } catch (e) {
            console.error("getTrollConfig exception: " + e.message);
        }
        console.log("returning forumTrolls = " + JSON.stringify(trolls));
        return trolls;
    }

    private storeTrolls(): void {
        var items = [];
        this.trolls.forEach(function(troll, idx, trolls) {
            console.log("troll: '" + troll + "'");
            items.push(+troll);
        }.bind(this));
        var settings = JSON.stringify(items);
        console.log("storing forumTrolls: '" + settings + "'");
        this.cfg.ChangeSetting("forumTrolls", settings);
    }

    private storeThreadTrolls(): void {
        var dictstr = JSON.stringify(this.threadTrolls);
        this.cfg.ChangeSetting("threadTrolls", dictstr);
    }
};

/*
var trolls = [];       // trolls we don't want to read
var threads = [];      // threads we dont want to see
var threadblocks = {}; // blocking specific users in specific threads for two days
var usernames = {};    // tracking changing usernames

// TODO/IDEAS:
// - colorize cool people's posts?
// - strip .signature from users
// - rewrite usernames
// - april fool's joke?

(function() {
    var node = document.createElement('style');
    document.body.appendChild(node);
    window.addStyleString = function(str) {
        node.innerHTML = str;
    }
}());

async function savetrolls() {
    console.log("saving trolls: " + JSON.stringify(trolls));
    await GM.setValue("blocked", JSON.stringify(trolls));
}

async function savethreads() {
    console.log("saving threads: " + JSON.stringify(threads));
    await GM.setValue("threads", JSON.stringify(threads));
}

async function savethreadblocks() {
    //console.log("saving threadblocks: " + JSON.stringify(threadblocks));
    await GM.setValue("threadblocks", JSON.stringify(threadblocks));
}

async function saveusernames() {
    //console.log("usernames: " + JSON.stringify(usernames));
    await GM.setValue("usernames", JSON.stringify(usernames));
}

async function loadsettings() {
    trolls = [];
    threads = [];
    usernames = {};
    var stored = await GM.getValue("blocked");
    if (stored) trolls = JSON.parse(stored);
    stored = await GM.getValue("threads");
    if (stored) threads = JSON.parse(stored);
    stored = await GM.getValue("threadblocks");
    if (stored) threadblocks = JSON.parse(stored);
    //console.log("loaded threadblocks: " + stored);
    stored = await GM.getValue("usernames");
    if (stored) usernames = JSON.parse(stored);
}

function fixname(name) {
    return ("x"+name).replace(/[ !i.]/g, "_");
}

function nametoid(name, $nameelt) {
    var $row = $nameelt.closest("tr");
    var $nextrow = $row.next("tr");
    var $links = $nextrow.find("td table tbody tr td a");
    var link = $links.attr('href');
    var userid = link.replace(/.*\bu=/g, "");
    if (istroll(name, -1) && !istroll(userid, -1)) {
        removetroll(name);
        addtroll(userid);
    }
    return userid;
}

function showpost(troll, index) {
    $("#"+troll+index+"button").css("display", "none");
    $('tr td span.name b').each(function(idx, elt) {
        var name = fixname($(this).text());
        var userid = nametoid(name, $(this));
        if (userid == troll && index === idx) {
            var $base = $(this).parent().parent().parent();
            $base.next().css("display", "");
            $base.css("display", "");
        }
    });
}

function addtroll(troll) {
    var newtrolls = [];
    $.each(trolls, function(i, t) {
        if (t != troll)
            newtrolls.push(""+t);
    });
    trolls = newtrolls;
    trolls.push(""+troll);
    savetrolls();
}

function removetroll(troll) {
    var newtrolls = [];
    var modified = false;
    $.each(trolls, function(i, t) {
        if (t != troll)
            newtrolls.push(""+t);
        else
            modified = true;
    });
    trolls = newtrolls;
    if (modified) savetrolls();
}

function addthreadblock(troll, threadid) {
    if (!threadblocks[threadid]) {
        threadblocks[threadid] = {};
    }
    threadblocks[threadid][troll] = (new Date()).getTime() / 1000;
    savethreadblocks();
}

function removethreadblock(troll, threadid) {
    if (threadblocks[threadid] && threadblocks[threadid][troll])
        delete threadblocks[threadid][troll];
    savethreadblocks();
}

function cleanthreadblocks() {
    var updated = false;
    var treshold = ((new Date()).getTime() / 1000) - (60*60*24*2);
    //console.log("threadblock treshold=" + treshold);
    for (var threadid in threadblocks) {
        for (var userid in threadblocks[threadid]) {
            var timediff = treshold - threadblocks[threadid][userid];
            if (timediff > 0.0) {
                //console.log("cleaning for thread=" + threadid + ", user=" + userid + ", timediff = " + timediff);
                delete threadblocks[threadid][userid];
                updated = true;
            } else {
                //console.log("keeping for thread=" + threadid + ", user=" + userid + ", timediff = " + timediff);
            }
        }
        if ($.isEmptyObject(threadblocks[threadid])) {
            delete threadblocks[threadid];
            updated = true;
        }
    }
    if (updated)
        savethreadblocks();
}

function istroll(troll, threadid) {
    var result = false;
    $.each(trolls, function(i, t) {
        if (t == troll) result = true;
    });
    if (!result && threadblocks[threadid] && threadblocks[threadid][troll])
        result = true;
    return result;
}

function hidetroll(troll) {
    var threadid = getthreadid();
    $('tr td span.name b').each(function(idx, elt) {
        var text = $(this).text();
        var name = fixname(text);
        var userid = nametoid(name, $(this));
        if (userid == troll) {
            var id = "" + troll + idx + "button";
            var $base = $(this).parent().parent().parent();
            $base.next().css("display", "none");
            $base.css("display", "none");
            if ($base.next().next().children().last().text() == text) {
                $("#"+id).css("display", "");
            } else {
                $base.next().next().children().append("<a title=\"Vis innlegg\" class=\"nav trollbutton\" id=\"" + id + "\">" + text + "</a>");
            }
            $("#"+id).click(function() {
                //console.log("calling showpost()");
                showpost(troll, idx);
            });
        }
    });
    updateusers(); // FIXME: optimize
}

function showtroll(troll) {
    removetroll(troll);
    $('tr td span.name b').each(function(idx, elt) {
        var name = fixname($(this).text());
        var userid = nametoid(name, $(this));
        if (userid == troll) {
            var id = "" + troll + idx + "button";
            var $base = $(this).parent().parent().parent();
            $base.next().css("display", "");
            $base.css("display", "");
            $("#"+id).css("display", "none");
        }
    });
    updateusers();
}

function hidetrolls() {
    var threadid = getthreadid();
    $.each(trolls, function(idx, troll) { hidetroll(troll); });
    if (threadid != -1 && threadblocks[threadid]) {
        $.each(Object.keys(threadblocks[threadid]), function(idx, troll) { hidetroll(troll); });
    }
}

/*
function getthreadid() {
    var threadid = -1;
    var url = window.location.href;
    if (url.match(/\bt=[0-9]/)) {
        threadid = url.replace(/.*\bt=/, "").replace(/\&.*$/, "");
    }
    if (threadid == -1) {
        var $topic = $("a.maintitle");
        if ($topic) {
            var topiclink = $topic.attr("href");
            if (topiclink && topiclink.match(/\bt=[0-9]/)) {
                threadid = topiclink.replace(/.*\bt=/, "").replace(/\&.*$/, "");
            }
        }
    }
    return threadid;
}

function markusers() {
    var threadid = getthreadid();
    var usernameupdate = false;
    $('tr td span.name b').each(function(idx, elt) {
        var namestr = $(this).text()
        var name = fixname(namestr);
        var userid = nametoid(name, $(this));
        var id = "" + userid + "-" + idx;
        $(this).parent().append(" <a class=\"nav\" id=\"" + id + "green\" title=\"Unblock\"><img src=\"" + green + "\" valign=\"middle\" width=\"12\" height=\"12\" border=\"0\"/></a>");
        $(this).parent().append(" <a class=\"nav\" id=\"" + id + "orange\" title=\"Unblock\"><img src=\"" + orange + "\" valign=\"middle\" width=\"12\" height=\"12\" border=\"0\"/></a>");
        $(this).parent().append(" <a class=\"nav\" id=\"" + id + "red\" title=\"Block\"><img src=\"" + red + "\" valign=\"middle\" width=\"12\" height=\"12\" border=\"0\"/></a>");
        $("#"+id+"green").click(function() {
            console.log("unblocking " + namestr + " (" + userid + ")");
            removetroll(userid);
            removethreadblock(userid, threadid);
            removetroll(name);
            showtroll(userid);
        });
        $("#"+id+"orange").click(function() {
            console.log("thread-blocking " + namestr + " (" + userid + ") for two days");
            addthreadblock(userid, threadid);
            hidetroll(userid);
        });
        $("#"+id+"red").click(function() {
            console.log("blocking " + namestr + " (" + userid + ")");
            addtroll(userid);
            hidetroll(userid);
        });
        if (usernames[userid] && usernames[userid] != namestr) {
            $(this).parent().append('<span class="nav" id="'+userid+'Alert"><br/>aka&nbsp;' + usernames[userid] + '&nbsp;<a title="Thank you!" id="'+
                                    userid+'OK"><img src="'+checkmark+'" width="12" height="12" border="0" valign="bottom"/></a><br/></span>');
            $("#"+userid+"OK").click(function() {
                usernames[userid] = namestr;
                saveusernames();
                $("#"+userid+"Alert").css("display", "none");
            });
        }
        else if (!usernames[userid]) {
            usernames[userid] = namestr;
            usernameupdate = true;
        }
    });
    if (usernameupdate) saveusernames();
}

function updateusers() {
    var url = window.location.href;
    var threadid = getthreadid();
    $('tr td span.name b').each(function(idx, elt) {
        var name = fixname($(this).text());
        var userid = nametoid(name, $(this));
        var id = "" + userid + "-" + idx;
        if (istroll(userid, threadid)) {
            $("#"+id+"green").css("display", "");
            $("#"+id+"orange").css("display", "none");
            $("#"+id+"red").css("display", "none");
        } else {
            $("#"+id+"green").css("display", "none");
            $("#"+id+"orange").css("display", "");
            $("#"+id+"red").css("display", "");
        }
    });
}

function addtoggle() {
    var url = window.location.href;
    if (url.indexOf("viewforum.php") != -1 ||
        (url.indexOf("search.php") != -1) && (url.indexOf("search_id") != -1)) {
        $("tr td span.nav a").each(function(idx, elt) {
            if (idx == 0 && $(elt).attr('href') == "index.php") {
                $(elt).closest("tr").append('<td align="right" valign="bottom"><a id="toptoggle" title="Show hidden"><img src="'+green+'" width="14" height="14" border="0"/>');
                $("#toptoggle").click(function() {
                    showthreads();
                });
            }
        });
    }
}

function addthread(threadid) {
    var newthreads = [];
    $.each(threads, function(i, t) {
        if (t != threadid)
            newthreads.push(""+t);
    });
    threads = newthreads;
    threads.push(""+threadid);
    savethreads();
}

function removethread(threadid) {
    var newthreads = [];
    $.each(threads, function(i, t) {
        if (t != threadid)
            newthreads.push(""+t);
    });
    threads = newthreads;
    savethreads();
}

function isblockedthread(threadid) {
    var result = false;
    $.each(threads, function(i, t) {
        if (t == threadid) result = true;
    });
    return result;
}

function markthreads() {
    $('span.topictitle').each(function(idx, elt) {
        var link = $(elt).find('a').first().attr('href');
        if (link && link.match(/\bt=/)) {
            var threadid = link.replace(/.*\bt=/g, "").replace(/[\&\?\#].*$/g, "");
            var topic = $(elt).text();
            var $elt = $(this).closest('tr');
            var html = " <a class=\"nav\" id=\"" + threadid + "green\" title=\"Show\"><img src=\"" + green + "\" valign=\"middle\" width=\"12\" height=\"12\"/></a>" +
                       " <a class=\"nav\" id=\"" + threadid + "red\" title=\"Hide\"><img src=\"" + red + "\" valign=\"middle\" width=\"12\" height=\"12\"/></a>";
            $elt.children().first().find("img").attr("width", "12");
            $elt.children().first().find("img").attr("height", "12");
            $elt.children().first().append(html);
            //console.log("topic: " + $(elt).text());
            //console.log("thread id: " + threadid);
            $("#"+threadid+"green").click(function() {
                console.log("unblocking thread " + threadid + " (" + topic + ")");
                removethread(threadid);
                updatethread(threadid);
            });
            $("#"+threadid+"red").click(function() {
                console.log("blocking thread " + threadid + " (" + topic + ")");
                addthread(threadid);
                hidethread(threadid);
                updatethread(threadid);
            });
        }
    });
}

function updatethread(threadid) {
    if (isblockedthread(threadid)) {
        $("#"+threadid+"green").css("display", "");
        $("#"+threadid+"red").css("display", "none");
        //$("#"+threadid+"green").closest('tr').css("display", "none");
    } else {
        $("#"+threadid+"green").css("display", "none");
        $("#"+threadid+"red").css("display", "");
        //$("#"+threadid+"green").closest('tr').css("display", "");
    }
}

function showthreads() {
    $.each(threads, function(idx, threadid) {
        $("#"+threadid+"green").closest('tr').css("display", "");
    });
}

function updatethreads() {
    $('span.topictitle > a').each(function(idx, elt) {
        var link = $(this).attr('href');
        if (link && link.match(/\bt=/)) {
            var threadid = link.replace(/.*\bt=/g, "").replace(/\&.*$/g, "");
            updatethread(threadid);
        }
    });
}

function hidethread(threadid) {
    $('tr td span.topictitle > a').each(function(idx, elt) {
        var link = $(this).attr('href');
        if (link && link.match(/\bt=/)) {
            var topic = $(elt).text();
            var id = link.replace(/.*\bt=/g, "").replace(/\&.*$/g, "");
            if (id == threadid) {
                var $base = $(this).closest('tr'); // parent().parent().parent();
                $base.css("display", "none");
                //console.log('hiding thread "' + topic + '"');
            }
       }
    });
}

function hidethreads() {
    $.each(threads, function(idx, threadid) { hidethread(threadid); });
}

addStyleString(".trollbutton { border-radius: 5px; color: #000000; padding: 4px; background-color: #aaaaaa; display: inline-block; cursor: pointer; }");

(async () => {
    await loadsettings();
    cleanthreadblocks();
    markusers();
    updateusers();
    hidetrolls();
    markthreads();
    updatethreads();
    hidethreads();
    addtoggle();
})();


*/