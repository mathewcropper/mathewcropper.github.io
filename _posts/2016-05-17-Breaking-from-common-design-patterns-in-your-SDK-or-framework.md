---
layout: post
title: "Breaking from common design patterns in your SDK or framework"
date: 2016-05-17
category: product
---

> Trigger warning: I'm going to call deviating from established iOS user interface patterns a hack. If that makes your blood boil, don't read on.

![](http://www.mathewcropper.co.uk/images/posts/20160517_navstack.jpeg)

When you see this, you know that you are on the settings page of an app. You know that tapping the 'back' button will whisk you to where you came from. 

This is a familiar iOS design pattern, and people understand how navigation controllers work. When you change it, **you fuck with people's minds**.

If you're building your own app, messing with people's expectations like that may make sense. For example, the pattern you use may be the same across all your apps and sites. Your users may get it, and that's cool.

### Building for the reasonable user

What if you're building something that goes into someone else's app? Say, you're building an SDK or framework with a UI.. What then?

Sure, you can hack at the navigation controller, for example, to get it to do what you want it to. Should you, the maker of an SDK, build support for that?

This is a question I get asked a lot. Hardly a week goes by without something along those lines hitting my inbox.

Unfortunately, I am a meanie and say no. Not without a great deal of soul searching first, I might add. I don't like to say no. 

When I build a UI for common consumption, for many use cases, I build it for the average person. I choose to build it such that any average iOS user can pick it up and use it instinctively. For that reason, I don't mess with [Apple's human interface guidelines](https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/). For this same reason (among others), our SDK requires a navigation controller.

### Bring on the technical debt

That in itself doesn't prevent us from allowing hacks, of course. Adding support for one UI hack sounds ok, but it's a downward spiral. It sets an unreasonable expectation of extensibility and support, in my opinion, and is a sure path to bloating the product. 

Folks don't like that argument, but anyone who has built software in the past will know it to be true. That ten minute hack is the technical debt you will kick yourself for in six months. This isn't good for the people using the product, it isn't good for the app consuming the SDK, and it's a veritable nightmare for the supplier or open source community. 

### Designing to give options (even if I don't like them)

To get around this, we decided to build our SDK in a particular way:

* The Zendesk SDK provides the full feature set with a UI. the UI follows Apple's human interface guidelines. 
* The Zendesk Provider SDK provides only the features in code.

Keeping the UI and the functionality separated gives the implementer the freedom to choose. They can choose to use our UI (and most do), or they can build their own.

Building yourself means having control over hacks, keeping that tech (and the tech debt) in your own back yard. It stops my product from being on the critical path when an iOS update hits and the hack doesn't work any more.

The extra development time is a pain, I know. Believe me, I know. In exchange for that, you get a leaner, more stable product. You get creative control over the implementation. You get what you want. 

"Should I, the owner of an SDK or framework, build into it something I consider to be a hack?" **No**, not without a great reason.

I would encourage anyone starting out, however, to design in such a way that if someone things it's THAT important, they could do so whilst taking the risk and technical debt themselves.