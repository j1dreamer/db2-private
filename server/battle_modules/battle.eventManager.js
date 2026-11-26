"battle.eventManager": [ function(e, a) {
"use strict";
cc._RF.push(a, "0d955+VUthInrFXu/p4FvxE", "battle.eventManager");
var t = e("battle.characterEvent"), n = {
addEvent: function(e) {
switch (e.type) {
case "role":
case "missile":
case "mob":
t.addEventForCharacter(e);
}
}
};
a.exports = n;
cc._RF.pop();
}, {
"battle.characterEvent": "battle.characterEvent"
} ],
