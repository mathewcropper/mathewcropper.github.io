---
layout: post
title: "Principles and Techniques of Evolutionary Architecture"
date: 2013-09-03
---

A couple of weeks ago Manchester Geek Nights ran a talk with Dr Rebecca Parsons on ‘Evolutionary Architecture’. It’s a great talk, which I’ve embedded below. It’s an hour long, but well worth your time if you can set it aside.

<iframe allowfullscreen="" frameborder="0" height="315" src="//www.youtube.com/embed/ZIsgHs0w44Y" width="420"></iframe>

Putting the more technical themes aside, there are practical project management/business analysis implications of using the principles in this talk. The one that stuck out for me, mainly because it was a new concept to me, was that of ‘contract testing’.

To avoid highly complex teams and structures every time you want to make a change in a highly interdependent architecture it makes sense to make each system or platform as autonomous as possible. With many clients I’ve seen them having to involve five or six other teams for regression testing whenever a change is made.

Contract testing flips this on its head. It basically says, ‘I know what my system is expecting to receive from you. Here’s a bunch of tests I’d like you to run whenever you change your system. You only need to talk to me if any of them fail.’

By delegating the act of regression testing based on the specification you have built for your own system you reduce the complexity of a project, the time taken to test it, the cost, and the time taken to get it to the production environment. You can take a similar approach to including commentary in a system’s specification/design docs, thereby capturing issues with design changes very early in the process, which is preferable for a great many [very obvious] reasons.

If you are building your company’s architecture to be agile and autonomous, I’d definitely recommend looking into ways to implement this approach.
