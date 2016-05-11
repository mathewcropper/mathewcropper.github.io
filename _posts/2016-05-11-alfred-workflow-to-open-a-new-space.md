---
layout: post
title: "Alfred workflow to open a new Space"
date: 2016-05-11
---

If you find yourself using Spaces a lot on Mac OS X, you may want a quicker way to create new ones using your keyboard.

I created an [Alfred](https://www.alfredapp.com) workflow to trigger Exposé and create a new Space, using the keyword `space`.

### Download

You're welcome to download the workflow [here](https://github.com/mathewcropper/mathewcropper.github.io/blob/master/assets/NewSpace.alfredworkflow?raw=true).

### How it works

The workflow consists of two parts:

1. Keyword input
2. Applescript

The input is a keyword, set to `space` with no arguments.

The Applescript is as follows, and consists of the normal Alfred `on` and `end` statements, a call to a script to open Mission Control, and another to then add a new Space.

```
on alfred_script(q)

do shell script "/Applications/Mission\\ Control.app/Contents/MacOS/Mission\\ Control"
delay 0.5
tell application "System Events" to click (every button whose value of attribute "AXDescription" is "add desktop") of group 1 of process "Dock"

end alfred_script
```

### Thanks

Thanks go to user [fartheraway](http://apple.stackexchange.com/users/90351/fartheraway) for their Stack Exchange answer [here](http://apple.stackexchange.com/questions/178762/using-applescript-to-create-spaces-and-launch-apps).
