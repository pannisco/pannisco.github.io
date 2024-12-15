var websiteName = "Peppe Meow DataBase";

var ready = (callback) => {
  if (document.readyState != "loading") callback();
  else document.addEventListener("DOMContentLoaded", callback);
}

ready(() => {
	
var tbExist = document.querySelector("table");
var trEmpty = tbExist.insertRow(1);
var tdEmpty = trEmpty.insertCell(0);

tdEmpty.setAttribute("colspan", "100");
tdEmpty.id = "not-found";
tdEmpty.innerHTML = "<center>Nessun file trovato :(</center>";

trEmpty.id = "not-found-border";
trEmpty.hidden = true;
	
// Search engine.
var listItems = [].slice.call(document.querySelectorAll('#list tbody tr'));
var inputElem = document.querySelector('#search');

inputElem.addEventListener("keyup", function() {
    var i,
	
    // Word sequence _matching_ to input. All, except last, words must be _complete_.
    e = "(^|.*[^\\pL])" + this.value.trim().split(/\s+/).join("([^\\pL]|[^\\pL].*[^\\pL])") + ".*$",
    n = RegExp(e, "i"),
	a = true;
	
    listItems.forEach((item) => {
        item.removeAttribute("hidden");
    });
	
    listItems.filter((item) => {
        i = item.querySelector("td").textContent.replace(/\s+/g, " ");
        return !n.test(i);
    }).forEach((item) => {
  	    item.hidden = true;
    });
		
	for (const tr of listItems) {
		if (tr.hidden == false) {
			a = false;
			break;
		}
	}
	
	if (a) trEmpty.hidden = false;
	else trEmpty.hidden = true;
});
	
// Working on nginx HTML and applying settings.
var currentDir = document.querySelector("span").textContent;

// Truncate long folder names.
if (currentDir.length > 20)
	currentDir = currentDir.substring(0, 19) + "...";

// Updating page title.
document.title = currentDir + " – " + websiteName;

});
