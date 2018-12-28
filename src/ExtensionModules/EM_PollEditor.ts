import { ExtensionModule } from "./ExtensionModule";
import { RBKwebPageType } from "../Context/RBKwebPageType";
import { ConfigBuilder } from "../Configuration/ConfigBuilder";
import { ModuleConfiguration } from "../Configuration/ModuleConfiguration";
import { SettingType } from "../Configuration/SettingType";
import { ConfigurationOptionVisibility } from "../Configuration/ConfigurationOptionVisibility";

/**
 * EM_PollEditor - Extension module for RBKweb.
 */

// IDEA: add a constructd preview of the poll to preview view

export class PollEditor implements ExtensionModule {
    readonly name: string = "PollEditor";
    cfg: ModuleConfiguration;

    pageTypesToRunOn: Array<RBKwebPageType> = [
        RBKwebPageType.RBKweb_FORUM_POSTNEWTOPIC,
        RBKwebPageType.RBKweb_FORUM_EDITPOST,
    ];

    runBefore: Array<string> = ['late-extmod'];
    runAfter: Array<string> = ['early-extmod'];

    configSpec = () =>
        ConfigBuilder
            .Define()
            .WithExtensionModuleName(this.name)
            .EnabledByDefault()
            .WithDisplayName(this.name)
            .WithDescription('Denne modulen optimaliserer poll-editering')
            .WithConfigOption(opt =>
                opt
                    .WithSettingName("polls")
                    .WithSettingType(SettingType.text)
                    .WithVisibility(ConfigurationOptionVisibility.Never)
                    .WithDefaultValue('{}')
            )
            .Build();

    polls = {};

    addURL: string;
    subURL: string;
    saveURL: string;

    language: string;

    init = (config: ModuleConfiguration) => {
        this.cfg = config;
        var pollscfg = this.cfg.GetSetting("polls") as string;
        this.polls = JSON.parse(pollscfg);
    }

    preprocess = () => {
        this.addURL = chrome.runtime.getURL("/img/add.png");
        this.subURL = chrome.runtime.getURL("/img/sub.png");
        this.saveURL = chrome.runtime.getURL("/img/save.png");
    }

    pageBodyTable: HTMLTableElement;
    addPollHeading: HTMLTableHeaderCellElement;
    addPollHeadingRow: HTMLTableRowElement;

    tr_no = {
        "Add a Poll": "Legg til en avstemning",
        "Insert above": "Legg til alternativ",
        "Delete": "Slett",
        "Add option": "Legg til alternativ",
        "Remember poll": "Lagre oppsett",
        "Saved polls": "Lagrede avstemninger",
        "Poll option": "Avstemningens alternativ",
        "(3 last)": "(3 siste)"
    }

    tr = {}

    private i18n(text: string): string {
        if (this.tr[text]) return this.tr[text];
        return text;
    }

    execute = () => {
        try {
            // FIXME: check if poll is already filled in and we've pressed preview

            document.body.querySelectorAll('tr th.thHead').forEach(function(elt: HTMLTableHeaderCellElement, key, parent) {
                if (elt.textContent == "Add a Poll" || elt.textContent == "Legg til en avstemning") { // også for norsk språk?
                    this.addPollHeading = elt;
                    this.addPollHeadingRow = elt.closest('tr') as HTMLTableRowElement;
                    this.pageBodyTable = elt.closest('table');
                    this.language = elt.textContent == "Add a Poll" ? "english" : "norwegian";
                    if (this.language == "norwegian") this.tr = this.tr_no;
                }
            }.bind(this));

            if (!this.addPollHeading) return;

            this.injectSavedPolls();

            // check if we are editing a poll already
            var initialopen = false;
            this.pageBodyTable.querySelectorAll('input[name*="poll_option_text"]').forEach(
                function(input: HTMLInputElement, key, parent) {
                    if (input.value != "") initialopen = true;
                }.bind(this));

            if (!initialopen) {
                // initially hide poll
                var elt = this.addPollHeadingRow;
                var next = elt.nextElementSibling as HTMLTableRowElement;
                while (next) {
                    if (!(next.firstElementChild as HTMLTableCellElement).classList.contains('catBottom'))
                        next.classList.add('RUSKHiddenItem');
                    next = next.nextElementSibling as HTMLTableRowElement;
                }

                // add button action to unhide poll GUI
                this.addPollHeading.innerHTML = '<a id="RUSKAddPoll" class="trollbutton">'
                    + this.i18n('Add a Poll') + '</a>';
                var button = this.addPollHeading.querySelector('a') as HTMLAnchorElement;
                button.addEventListener('click', function(ev) {
                    this.addPollHeading.innerHTML = this.i18n('Add a Poll');
                    var elt = this.addPollHeadingRow.nextElementSibling as HTMLTableRowElement;
                    while (elt) {
                        if (elt.classList.contains('RUSKHiddenItem'))
                            elt.classList.remove('RUSKHiddenItem');
                        elt = elt.nextElementSibling as HTMLTableRowElement;
                    }
                }.bind(this));
            }

            // remov all unnecessary form-submit buttons
            function removeInputElement(elt: HTMLInputElement, key, parent) { elt.remove(); };
            this.pageBodyTable.querySelectorAll('input[name="edit_poll_option"]').forEach(removeInputElement);
            this.pageBodyTable.querySelectorAll('input[name="add_poll_option"]').forEach(removeInputElement);
            this.pageBodyTable.querySelectorAll('input[name^="del_poll_option"]').forEach(removeInputElement);

            // reconstruct dynamic poll-manip-buttons
            this.pageBodyTable.querySelectorAll('input[name^="poll_option_text"]').forEach(
                function(input: HTMLInputElement, key, parent) {
                    input.parentElement.insertAdjacentHTML('afterend',
                        ' &nbsp;' +
                        ' <a id="quickinsert'+this.counter+'" title="' + this.i18n('Insert above') +
                         '"><img src="'+this.addURL+'" width="12" valign="middle"/></a>' +
                        ' <a id="quickdel'+this.counter+'" title="' + this.i18n('Delete') + '"><img src="'+this.subURL+'" width="14" height="14" valign="middle"/></a>');
                    var quickdel = this.pageBodyTable.querySelector('#quickdel'+this.counter) as HTMLAnchorElement;
                    var quickinsert = this.pageBodyTable.querySelector('#quickinsert'+this.counter) as HTMLAnchorElement;
                    quickdel.addEventListener('click', function(ev) {
                        quickdel.closest("tr").remove();
                        this.reindexPollItems();
                    }.bind(this));
                    quickinsert.addEventListener('click', function(ev) {
                        this.addOptionBefore(quickinsert.closest("tr") as HTMLTableRowElement, "");
                        this.reindexPollItems();
                    }.bind(this));
                    this.counter += 1;
                }.bind(this));
            var addoption = this.pageBodyTable.querySelector('input[name="add_poll_option_text"]') as HTMLInputElement;
            addoption.parentElement.insertAdjacentHTML('afterend', ' &nbsp; <a id="quickadd" title="' +
                 this.i18n('Add option') + '"><img src="'+this.addURL+'" width="12" valign="middle"/></a>');
            var lastadd = this.pageBodyTable.querySelector('#quickadd') as HTMLAnchorElement;
            lastadd.addEventListener('click', function(ev) {
                this.quickAddClicked();
            }.bind(this));

            // set up for saving poll
            var titleinput = this.pageBodyTable.querySelector('input[name="poll_title"]') as HTMLInputElement;
            titleinput.parentElement.parentElement.insertAdjacentHTML('beforeend',
                ' &nbsp; <a id="quicksave" title="' + this.i18n('Remember poll') +
                '"><img src="'+this.saveURL+'" width="12" valign="middle"/></a>');
            var savelink = this.pageBodyTable.querySelector('a#quicksave') as HTMLAnchorElement;
            savelink.addEventListener('click', function(ev) {
                this.scrapePoll();
                this.storePolls();
                this.injectSavedPolls();
            }.bind(this));
        } catch (e) {
            console.log("exception: " + e.message);
        }
    }

    private storePolls(): void {
        var pollsaves = JSON.stringify(this.polls);
        this.cfg.ChangeSetting("polls", pollsaves);
    }

    private reindexPollItems(): void {
        var idx = 0;
        this.pageBodyTable.querySelectorAll('tr td input[name^="poll_option_text"]').forEach(
            function(elt: HTMLInputElement, key, parent) {
                elt.setAttribute('name', 'poll_option_text['+idx+']');
                idx += 1;
            }.bind(this));
    }

    private injectSavedPolls(): void {
        var row = this.pageBodyTable.querySelector('tr#savedpolls');
        if (row) row.remove();

        if (this.polls['_order']) {
            var anchor = this.pageBodyTable.querySelector('input[name="poll_title"]') as HTMLAnchorElement;
            var pollactions = [];
            this.polls['_order'].forEach(function(title, idx) {
                pollactions.push('"<a id="poll' + idx + '" class="nav">' + title + '</a>"');
            });
            var titlerow = anchor.closest("tr") as HTMLTableRowElement;
            titlerow.insertAdjacentHTML('beforebegin', '<tr id="savedpolls">' +
                            '<td class="row1"><span class="gen"><b>' + this.i18n('Saved polls') + '</b></span></td>' +
                            '<td class="row2"><span class="gen">' + pollactions.join(", ") + ' ' + this.i18n('(3 last)') + '</span></td>' +
                            '</tr>');
            this.polls['_order'].forEach(function(title, idx) {
                (this.pageBodyTable.querySelector("a#poll"+idx) as HTMLAnchorElement).addEventListener('click',
                    function(ev) {
                        var poll = this.polls['_order'][idx];
                        this.fillPoll(poll);
                    }.bind(this));
            }.bind(this));
        }
    }

    private clearPoll(): void {
        this.pageBodyTable.querySelectorAll('input[name^="poll_option_text"]').forEach(
            function(elt: HTMLInputElement, key, parent) { elt.closest("tr").remove(); }.bind(this));
        (this.pageBodyTable.querySelector('input[name="poll_title"]') as HTMLInputElement).value = "";
        (this.pageBodyTable.querySelector('input[name="add_poll_option_text"]') as HTMLInputElement).value = "";
        (this.pageBodyTable.querySelector('input[name="poll_length"]') as HTMLInputElement).value = "0";
    }

    private fillPoll(poll: number): void {
        try {
            this.clearPoll();
            var data = this.polls[poll];
            if (data.poll_title)
                (this.pageBodyTable.querySelector('input[name="poll_title"]') as HTMLInputElement).value = data.poll_title;
            if (data.add_poll_option_text)
                (this.pageBodyTable.querySelector('input[name="add_poll_option_text"]') as HTMLInputElement).value = data.add_poll_option_text;
            if (data.poll_length)
                (this.pageBodyTable.querySelector('input[name="poll_length"]') as HTMLInputElement).value = data.poll_length;
            var loop = true;
            for (var idx = 0; loop; idx++) {
                var key = "poll_option_text["+idx+"]";
                if (data[key] !== undefined) {
                    this.quickAddClicked();
                    (this.pageBodyTable.querySelector('input[name="'+key+'"]') as HTMLInputElement).value = data[key];
                } else {
                    loop = false;
                }
            }
        } catch (e) {
            console.log("exception: " + e.message);
        }
    }

    private quickAddClicked(): void {
        //var numoptions = this.pageBodyTable.querySelectorAll('tr td input[name^="poll_option_text"]').length;
        var addinput = this.pageBodyTable.querySelector('input[name="add_poll_option_text"]') as HTMLInputElement;
        var addinputRow = addinput.closest('tr') as HTMLTableRowElement;
        var value = addinput.value;
        if (!value) value = "";
        addinput.value = "";
        this.addOptionBefore(addinputRow, value);
        this.reindexPollItems();
    }

    counter: number = 0;

    private addOptionBefore(row: HTMLTableRowElement, value: string): void {
        var numoptions = this.pageBodyTable.querySelectorAll('tr td input[name^="poll_option_text"]').length;
        row.insertAdjacentHTML('beforebegin', '<tr><td class="row1"><span class="gen"><b>' + this.i18n('Poll option') + '</b></span></td>' +
                   '<td class="row2"><span class="genmed">' +
                   '<input type="text" name="poll_option_text['+numoptions+']" size="50" class="post" maxlength="255" value="'+value+'">' +
                   '</span> &nbsp;' +
                   ' <a id="quickinsert'+this.counter+'" title="' + this.i18n('Insert above') + '"><img src="'+this.addURL+'" width="12" valign="middle"/></a>' +
                   ' <a id="quickdel'+this.counter+'" title="' + this.i18n('Delete') + '"><img src="'+this.subURL+'" width="14" height="14" valign="middle"/></a>' +
                   '</td></tr>');
        var quickdel = this.pageBodyTable.querySelector('a#quickdel'+this.counter) as HTMLAnchorElement;
        var quickinsert = this.pageBodyTable.querySelector('a#quickinsert'+this.counter) as HTMLAnchorElement;
        var thisrow = quickdel.closest('tr') as HTMLTableRowElement;
        quickdel.addEventListener('click', function(ev) {
            thisrow.remove();
            this.reindexPollItems();
        }.bind(this));
        quickinsert.addEventListener('click', function(ev) {
            this.addOptionBefore(thisrow, "");
            this.reindexPollItems();
        }.bind(this));
        this.counter += 1;
    }

    private scrapePoll(): void {
        // scrap into poll
        var poll = {};
        this.pageBodyTable.querySelectorAll('td.row2 span.genmed input.post').forEach(
            function(elt: HTMLInputElement, key, parent) {
                var name = elt.getAttribute('name');
                var value = elt.value;
                poll[name] = value;
            }.bind(this));

        // arrange poll into this.polls
        var title = poll['poll_title'];
        this.polls[title] = poll;
        if (this.polls['_order']) {
            var index = this.polls['_order'].indexOf(title);
            if (index != -1) this.polls['_order'].splice(index, 1);
            this.polls['_order'].splice(0, 0, title);
            this.polls['_order'].slice(3).forEach(function(remove, idx) { delete this.polls[remove]; }.bind(this));
            this.polls['_order'] = this.polls['_order'].slice(0, 3);
        } else {
            this.polls['_order'] = [title];
        }
    }
};