"battle.scheduler": [ function(e, a) {
"use strict";
cc._RF.push(a, "f17d1mmR81GAI9QxK2EIw6F", "battle.scheduler");
var t = {
REPEAT_FOREVER: 4294967294,
instanceId: 1e4,
setNewInstanceId: function(e) {
e.__instanceId = e.__instanceId || this.instanceId++;
},
arrayRemoveObject: function(e, a) {
for (var t = 0, n = e.length; t < n; t++) if (e[t] == a) {
e.splice(t, 1);
break;
}
},
ListEntry: function(e, a, t, n, i, r) {
this.prev = e;
this.next = a;
this.target = t;
this.priority = n;
this.paused = i;
this.markedForDeletion = r;
},
HashUpdateEntry: function(e, a, t, n) {
this.list = e;
this.entry = a;
this.target = t;
this.hh = n;
},
HashTimerEntry: function(e, a, t, n, i, r, s) {
var o = this;
o.timers = e;
o.target = a;
o.timerIndex = t;
o.currentTimer = n;
o.currentTimerSalvaged = i;
o.paused = r;
o.hh = s;
},
Timer: function(e, a, n, i, r) {
this._target = e;
this._callback = a;
this._elapsed = -1;
this._interval = n || 0;
this._delay = r || 0;
this._useDelay = this._delay > 0;
this._repeat = null == i ? t.REPEAT_FOREVER : i;
this._runForever = this._repeat == t.REPEAT_FOREVER;
}
};
t.Timer.prototype.getInterval = function() {
return this._interval;
};
t.Timer.prototype.setInterval = function(e) {
this._interval = e;
};
t.Timer.prototype.getCallback = function() {
return this._callback;
};
t.Timer.prototype._doCallback = function() {
"string" == typeof this._callback ? this._target[this._callback](this._elapsed) : this._callback.call(this._target, this._elapsed);
};
t.Timer.prototype.update = function(e) {
if (-1 == this._elapsed) {
this._elapsed = 0;
this._timesExecuted = 0;
} else {
var a = this._target, n = this._callback;
this._elapsed += e;
if (this._runForever && !this._useDelay) {
if (this._elapsed >= this._interval) {
a && n && this._doCallback();
this._elapsed = 0;
}
} else {
if (this._useDelay) {
if (this._elapsed >= this._delay) {
a && n && this._doCallback();
this._elapsed = this._elapsed - this._delay;
this._timesExecuted += 1;
this._useDelay = !1;
}
} else if (this._elapsed >= this._interval) {
a && n && this._doCallback();
this._elapsed = 0;
this._timesExecuted += 1;
}
this._timesExecuted > this._repeat && t.scheduler.unscheduleCallbackForTarget(a, n);
}
}
};
t.Scheduler = function() {
this._timeScale = 1;
this._updates = [ [], [], [] ];
this._hashForUpdates = {};
this._arrayForUpdates = [];
this._hashForTimers = {};
this._arrayForTimers = [];
this._currentTarget = null;
this._currentTargetSalvaged = !1;
this._updateHashLocked = !1;
};
t.Scheduler.prototype._removeHashElement = function(e) {
delete this._hashForTimers[e.target.__instanceId];
t.arrayRemoveObject(this._arrayForTimers, e);
e.Timer = null;
e.target = null;
e = null;
};
t.Scheduler.prototype._removeUpdateFromHash = function(e) {
var a = this._hashForUpdates[e.target.__instanceId];
if (a) {
t.arrayRemoveObject(a.list, a.entry);
delete this._hashForUpdates[a.target.__instanceId];
t.arrayRemoveObject(this._arrayForUpdates, a);
a.entry = null;
a.target = null;
}
};
t.Scheduler.prototype._priorityIn = function(e, a, n, i) {
var r = new t.ListEntry(null, null, a, n, i, !1);
if (e) {
for (var s = e.length - 1, o = 0; o <= s; o++) if (n < e[o].priority) {
s = o;
break;
}
e.splice(o, 0, r);
} else (e = []).push(r);
var l = new t.HashUpdateEntry(e, r, a, null);
this._arrayForUpdates.push(l);
this._hashForUpdates[a.__instanceId] = l;
return e;
};
t.Scheduler.prototype._appendIn = function(e, a, n) {
var i = new t.ListEntry(null, null, a, 0, n, !1);
e.push(i);
var r = new t.HashUpdateEntry(e, i, a, null);
this._arrayForUpdates.push(r);
this._hashForUpdates[a.__instanceId] = r;
};
t.Scheduler.prototype.setTimeScale = function(e) {
this._timeScale = e;
};
t.Scheduler.prototype.getTimeScale = function() {
return this._timeScale;
};
t.Scheduler.prototype.update = function(e) {
var a, t, n, i, r = this._updates, s = this._arrayForTimers;
this._updateHashLocked = !0;
1 != this._timeScale && (e *= this._timeScale);
for (n = 0, i = r.length; n < i && n >= 0; n++) for (var o = 0, l = (c = this._updates[n]).length; o < l; o++) (a = c[o]).paused || a.markedForDeletion || a.target.update(e);
for (n = 0, i = s.length; n < i && (t = s[n]); n++) {
this._currentTarget = t;
this._currentTargetSalvaged = !1;
if (!t.paused) for (t.timerIndex = 0; t.timerIndex < t.timers.length; t.timerIndex++) {
t.currentTimer = t.timers[t.timerIndex];
t.currentTimerSalvaged = !1;
t.currentTimer.update(e);
t.currentTimer = null;
}
if (this._currentTargetSalvaged && 0 == t.timers.length) {
this._removeHashElement(t);
n--;
}
}
for (n = 0, i = r.length; n < i; n++) {
var c;
for (o = 0, l = (c = this._updates[n]).length; o < l && (a = c[o]); ) a.markedForDeletion ? this._removeUpdateFromHash(a) : o++;
}
this._updateHashLocked = !1;
this._currentTarget = null;
};
t.Scheduler.prototype.scheduleCallbackForTarget = function(e, a, n, i, r, s) {
t.setNewInstanceId(e);
n = n || 0;
i = null == i ? t.REPEAT_FOREVER : i;
r = r || 0;
s = s || !1;
var o, l = this._hashForTimers[e.__instanceId];
if (!l) {
l = new t.HashTimerEntry(null, e, 0, null, null, s, null);
this._arrayForTimers.push(l);
this._hashForTimers[e.__instanceId] = l;
}
if (null == l.timers) l.timers = []; else for (var c = 0; c < l.timers.length; c++) if (a == (o = l.timers[c])._callback) {
o._interval = n;
return;
}
o = new t.Timer(e, a, n, i, r);
l.timers.push(o);
};
t.Scheduler.prototype.scheduleUpdateForTarget = function(e, a, n) {
if (null !== e) {
t.setNewInstanceId(e);
var i = this._updates, r = this._hashForUpdates[e.__instanceId];
r ? r.entry.markedForDeletion = !1 : 0 == a ? this._appendIn(i[1], e, n) : a < 0 ? i[0] = this._priorityIn(i[0], e, a, n) : i[2] = this._priorityIn(i[2], e, a, n);
}
};
t.Scheduler.prototype.unscheduleCallbackForTarget = function(e, a) {
if (null != e && null != a) {
var t = this._hashForTimers[e.__instanceId];
if (t) for (var n = t.timers, i = 0, r = n.length; i < r; i++) {
var s = n[i];
if (a == s._callback) {
s != t.currentTimer || t.currentTimerSalvaged || (t.currentTimerSalvaged = !0);
n.splice(i, 1);
t.timerIndex >= i && t.timerIndex--;
0 == n.length && (this._currentTarget == t ? this._currentTargetSalvaged = !0 : this._removeHashElement(t));
return;
}
}
}
};
t.Scheduler.prototype.unscheduleUpdateForTarget = function(e) {
if (null != e) {
var a = this._hashForUpdates[e.__instanceId];
null != a && (this._updateHashLocked ? a.entry.markedForDeletion = !0 : this._removeUpdateFromHash(a.entry));
}
};
t.Scheduler.prototype.unscheduleAllCallbacksForTarget = function(e) {
if (null != e) {
var a = this._hashForTimers[e.__instanceId];
if (a) {
var t = a.timers;
!a.currentTimerSalvaged && t.indexOf(a.currentTimer) >= 0 && (a.currentTimerSalvaged = !0);
t.length = 0;
this._currentTarget == a ? this._currentTargetSalvaged = !0 : this._removeHashElement(a);
}
this.unscheduleUpdateForTarget(e);
}
};
t.Scheduler.prototype.unscheduleAllCallbacks = function() {
this.unscheduleAllCallbacksWithMinPriority(t.Scheduler.PRIORITY_SYSTEM);
};
t.Scheduler.prototype.unscheduleAllCallbacksWithMinPriority = function(e) {
for (var a = this._arrayForTimers, t = this._updates, n = 0, i = a.length; n < i; n++) this.unscheduleAllCallbacksForTarget(a[n].target);
for (n = 2; n >= 0; n--) if (!(1 == n && e > 0 || 0 == n && e >= 0)) for (var r = t[n], s = 0, o = r.length; s < o; s++) this.unscheduleUpdateForTarget(r[s].target);
};
t.Scheduler.prototype.pauseAllTargets = function() {
return this.pauseAllTargetsWithMinPriority(t.Scheduler.PRIORITY_SYSTEM);
};
t.Scheduler.prototype.pauseAllTargetsWithMinPriority = function() {
for (var e, a = [], t = this._arrayForTimers, n = this._updates, i = 0, r = t.length; i < r; i++) if (e = t[i]) {
e.paused = !0;
a.push(e.target);
}
for (i = 0, r = n.length; i < r; i++) for (var s = n[i], o = 0, l = s.length; o < l; o++) if (e = s[o]) {
e.paused = !0;
a.push(e.target);
}
return a;
};
t.Scheduler.prototype.resumeTargets = function(e) {
if (e) for (var a = 0; a < e.length; a++) this.resumeTarget(e[a]);
};
t.Scheduler.prototype.pauseTarget = function(e) {
var a = this._hashForTimers[e.__instanceId];
a && (a.paused = !0);
var t = this._hashForUpdates[e.__instanceId];
t && (t.entry.paused = !0);
};
t.Scheduler.prototype.resumeTarget = function(e) {
var a = this._hashForTimers[e.__instanceId];
a && (a.paused = !1);
var t = this._hashForUpdates[e.__instanceId];
t && (t.entry.paused = !1);
};
t.Scheduler.prototype.isTargetPaused = function(e) {
var a = this._hashForTimers[e.__instanceId];
return !!a && a.paused;
};
t.Scheduler.PRIORITY_SYSTEM = -2147483648;
t.PRIORITY_NON_SYSTEM = t.Scheduler.PRIORITY_SYSTEM + 1;
t.scheduler = new t.Scheduler();
t._windowTimeIntervalId = 1;
t._windowTimeFunHash = {};
t.WindowTimeFun = function(e, a) {
this._intervalId = t._windowTimeIntervalId++;
this._code = e;
this._isTimeOut = a;
};
t.WindowTimeFun.prototype.fun = function() {
if (this._code) {
var e = this._code;
"string" == typeof e ? Function(e)() : "function" == typeof e && e.apply(null, this._args);
this._isTimeOut && delete t._windowTimeFunHash[this._intervalId];
}
};
t.setTimeout = function(e, a) {
var n = new t.WindowTimeFun(e, !0);
arguments.length > 2 && (n._args = Array.prototype.slice.call(arguments, 2));
t.scheduler.scheduleCallbackForTarget(n, n.fun, a / 1e3, 0, 0, !1);
t._windowTimeFunHash[n._intervalId] = n;
return n._intervalId;
};
t.setInterval = function(e, a) {
var n = new t.WindowTimeFun(e);
arguments.length > 2 && (n._args = Array.prototype.slice.call(arguments, 2));
t.scheduler.scheduleCallbackForTarget(n, n.fun, a / 1e3, t.REPEAT_FOREVER, 0, !1);
t._windowTimeFunHash[n._intervalId] = n;
return n._intervalId;
};
t.clearInterval = function(e) {
var a = t._windowTimeFunHash[e];
if (a) {
t.scheduler.unscheduleCallbackForTarget(a, a.fun);
delete t._windowTimeFunHash[e];
}
};
t.clearTimeout = t.clearInterval;
t.clearAllTimeout = function() {
var e;
for (var a in t._windowTimeFunHash) if (e = t._windowTimeFunHash[a]) {
t.scheduler.unscheduleCallbackForTarget(e, e.fun);
delete t._windowTimeFunHash[a];
}
};
t.pauseAllTimeout = function() {
var e;
for (var a in t._windowTimeFunHash) (e = t._windowTimeFunHash[a]) && t.scheduler.pauseTarget(e);
};
t.resumeAllTimeout = function() {
var e;
for (var a in t._windowTimeFunHash) {
e = t._windowTimeFunHash[a];
t.scheduler.resumeTarget(e);
}
};
a.exports = t;
cc._RF.pop();
}, {} ],
